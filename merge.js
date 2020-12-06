function merge(target, source) {
  for (let prop in source) {
    if (source.hasOwnProperty(prop)) {
      if (Object.prototype.toString.call(source[prop]) === '[object Object]') {
        if (!target.hasOwnProperty(prop) || Object.prototype.toString.call(target[prop]) !== '[object Object]') {
          target[prop] = {}
        }
        merge(target[prop], source[prop]);
      } else {
        target[prop] = source[prop];
      }
    }
  }
};

module.exports = merge;
