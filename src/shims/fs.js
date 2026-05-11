export function createWriteStream() {
  throw new Error("File system streams are not available in the browser build.");
}

export function statSync() {
  throw new Error("File system access is not available in the browser build.");
}

const fs = {
  createWriteStream,
  statSync,
};

export default fs;
