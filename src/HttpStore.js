var http = require('stream-http')

class HttpStore {

  constructor(storeUrl, packetSize) {

    try {
      http.get({
        path: storeUrl,
        mode: 'prefer-streaming'
      }, (res) => {
        res.on('data', this.handleData.bind(this))
        res.on('error', this.handleError.bind(this))
        res.on('end', this.handleEnd.bind(this))
      })
    } catch(err) {
      console.log("Request failed.")
      console.log(err)
    }

    this.bytesIn = 0;
    this.downloaded = 0;

    this.chunkCounter = 0;
    this.loading = true;
    this.bytesPerValue = 4;

    this.chunkTemp = [];
    this.chunkTempBuffer = null;

    this.packetSize = packetSize * this.bytesPerValue;

    this.queue = [];
  }

  // recieves data buffers from the http stream
  handleData(buf) {

    let cleanBuffer
      , rawBuffer = buf;

    // if there were stray bytes at the end of the last buffer, begin this buffer with them
    if(this.chunkTempBuffer !== null) {
      rawBuffer = Buffer.concat([this.chunkTempBuffer, buf])
      this.chunkTempBuffer = null;
    }

    // if the buffer isn't divisible by the size of our packets (4 bytes for 32bit float)
    if(rawBuffer.length % this.packetSize !== 0) {
      // store completed packets in the clean buffer
      cleanBuffer = new Buffer(rawBuffer.slice(0, rawBuffer.length - (rawBuffer.length % this.packetSize)));
      // and store the odd trailing bytes in a temporary buffer to be picked up in the next round
      this.chunkTempBuffer = new Buffer(rawBuffer.slice(rawBuffer.length - (rawBuffer.length % this.packetSize)))
    } else {
    // otherwise no transformations are neccessary
      cleanBuffer = rawBuffer;
    }

    // the clean buffer contains even numbers of float32 values packetSize long
    // queue this clean buffer of items to the queue,
    // along with its offset from the beginning of the file
    // and its length
    this.queue.push({
      buf: cleanBuffer,
      offset: this.chunkCounter,
      count: cleanBuffer.length
    })

    // record the length of this buffer to the total count
    this.chunkCounter += cleanBuffer.length;
    // console.log(`Downloaded ${this.chunkCounter} bytes for ${cleanBuffer.length} recs...`);
  }

  handleEnd(data) {
    this.loading = false;
    console.log("File download complete. 🐙");
  }

  handleError(code) {
    console.log(code);
  }

  // the update function returns all completed packets along to the view,
  // and then empties the queue, returns false if loading has completed
  getPackets() {
    if(this.loading || this.queue.length > 0) {
      let q = this.queue.concat([]);
      this.queue = [];
      // console.log(`Sending ${q.length} records...`);
      return q;
    }
    return false;
  }

}

module.exports = HttpStore;
