export async function open() {
  throw new Error("File system access is not available in the browser build.");
}

export async function stat() {
  throw new Error("File system access is not available in the browser build.");
}

export async function unlink() {
  throw new Error("File system access is not available in the browser build.");
}

export async function writeFile() {
  throw new Error("File system access is not available in the browser build.");
}

export default {
  open,
  stat,
  unlink,
  writeFile,
};
