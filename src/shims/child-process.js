export function spawn() {
  throw new Error("child_process is not available in the browser.");
}

export default {
  spawn,
};
