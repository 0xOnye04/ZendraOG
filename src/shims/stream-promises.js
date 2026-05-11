export async function pipeline() {
  throw new Error("stream/promises is not available in the browser.");
}

export async function finished() {
  throw new Error("stream/promises is not available in the browser.");
}

export default {
  pipeline,
  finished,
};
