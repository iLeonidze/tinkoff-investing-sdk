function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function sleep(time, shift = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, randomIntFromInterval(time, time + shift));
  });
}

module.exports = sleep;
