class RecorderProcessor extends AudioWorkletProcessor {
  bufferSize = 16000; // Size of the buffer (adjust as needed)
  _bytesWritten = 0; // Track the current buffer fill level
  _buffer = new Float32Array(this.bufferSize); // Create a buffer of fixed size

  constructor() {
    super();
    this.initBuffer();
  }

  initBuffer() {
    this._bytesWritten = 0;
  }

  isBufferEmpty() {
    return this._bytesWritten === 0;
  }

  isBufferFull() {
    return this._bytesWritten >= this.bufferSize;
  }

  /**
   * @param {Float32Array[][]} inputs
   * @returns {boolean}
   */
  process(inputs) {
    const input = inputs[0]; // Input from the audio stream
    if (input && input[0]) {
      this.append(input[0]); // Append the data from the first channel
    }

    return true;
  }

  /**
   * Append audio data to the buffer
   * @param {Float32Array} channelData
   */
  append(channelData) {
    if (!channelData) return;

    for (let i = 0; i < channelData.length; i++) {
      this._buffer[this._bytesWritten++] = channelData[i];

      if (this.isBufferFull()) {
        this.flush(); // Flush when the buffer is full
      }
    }
  }

  /**
   * Flush the buffer and send the downsampled data to the main thread
   */
  flush() {
    const bufferToSend =
      this._bytesWritten < this.bufferSize
        ? this._buffer.slice(0, this._bytesWritten)
        : this._buffer;

    const downsampledBuffer = this.downsampleBuffer(
      bufferToSend,
      44100, // Original sample rate
      16000 // Target sample rate
    );

    const pcmEncoded = this.pcmEncode(downsampledBuffer);

    // Send the downsampled buffer back to the main thread
    this.port.postMessage(pcmEncoded);
    this.initBuffer(); // Reset buffer for next chunk of audio
  }

  /**
   * Downsample the audio buffer from input sample rate to target sample rate
   * @param {Float32Array} buffer
   * @param {number} sampleRate
   * @param {number} outSampleRate
   * @returns {ArrayBuffer}
   */
  // downsampleBuffer(buffer, sampleRate, outSampleRate) {
  //   if (outSampleRate === sampleRate) return buffer;

  //   const sampleRateRatio = sampleRate / outSampleRate;
  //   const newLength = Math.round(buffer.length / sampleRateRatio);
  //   const result = new Int16Array(newLength);

  //   let offsetResult = 0;
  //   let offsetBuffer = 0;

  //   while (offsetResult < result.length) {
  //     const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
  //     let accum = 0,
  //       count = 0;

  //     for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
  //       accum += buffer[i];
  //       count++;
  //     }

  //     result[offsetResult] = Math.min(1, accum / count) * 0x7fff; // Convert to PCM 16-bit
  //     offsetResult++;
  //     offsetBuffer = nextOffsetBuffer;
  //   }

  //   return result.buffer; // Return as ArrayBuffer for transmission
  // }
  
  downsampleBuffer(buffer, inputSampleRate = 44100, outputSampleRate = 16000) {
        
    if (outputSampleRate === inputSampleRate) {
        return buffer;
    }
  
    var sampleRateRatio = inputSampleRate / outputSampleRate;
    var newLength = Math.round(buffer.length / sampleRateRatio);
    var result = new Float32Array(newLength);
    var offsetResult = 0;
    var offsetBuffer = 0;
    
    while (offsetResult < result.length) {
  
        var nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
  
        var accum = 0,
        count = 0;
        
        for (var i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++ ) {
            accum += buffer[i];
            count++;
        }
  
        result[offsetResult] = accum / count;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
  
    }
  
    return result;
  
  }

  pcmEncode(input) {
    var offset = 0;
    var buffer = new ArrayBuffer(input.length * 2);
    var view = new DataView(buffer);
    for (var i = 0; i < input.length; i++, offset += 2) {
        var s = Math.max(-1, Math.min(1, input[i]));
        view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return buffer;
  }
}

registerProcessor("recorder.worklet", RecorderProcessor);
