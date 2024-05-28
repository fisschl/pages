// recorder-worklet.js
class RecorderWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 2048; // 缓冲区大小
    this.sampleRate = 16000;
    this.inputBuffer = new Float32Array(this.bufferSize);
    this.outputBuffer = new Int16Array(this.bufferSize); // 16位PCM
  }

  process([[input]], [[output]]) {
    console.log(input, output);
    // 处理单声道输入
    for (let i = 0; i < this.bufferSize; i++) {
      this.inputBuffer[i] = input[i];
    }

    // 将浮点数转换为16位PCM数据
    for (let i = 0; i < this.bufferSize; i++) {
      let sample = Math.max(-1, Math.min(1, this.inputBuffer[i]));
      this.outputBuffer[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }

    // 将16位PCM数据拷贝到输出
    for (let i = 0; i < this.bufferSize; i++) {
      output[i] = this.outputBuffer[i] / 0x7fff;
    }

    // 这里可以添加将PCM数据发送到主线程的逻辑
    // ...

    return true;
  }
}

registerProcessor("recorder", RecorderWorklet);
