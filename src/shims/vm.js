export function runInNewContext() {
  throw new Error("VM APIs are not available in the browser build.");
}

const vm = {
  runInNewContext,
};

export default vm;
