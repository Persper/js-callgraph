
class ListNode {
    constructor(ele) {
        this._ele = ele;
        this._next = null;
    }

    set next(value) {
        this._next = value;
    }

    get next() {
        return this._next;
    }

    get element() {
        return this._ele;
    }
}

class LinkedList {
    constructor() {
        this._head = null;
        this._size = 0;
    }

    // simply adds ele to the head of the list
    add(ele) {
        let lnode = new ListNode(ele);
        lnode.next = this._head;
        this._head = lnode;
        this._size++;
    }

    // returns the removed element, or if its not found it returns -1
    remove(ele) {
        let current = this._head;
        let prev = null;
        while (current !== null) {
            if (current.element === ele) {
                if (prev === null) {
                    this._head = current.next;
                }
                else {
                    prev.next = current.next;
                }
                this._size--;
                return current.element;
            }
            prev = current;
            current = current.next;
        }
        return -1;
    }

    has(ele) {
        let current = this._head;
        while (current !== null) {
            if (current.element === ele)
                return true;
            current = current.next;
        }
        return false;
    }

    isEmpty() {
        return this._size === 0;
    }

    get size() {
        return this._size;
    }

    [Symbol.iterator]() {
        let value = null;
        let current = this._head;
        const iterator = {
            next: () => {
                if (current !== null) {
                    value = current;
                    current = current.next;
                    return {value: value.element, done: false}
                }
                else {
                    return {value: undefined, done: true};
                }
            }
        }
        return iterator;
    }
}

module.exports.LinkedList = LinkedList;
