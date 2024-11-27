import CRC32 from "crc-32";

function decodeEvent(message) {
  const messageView = new DataView(message);

  // Extract the prelude, headers, payload, and CRC
  const totalLength = messageView.getUint32(0);
  const headersLength = messageView.getUint32(4);
  const preludeCRC = messageView.getUint32(8);
  const prelude = message.slice(0, 8);

  const calculatedPreludeCRC = CRC32.buf(new Uint8Array(prelude)) >>> 0;
  if (preludeCRC !== calculatedPreludeCRC) {
    throw new Error("Prelude CRC check failed");
  }

  const headers = new Uint8Array(message.slice(12, 12 + headersLength));
  const payload = message.slice(12 + headersLength, -4);

  const messageCRC = messageView.getUint32(message.byteLength - 4);
  const calculatedMessageCRC =
    CRC32.buf(new Uint8Array(message.slice(0, message.byteLength - 4))) >>> 0;

  if (messageCRC !== calculatedMessageCRC) {
    throw new Error("Message CRC check failed");
  }

  // Parse the headers
  let offset = 0;
  const headersDict = {};
  while (offset < headers.length) {
    const nameLen = headers[offset];
    offset += 1;
    const name = new TextDecoder().decode(
      headers.slice(offset, offset + nameLen)
    );
    offset += nameLen;

    const valueType = headers[offset];
    offset += 1;

    const valueLen = new DataView(headers.buffer).getUint16(offset);
    offset += 2;

    const value = new TextDecoder().decode(
      headers.slice(offset, offset + valueLen)
    );
    headersDict[name] = value;
    offset += valueLen;
  }

  // Return headers and JSON payload
  return {
    headers: headersDict,
    payload: JSON.parse(new TextDecoder().decode(payload)),
  };
}

function createAudioEvent(payload) {
  const payloadBytes = new TextEncoder().encode(payload);

  // Build headers
  const contentTypeHeader = getHeaders(
    ":content-type",
    "application/octet-stream"
  );
  const eventTypeHeader = getHeaders(":event-type", "AudioEvent");
  const messageTypeHeader = getHeaders(":message-type", "event");
  const headers = new Uint8Array([
    ...contentTypeHeader,
    ...eventTypeHeader,
    ...messageTypeHeader,
  ]);

  // Calculate total byte length and headers byte length
  const totalByteLength = new Uint8Array(4);
  const headersByteLength = new Uint8Array(4);
  new DataView(totalByteLength.buffer).setUint32(
    0,
    headers.length + payloadBytes.length + 16
  ); // 16 bytes for the prelude and CRCs
  new DataView(headersByteLength.buffer).setUint32(0, headers.length);

  // Build the prelude
  const prelude = new Uint8Array([...totalByteLength, ...headersByteLength]);

  // Calculate checksum for prelude
  const preludeCRC = new Uint8Array(4);
  new DataView(preludeCRC.buffer).setUint32(0, CRC32.buf(prelude) >>> 0);

  // Construct the message
  const message = new Uint8Array([
    ...prelude,
    ...preludeCRC,
    ...headers,
    ...payloadBytes,
  ]);

  // Calculate checksum for the entire message
  const messageCRC = new Uint8Array(4);
  new DataView(messageCRC.buffer).setUint32(0, CRC32.buf(message) >>> 0);

  // Final message
  const finalMessage = new Uint8Array([...message, ...messageCRC]);

  return finalMessage;
}

function getHeaders(headerName, headerValue) {
  const nameBytes = new TextEncoder().encode(headerName);
  const nameByteLength = new Uint8Array([nameBytes.length]);
  const valueType = new Uint8Array([7]); // 7 represents a string
  const valueBytes = new TextEncoder().encode(headerValue);
  const valueByteLength = new Uint8Array(2);
  new DataView(valueByteLength.buffer).setUint16(0, valueBytes.length);

  // Combine header parts
  return new Uint8Array([
    ...nameByteLength,
    ...nameBytes,
    ...valueType,
    ...valueByteLength,
    ...valueBytes,
  ]);
}

function generateWebSocketKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 20; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

function pcmEncode(input) {
  var offset = 0;
  var buffer = new ArrayBuffer(input.length * 2);
  var view = new DataView(buffer);
  for (var i = 0; i < input.length; i++, offset += 2) {
      var s = Math.max(-1, Math.min(1, input[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
  return buffer;
}

function downsampleBuffer(buffer, inputSampleRate = 44100, outputSampleRate = 16000) {
      
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

export {
    decodeEvent,
    createAudioEvent,
    getHeaders,
    generateWebSocketKey,
    pcmEncode,
    downsampleBuffer
}