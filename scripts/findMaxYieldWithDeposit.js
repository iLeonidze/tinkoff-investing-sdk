const simpleTable = require('../utils/simpleTable.js');

module.exports = async (session, storage, arguments) => {

  storage.profiles.loadAllProfiles();

  const yields = [];
  let positiveTraders = 0;
  let positiveTradersSumm = 0;
  let positiveTraders1000 = 0;
  let positiveTraders1000Summ = 0;
  let positiveTraders500 = 0;
  let positiveTraders500Summ = 0;
  let positiveTraders100 = 0;
  let positiveTraders100Summ = 0;
  let positiveTraders10 = 0;
  let positiveTraders10Summ = 0;

  let filteredAmount = 0;
  let amountMillion = 0;
  let amountTenMillions = 0;
  let amountOther = 0;

  let amountMillionSumm = 0;
  let amountTenMillionSumm = 0;
  let amountOtherSumm = 0;

  let totalProfiles = 0;

  for (const profile of storage.profiles.getAllProfiles()) {

    totalProfiles++;

    const yield = profile.getYearRelativeYield();
    const amount = profile.getTotalAmountRange().lower;
    const operations = profile.getMonthOperationsCount();

    if (amount < 100000 || yield < 10 || operations < 1) {
      filteredAmount++;
      continue;
    }

    positiveTraders++;
    positiveTradersSumm += yield;

    if (amount < 1000000) {
      amountMillion++;
      amountMillionSumm += yield;
    } else if (amount < 10000000) {
      amountTenMillions++;
      amountTenMillionSumm += yield;
    } else {
      amountOther++;
      amountOtherSumm += yield;
    }

    if (yield > 1000) {
      positiveTraders1000++;
      positiveTraders1000Summ += yield;
    } else if (yield > 500) {
      positiveTraders500++;
      positiveTraders500Summ += yield;
    } else if (yield > 100) {
      positiveTraders100++;
      positiveTraders100Summ += yield;
    } else if (yield > 10) {
      positiveTraders10++;
      positiveTraders10Summ += yield;
    }

    yields.push({
      id: profile.profileId,
      yield,
      amount
    });

  }

  yields.sort(function(a, b) {
    return b.yield - a.yield;
  });

  yields.sort(function(a, b) {
    return b.amount - a.amount;
  });

  //const filteredYields = yields.filter(yield => yield['yield'] < 501);

  const result = [['id', 'nickname', 'yield', 'operations', 'deposit', 'followers', 'following']];

  for (let i = 0; i < 1000; i++) {
    //if (yield[i]['yield'] > 500) {
    //  continue;
    //}
    const profile = storage.profiles.getProfile(yields[i]['id']);
    result.push([profile.profileId, profile.getNickname(), profile.getYearRelativeYield(), profile.getMonthOperationsCount(), profile.getTotalAmountRange().lower, profile.getFollowersCount(), profile.getFollowingCount()]);
  }

  console.log();
  console.log('Total traders:', totalProfiles);
  console.log('Minor traders:', filteredAmount, `${Math.floor(filteredAmount / totalProfiles * 100)}%`);
  console.log('Major traders:', positiveTraders, `${Math.floor(positiveTraders / totalProfiles * 100)}%`, `~y: ${Math.floor(positiveTradersSumm / positiveTraders)}%`);
  console.log();
  console.log('Majorities by Yield');
  console.log('1000+:   ', positiveTraders1000, `${Math.floor(positiveTraders1000 / positiveTraders * 100)}%`, `~y: ${Math.floor(positiveTraders1000Summ / positiveTraders1000)}%`);
  console.log('500-1000:', positiveTraders500, `${Math.floor(positiveTraders500 / positiveTraders * 100)}%`, `~y: ${Math.floor(positiveTraders500Summ / positiveTraders500)}%`);
  console.log('100-500: ', positiveTraders100, `${Math.floor(positiveTraders100 / positiveTraders * 100)}%`, `~y: ${Math.floor(positiveTraders100Summ / positiveTraders100)}%`);
  console.log('10-100:  ', positiveTraders10, `${Math.floor(positiveTraders10 / positiveTraders * 100)}%`, `~y: ${Math.floor(positiveTraders10Summ / positiveTraders10)}%`);
  console.log();
  console.log('Majorities by Deposit');
  console.log('< 1M:', amountMillion, `${Math.floor(amountMillion / positiveTraders * 100)}%`, `~y: ${Math.floor(amountMillionSumm / amountMillion)}%`);
  console.log('1M+ :', amountTenMillions, `${Math.floor(amountTenMillions / positiveTraders * 100)}%`, `~y: ${Math.floor(amountTenMillionSumm / amountTenMillions)}%`);
  console.log();

  return simpleTable(result);

}
