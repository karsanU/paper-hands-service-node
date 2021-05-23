/*
// my implementation of queue 
class Queue {
    constructor(val) {
        this._head = undefined
        this._tail = undefined
        this._length = 0
        if (val !== undefined) {
            push(val)
        }
    }
    enqueue(val) {
        if (this._head === undefined) {
            this._head = new Node(val)
         } else if (this._head !== undefined) {
            this._tail = new Node(val)
            this._head.next = this._tail
         } else {
            const curr_node = new Node(val)
            this._tail.next = curr_node
            this._tail = curr_node
         }
         this.length++
    }
    dequeue() {
        const popped_value = u
        if(head === undefined) {
            return undefined 
        } else {
            popped_value = this.head.val
            curr_head = this.head.val
            this._head = this.head.next
            curr_head.next = undefined
            if(this_head === this._tail) {
                this._tail === undefined
            }
            this.length-- 
            return popped_value
        }
    }
};

class Node {
    constructor(val) {
        this.val = val
        this.next = null
    }
}

*/

class Queue {
  constructor() {
    this.items = {};
    this.headIndex = 0;
    this.tailIndex = 0;
  }

  enqueue(item) {
    this.items[this.tailIndex] = item;
    this.tailIndex++;
  }

  dequeue() {
    const item = this.items[this.headIndex];
    delete this.items[this.headIndex];
    this.headIndex++;
    return item;
  }

  peek() {
    return this.items[this.headIndex];
  }

  get length() {
    return this.tailIndex - this.headIndex;
  }
}

module.exports = Queue