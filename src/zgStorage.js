import { Blob as ZgBlob, Indexer } from "@0glabs/0g-ts-sdk/browser";

function normalizeStorageError(error) {
  return error?.shortMessage || error?.reason || error?.message || "0G storage failed.";
}

async function storeJsonOn0G({ payload, indexerRpc, evmRpc, signer }) {
  if (!indexerRpc) {
    throw new Error("Missing 0G indexer RPC.");
  }
  if (!evmRpc) {
    throw new Error("Missing 0G EVM RPC.");
  }
  if (!signer) {
    throw new Error("Missing wallet signer for 0G storage.");
  }

  const browserBlob = new window.Blob([JSON.stringify(payload, null, 2)], {
    type: "application/json",
  });
  const file = new ZgBlob(browserBlob);
  const [tree, treeError] = await file.merkleTree();
  if (treeError) {
    throw new Error(normalizeStorageError(treeError));
  }

  const rootHash = tree?.rootHash?.() || "";
  const indexer = new Indexer(indexerRpc);
  const [tx, uploadError] = await indexer.upload(file, evmRpc, signer);
  if (uploadError) {
    throw new Error(normalizeStorageError(uploadError));
  }

  return {
    rootHash,
    txHash: tx?.hash || tx?.transactionHash || "",
    tx,
  };
}

export async function storeWalletAnalysisResults({
  address,
  chain,
  summary,
  assets,
  insights,
  indexerRpc,
  evmRpc,
  signer,
}) {
  return storeJsonOn0G({
    payload: {
      type: "wallet-analysis",
      storedAt: new Date().toISOString(),
      wallet: {
        address,
        chain,
      },
      summary,
      insights,
      assets: Array.isArray(assets) ? assets : [],
    },
    indexerRpc,
    evmRpc,
    signer,
  });
}

export async function storeDashboardSnapshot({
  reason,
  storage,
  indexerRpc,
  evmRpc,
  signer,
}) {
  return storeJsonOn0G({
    payload: {
      type: "dashboard-snapshot",
      storedAt: new Date().toISOString(),
      reason,
      storage,
    },
    indexerRpc,
    evmRpc,
    signer,
  });
}
