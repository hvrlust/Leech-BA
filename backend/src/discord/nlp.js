// debugging
const console = (function () {
    let timestamp = function () { };
    timestamp.toString = function () {
        return "[" + (new Date).toLocaleTimeString() + "]";
    };
    return {
        log: this.console.log.bind(this.console, '%s', timestamp)
    }
})();