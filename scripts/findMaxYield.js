module.exports = async (session, storage, arguments) => {

  storage.profiles.loadAllProfiles();

  const yields = [];
  let positiveTraders = 0;
  let positiveTradersSumm = 0;
  let negativeTraders = 0;
  let negativeTradersSumm = 0;
  let zeroTraders = 0;
  let positiveTraders1000 = 0;
  let positiveTraders1000Summ = 0;
  let positiveTraders500 = 0;
  let positiveTraders500Summ = 0;
  let positiveTraders100 = 0;
  let positiveTraders100Summ = 0;
  let positiveTraders10 = 0;
  let positiveTraders10Summ = 0;
  let positiveTraders0 = 0;
  let positiveTraders0Summ = 0;

  for (const profile of storage.profiles.getAllProfiles()) {
    const yield = profile.getYearRelativeYield();
    if (yield > 0) {
      positiveTraders++;
      positiveTradersSumm += yield;
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
      } else {
        positiveTraders0++;
        positiveTraders0Summ += yield;
      }
    } else if (yield < 0) {
      negativeTraders++;
      negativeTradersSumm += yield;
    } else {
      zeroTraders++;
    }
    yields.push({
      id: profile.profileId,
      yield
    });
  }

  yields.sort(function(a, b) {
    return b.yield - a.yield;
  });

  const filteredYields = yields.filter(yield => yield['yield'] < 501);

  const result = [];

  for (let i = 0; i < 100; i++) {
    if (filteredYields[i]['yield'] > 500) {
      continue;
    }
    result.push(storage.profiles.getProfile(filteredYields[i]['id']).data.raw);
  }

  console.log();
  console.log('   Total traders:', yields.length);
  console.log('    Zero traders:', zeroTraders, `${Math.floor(zeroTraders / yields.length * 100)}%`);
  console.log('Negative traders:', negativeTraders, `${Math.floor(negativeTraders / yields.length * 100)}%`, `avg y: ${Math.floor(negativeTradersSumm / negativeTraders)}%`);
  console.log('Positive traders:', positiveTraders, `${Math.floor(positiveTraders / yields.length * 100)}%`, `avg y: ${Math.floor(positiveTradersSumm / positiveTraders)}%`);
  console.log('           1000+:', positiveTraders1000, `${Math.floor(positiveTraders1000 / positiveTraders * 100)}%`, `avg y: ${Math.floor(positiveTraders1000Summ / positiveTraders1000)}%`);
  console.log('        500-1000:', positiveTraders500, `${Math.floor(positiveTraders500 / positiveTraders * 100)}%`, `avg y: ${Math.floor(positiveTraders500Summ / positiveTraders500)}%`);
  console.log('         100-500:', positiveTraders100, `${Math.floor(positiveTraders100 / positiveTraders * 100)}%`, `avg y: ${Math.floor(positiveTraders100Summ / positiveTraders100)}%`);
  console.log('          10-100:', positiveTraders10, `${Math.floor(positiveTraders10 / positiveTraders * 100)}%`, `avg y: ${Math.floor(positiveTraders10Summ / positiveTraders10)}%`);
  console.log('            0-10:', positiveTraders0, `${Math.floor(positiveTraders0 / positiveTraders * 100)}%`, `avg y: ${Math.floor(positiveTraders0Summ / positiveTraders0)}%`);
  console.log();

  return result;

}
