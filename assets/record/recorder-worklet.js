class AudioProcessor extends AudioWorkletProcessor {
  process([input]) {
    if (!input) return true;
    const [data] = input;
    if (!data) return true;
    this.port.postMessage(data);
    return true;
  }
}

registerProcessor("audio-processor", AudioProcessor);
