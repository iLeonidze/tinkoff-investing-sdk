const ProfileCatalogEndpoint = require('../src/endpoints/social/ProfileCatalog.js');

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

async function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

module.exports = async (session, storage, arguments) => {

  const combinations = getCombinations('abcdefghijklmnopqrstuvwxyz1234567890_'.split(''), 3);

  const startFrom = arguments[0] || null;
  let found = !startFrom;

  let total = 0;

  for (const combination of combinations) {
    total++;
    if (startFrom && !found) {
      if (combination === startFrom) {
        found = true;
      } else {
        continue;
      }
    }
    console.log(`${combination} ${total}/${combinations.length} ${Math.floor(total / combinations.length * 10000) / 100}%`);
    await ProfileCatalogEndpoint.get({
      session,
      storage,
      nickname: combination
    });
    await sleep(1000);
  }

}
