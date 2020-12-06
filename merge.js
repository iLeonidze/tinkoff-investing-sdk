module.exports = (target, obj) => {
  let merger = (obj) => {
    for (let prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          if (!target.hasOwnProperty(prop)) {
            target[prop] = {}
          }
          target[prop] = merge(target[prop], obj[prop]);
        } else {
          target[prop] = obj[prop];
        }
      }
    }
  };
  merger(obj);
};
