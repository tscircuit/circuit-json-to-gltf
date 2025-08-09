export class BufferBuilder {
  private data: ArrayBuffer
  private view: DataView
  private offset: number
  
  constructor(initialSize: number = 1024 * 1024) {
    this.data = new ArrayBuffer(initialSize)
    this.view = new DataView(this.data)
    this.offset = 0
  }
  
  private ensureCapacity(additionalBytes: number) {
    if (this.offset + additionalBytes > this.data.byteLength) {
      const newSize = Math.max(
        this.data.byteLength * 2,
        this.offset + additionalBytes
      )
      const newData = new ArrayBuffer(newSize)
      const newView = new Uint8Array(newData)
      newView.set(new Uint8Array(this.data, 0, this.offset))
      this.data = newData
      this.view = new DataView(this.data)
    }
  }
  
  addFloat32(value: number): number {
    const byteOffset = this.offset
    this.ensureCapacity(4)
    this.view.setFloat32(this.offset, value, true) // little-endian
    this.offset += 4
    return byteOffset
  }
  
  addUint16(value: number): number {
    const byteOffset = this.offset
    this.ensureCapacity(2)
    this.view.setUint16(this.offset, value, true) // little-endian
    this.offset += 2
    return byteOffset
  }
  
  addUint32(value: number): number {
    const byteOffset = this.offset
    this.ensureCapacity(4)
    this.view.setUint32(this.offset, value, true) // little-endian
    this.offset += 4
    return byteOffset
  }
  
  addFloat32Array(values: number[]): number {
    const byteOffset = this.offset
    this.ensureCapacity(values.length * 4)
    for (const value of values) {
      this.view.setFloat32(this.offset, value, true)
      this.offset += 4
    }
    return byteOffset
  }
  
  addUint16Array(values: number[]): number {
    const byteOffset = this.offset
    this.ensureCapacity(values.length * 2)
    for (const value of values) {
      this.view.setUint16(this.offset, value, true)
      this.offset += 2
    }
    return byteOffset
  }
  
  addBytes(bytes: Uint8Array): number {
    const byteOffset = this.offset
    this.ensureCapacity(bytes.length)
    new Uint8Array(this.data, this.offset).set(bytes)
    this.offset += bytes.length
    return byteOffset
  }
  
  align(alignment: number = 4) {
    const remainder = this.offset % alignment
    if (remainder !== 0) {
      const padding = alignment - remainder
      this.ensureCapacity(padding)
      this.offset += padding
    }
  }
  
  getBuffer(): ArrayBuffer {
    return this.data.slice(0, this.offset)
  }
  
  getCurrentOffset(): number {
    return this.offset
  }
}