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

const path = {
  join,
  resolve,
};

export default path;
