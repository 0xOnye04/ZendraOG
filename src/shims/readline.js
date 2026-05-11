export function createInterface() {
  throw new Error("readline is not available in the browser build.");
}

export default {
  createInterface,
};
