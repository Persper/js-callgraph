
const { LinkedList } = require('../../src/linkedList');

test('test LinkedList', () => {
    let ll = new LinkedList();
    expect(ll.isEmpty()).toBe(true);
    ll.add(10);
    expect(ll.size).toBe(1);
    ll.add(20);
    ll.add(30);
    ll.add(40);
    ll.add(50);
    expect(ll.size).toBe(5);
    expect(ll.has(30)).toBe(true);
    expect(ll.has(10)).toBe(true);
    ll.remove(30);
    ll.remove(10);
    expect(ll.has(30)).toBe(false);
    expect(ll.has(10)).toBe(false);
    expect(ll.size).toBe(3);
    let lst = [];
    for (let lnode of ll) {
        lst.push(lnode);
    }
    expect(lst).toStrictEqual([50, 40, 20]);
    ll.remove(50);
    ll.remove(40);
    ll.remove(20);
    expect(ll.size).toBe(0);
    expect(ll.isEmpty()).toBe(true);
});
