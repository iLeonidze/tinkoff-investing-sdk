const timeConversion = require('./timeConversion.js');

function calculateETA(timeStart, currentItem, totalItems) {
  const currentTime = new Date().getTime();
  const totalTime = currentTime - timeStart;
  const perfomance = totalTime / currentItem;
  const eta = (totalItems - currentItem) * perfomance;
  return `ETA: ${timeConversion(eta)}, perfomance: ${Math.floor(perfomance)}ms/item, total time: ${timeConversion(totalTime)}`
}

module.exports = calculateETA;
