const path = require('path');

const TinkoffInvestingStorage = require('./src/TinkoffInvestingStorage.js');
const TinkoffInvestingUserSession = require('./src/TinkoffInvestingUserSession.js');



const fsLocation = path.join(__dirname, 'data')

const storage = new TinkoffInvestingStorage({ fsLocation });
const localId = 'iLeonidze';

const user = storage.users.getUser(localId);
const session = new TinkoffInvestingUserSession(user);
//const session = null;


async function run() {

  const arguments = [];

  const isStarted = await session.start();
  if (!isStarted)
    throw new Error('Failed to start session');

  //return await require('./scripts/whoami.js')(session, storage, arguments);
  arguments[0] = '000022bb-a784-4c1d-9be9-7073a6af74aa';
  return await require('./scripts/getUser.js')(session, storage, arguments);

  // arguments[0] = '466';
  // return await require('./scripts/getAllUsers.js')(session, storage, arguments);

  //return await require('./scripts/findMaxYield.js')(session, storage, arguments);
  //return await require('./scripts/findMaxYieldWithDeposit.js')(session, storage, arguments);

  //arguments[0] = 220;
  //return await require('./scripts/reloadAllUsers.js')(session, storage, arguments);

}


run().then(res => {
  if (res)
    console.log(res);
}).catch(e => {
  console.error(e);
}).finally(() => {
  session.stop();
});
