function voegToe(callbackX, callbackY) {
    return callbackX() + callbackY();
}

voegToe(function() {
    return 1;
}, function() {
    return 2;
});