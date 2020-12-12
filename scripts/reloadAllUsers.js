const calculateETA = require('../utils/calculateETA.js');

module.exports = async (session, storage, arguments) => {

  storage.profiles.loadAllProfiles();

  const yields = [];
  for (const profile of storage.profiles.getAllProfiles()) {
    const yield = profile.getYearRelativeYield();
    if (yield < 1) continue;
    yields.push({
      id: profile.profileId,
      yield
    });
  }

  yields.sort(function(a, b) {
    return b.yield - a.yield;
  });

  const timeStarted = new Date().getTime();

  const startFrom = arguments[0] || null;
  let startFromI = 0;
  let found = !startFrom;

  let currentI = 0;

  for (const yield of yields) {

    currentI++;
    if (startFrom && !found) {
      if (currentI === startFrom) {
        found = true;
        startFromI = currentI;
      } else {
        continue;
      }
    }

    const profile = storage.profiles.getProfile(yield['id']);
    await profile.resyncAll(session);
    const eta = calculateETA(timeStarted, currentI - startFromI, yields.length - startFromI);
    console.log(`${currentI}/${yields.length} ${Math.floor(currentI / yields.length * 100)}% --- ${eta} --- ${profile.getNickname()} ${profile.getYearRelativeYield()} ${profile.getMonthOperationsCount()} ${profile.getTotalAmountRange().lower} ${profile.getTotalAmountRange().lower > 100000 && profile.getMonthOperationsCount() > 5 ? '   !!!!!!!!!!' : ''}`);

  }

}
