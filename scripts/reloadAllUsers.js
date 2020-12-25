const calculateETA = require('../utils/calculateETA.js');

module.exports = async (session, storage, arguments) => {

  storage.profiles.loadAllProfiles();

  const yields = [];
  for (const profile of storage.profiles.getAllProfiles()) {
    const yield = profile.getYearRelativeYield();
    const amount = profile.getTotalAmountRange().lower;
    const operations = profile.getMonthOperationsCount();
    if (yield < 10) continue;
    yields.push({
      id: profile.profileId,
      yield,
      amount
    });
  }

  yields.sort(function(a, b) {
    return b.yield - a.yield;
  });

  //yields.sort(function(a, b) {
  //  return b.amount - a.amount;
  //});

  const timeStarted = new Date().getTime();

  let startFrom = parseFloat(arguments[0]) || null;
  if (startFrom !== null) {
    startFrom = Math.floor(startFrom * 100) / 100
    console.log('Start required from', startFrom);
  }


  let startFromI = 0;
  let found = !startFrom;

  let currentI = 0;

  for (const yield of yields) {

    currentI++;
    if (startFrom && !found) {
      if ((Math.floor(yield['yield'] * 100) / 100) === startFrom) {
        found = true;
        startFromI = currentI;
      } else {
        continue;
      }
    }

    console.log('Current yild:', yield['yield']);

    const profile = storage.profiles.getProfile(yield['id']);
    await profile.resyncAll(session);
    const eta = calculateETA(timeStarted, currentI - startFromI, yields.length - startFromI);
    console.log(`${profile.profileId} ${currentI}/${yields.length} ${Math.floor(currentI / yields.length * 100)}% --- ${eta} --- ${profile.getNickname()} ${profile.getYearRelativeYield()} ${profile.getMonthOperationsCount()} ${profile.getTotalAmountRange().lower} ${profile.getInstruments().length}`);

  }

}
