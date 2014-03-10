for (var i = stack.length - n, j = n - 1; j >= 0; j--, i++) {
    stack.push(stack[i]);
}