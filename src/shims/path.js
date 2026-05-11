function normalizeParts(parts) {
  return parts
    .filter((part) => part !== undefined && part !== null && part !== "")
    .map((part) => String(part).replace(/\\/g, "/"));
}

export function join(...parts) {
  return normalizeParts(parts).join("/").replace(/\/{2,}/g, "/");
}

export function resolve(...parts) {
  return join(...parts);
}

export function dirname(path) {
  const normalized = String(path || "").replace(/\\/g, "/");
  const segments = normalized.split("/");
  segments.pop();
  return segments.join("/") || ".";
}

export function basename(path) {
  const normalized = String(path || "").replace(/\\/g, "/");
  const segments = normalized.split("/");
  return segments.pop() || "";
}

const path = {
  basename,
  dirname,
  join,
  resolve,
};

export default path;
