class MinHeap {
  constructor() {
    this.heap = [];
  }
  push(node) {
    this.heap.push(node);
    this.bubbleUp();
  }
  pop() {
    if (this.size() === 0) return null;
    if (this.size() === 1) return this.heap.pop();
    const top = this.heap[0];
    this.heap[0] = this.heap.pop();
    this.bubbleDown();
    return top;
  }
  bubbleUp() {
    let idx = this.heap.length - 1;
    while (idx > 0) {
      let pIdx = Math.floor((idx - 1) / 2);
      if (this.heap[pIdx].priority <= this.heap[idx].priority) break;
      [this.heap[pIdx], this.heap[idx]] = [this.heap[idx], this.heap[pIdx]];
      idx = pIdx;
    }
  }
  bubbleDown() {
    let idx = 0;
    while (true) {
      let left = 2 * idx + 1,
        right = 2 * idx + 2,
        smallest = idx;
      if (
        left < this.heap.length &&
        this.heap[left].priority < this.heap[smallest].priority
      )
        smallest = left;
      if (
        right < this.heap.length &&
        this.heap[right].priority <
          (smallest === idx ? Infinity : this.heap[smallest].priority)
      ) {
        if (this.heap[right].priority < this.heap[smallest].priority)
          smallest = right;
      }
      if (smallest === idx) break;
      [this.heap[idx], this.heap[smallest]] = [
        this.heap[smallest],
        this.heap[idx],
      ];
      idx = smallest;
    }
  }
  size() {
    return this.heap.length;
  }
}
module.exports = MinHeap;
