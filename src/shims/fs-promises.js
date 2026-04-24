export async function open() {
  throw new Error("File system access is not available in the browser build.");
}

export default {
  open,
};
