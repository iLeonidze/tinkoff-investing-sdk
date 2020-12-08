const fs = require('fs');
const ProfileCatalogEndpoint = require('../src/endpoints/social/ProfileCatalog.js');

function timeConversion(duration) {
  const portions = [];

  const msInHour = 1000 * 60 * 60;
  const hours = Math.trunc(duration / msInHour);
  if (hours > 0) {
    portions.push(hours + 'h');
    duration = duration - (hours * msInHour);
  }

  const msInMinute = 1000 * 60;
  const minutes = Math.trunc(duration / msInMinute);
  if (minutes > 0) {
    portions.push(minutes + 'm');
    duration = duration - (minutes * msInMinute);
  }

  const seconds = Math.trunc(duration / 1000);
  if (seconds > 0) {
    portions.push(seconds + 's');
  }

  return portions.join(' ');
}

function getCombinations(dictionary, size) {
  const combinations = [];
  for (const symbol of dictionary) {
    if (size > 1) {
      const subCombinations = getCombinations(dictionary, size - 1);
      for (subCombination of subCombinations) {
        combinations.push(`${symbol}${subCombination}`)
      }
    } else {
      combinations.push(symbol);
    }
  }
  return combinations;
}

function calculateETA(timeStart, currentItem, totalItems) {
  const currentTime = new Date().getTime();
  const totalTime = currentTime - timeStart;
  const perfomance = totalTime / currentItem;
  const eta = (totalItems - currentItem) * perfomance;
  return `ETA: ${timeConversion(eta)}, perfomance: ${Math.floor(perfomance)}ms/item, total time: ${timeConversion(totalTime)}`
}

module.exports = async (session, storage, arguments) => {

  const timeStarted = new Date().getTime();

  const combinations = getCombinations('abcdefghijklmnopqrstuvwxyz1234567890_.'.split(''), 3);

  const startFrom = arguments[0] || null;
  let startFromI = 0;
  let found = !startFrom;

  let currentI = 0;

  for (const combination of combinations) {
    currentI++;
    if (startFrom && !found) {
      if (combination === startFrom) {
        found = true;
        startFromI = currentI;
      } else {
        continue;
      }
    }

    let hasNext = true;
    let nextCursor = null;
    let previousProfilesAmount = fs.readdirSync(storage.profiles.fsLocation).length;
    while (hasNext) {

      const result = await ProfileCatalogEndpoint.get({
        session,
        storage,
        nickname: combination,
        nextCursor: nextCursor,
      });

      hasNext = result.hasNext();
      nextCursor = result.nextCursor;

      const eta = calculateETA(timeStarted, currentI - startFromI, combinations.length - startFromI);
      const currentUsers = fs.readdirSync(storage.profiles.fsLocation).length;

      console.log(`${combination} ${nextCursor ? nextCursor : 'initial'} ${currentI}/${combinations.length} ${Math.floor(currentI / combinations.length * 100)}% --- ${eta} --- profiles: ${fs.readdirSync(storage.profiles.fsLocation).length} +${(currentUsers - previousProfilesAmount)}`);

      previousProfilesAmount = currentUsers;

    }
  }

}
