const DEFAULT_OG_COMPUTE_RPC_URL = "https://evmrpc-testnet.0g.ai";
const DEFAULT_OG_COMPUTE_MODEL = "";
const DEFAULT_PROVIDER_ADDRESS = "";

type ChatMessage = { role: string; content: string };

let cachedSdkModule: any = null;
let cachedReadOnlyBroker: any = null;

function readRuntimeConfig(key: string, fallbackValue = "") {
  const runtime = (window as any).ZENDRA_CONFIG || {};
  const envKey = `VITE_${String(key)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase()}`;
  const envValue = (import.meta as any).env?.[envKey];
  const localValue = window.localStorage.getItem(`zendra_${key}`) || "";
  return runtime[key] || envValue || localValue || fallbackValue;
}

export function getOgComputeConfig() {
  return {
    rpcUrl: readRuntimeConfig("ogComputeRpcUrl", DEFAULT_OG_COMPUTE_RPC_URL),
    model: readRuntimeConfig("ogComputeModel", DEFAULT_OG_COMPUTE_MODEL),
    providerAddress: readRuntimeConfig("ogComputeProviderAddress", DEFAULT_PROVIDER_ADDRESS),
  };
}

export function saveOgComputeConfig({
  rpcUrl,
  model,
  providerAddress,
}: {
  rpcUrl?: string;
  model?: string;
  providerAddress?: string;
}) {
  persistConfigValue("ogComputeRpcUrl", rpcUrl || DEFAULT_OG_COMPUTE_RPC_URL);
  persistConfigValue("ogComputeModel", model || DEFAULT_OG_COMPUTE_MODEL);
  persistConfigValue("ogComputeProviderAddress", providerAddress || DEFAULT_PROVIDER_ADDRESS);
}

function persistConfigValue(key: string, value?: string) {
  const normalized = String(value || "").trim();
  if (normalized) {
    window.localStorage.setItem(`zendra_${key}`, normalized);
    return;
  }

  window.localStorage.removeItem(`zendra_${key}`);
}

async function loadComputeSdk() {
  if (cachedSdkModule) {
    return cachedSdkModule;
  }

  cachedSdkModule = await import("@0gfoundation/0g-compute-ts-sdk");
  return cachedSdkModule;
}

async function getReadOnlyBroker() {
  const config = getOgComputeConfig();
  if (cachedReadOnlyBroker && cachedReadOnlyBroker.__rpcUrl === config.rpcUrl) {
    return cachedReadOnlyBroker;
  }

  const sdk = await loadComputeSdk();
  const broker = await sdk.createZGComputeNetworkReadOnlyBroker(config.rpcUrl);
  broker.__rpcUrl = config.rpcUrl;
  cachedReadOnlyBroker = broker;
  return broker;
}

export async function createOgComputeBroker(signer: any) {
  if (!signer) {
    throw new Error("Connect a trader wallet before using 0G Compute Direct mode.");
  }

  const sdk = await loadComputeSdk();
  return sdk.createZGComputeNetworkBroker(signer);
}

export async function listOgComputeProviders() {
  const broker = await getReadOnlyBroker();
  const services = await broker.inference.listServiceWithDetail(0, 50, false);
  return services.filter((service: any) => String(service?.serviceType || "").toLowerCase() === "chatbot");
}

export async function resolveOgChatProvider({
  signer,
  preferredProviderAddress,
}: {
  signer?: any;
  preferredProviderAddress?: string;
}) {
  const services = await listOgComputeProviders();
  if (!services.length) {
    throw new Error("No 0G chatbot providers are currently available.");
  }

  const preferred = String(preferredProviderAddress || getOgComputeConfig().providerAddress || "").toLowerCase();
  let selected = preferred
    ? services.find((service: any) => String(service.provider || "").toLowerCase() === preferred)
    : null;

  if (!selected) {
    selected = services.find((service: any) => service.healthMetrics?.status === "healthy") || services[0];
  }

  const providerAddress = selected.provider;
  const metadataBroker = signer ? await createOgComputeBroker(signer) : await getReadOnlyBroker();
  const { endpoint, model } = await metadataBroker.inference.getServiceMetadata(providerAddress);

  return {
    providerAddress,
    endpoint,
    model,
    service: selected,
  };
}

export async function runOgDirectChatCompletion({
  signer,
  messages,
  preferredProviderAddress,
  preferredModel,
  verifyResponse = true,
  signal,
}: {
  signer: any;
  messages: ChatMessage[];
  preferredProviderAddress?: string;
  preferredModel?: string;
  verifyResponse?: boolean;
  signal?: AbortSignal;
}) {
  const broker = await createOgComputeBroker(signer);
  const provider = await resolveOgChatProvider({
    signer,
    preferredProviderAddress,
  });

  const configuredModel = preferredModel || getOgComputeConfig().model || "";
  const supportedModel = provider.model || "";
  const finalModel = configuredModel && configuredModel === supportedModel
    ? configuredModel
    : supportedModel || configuredModel;
  const contentForBilling = JSON.stringify(messages);
  const headers = await broker.inference.getRequestHeaders(provider.providerAddress, contentForBilling);

  const response = await fetch(`${String(provider.endpoint).replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({
      model: finalModel,
      messages,
    }),
  });

  if (!response.ok) {
    throw await buildProviderError(response, "0G provider chat request failed");
  }

  const payload = await response.json();
  const text = payload?.choices?.[0]?.message?.content || "";
  const chatId = response.headers.get("ZG-Res-Key")
    || response.headers.get("zg-res-key")
    || payload?.id
    || payload?.chatID;

  let verification = null;
  if (verifyResponse && chatId) {
    verification = await broker.inference.processResponse(provider.providerAddress, chatId, JSON.stringify(payload?.usage || {}));
  }

  return {
    text,
    raw: payload,
    usage: payload?.usage || null,
    model: payload?.model || finalModel,
    endpoint: provider.endpoint,
    providerAddress: provider.providerAddress,
    service: provider.service,
    headers,
    chatId,
    verification,
  };
}

async function buildProviderError(response: Response, fallbackMessage: string) {
  let details = "";
  try {
    details = (await response.text()).trim();
  } catch {
    details = "";
  }

  return new Error(details ? `${fallbackMessage} (${response.status}): ${details.slice(0, 220)}` : `${fallbackMessage} (${response.status}).`);
}
