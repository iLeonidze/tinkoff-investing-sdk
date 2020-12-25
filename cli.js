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

  // arguments[0] = '634d0bd8-1bfe-455b-9e82-14d12159ff51';
  // return await require('./scripts/getUser.js')(session, storage, arguments);

  // arguments[0] = '466';
  // return await require('./scripts/getAllUsers.js')(session, storage, arguments);

  //return await require('./scripts/findMaxYield.js')(session, storage, arguments);
  //return await require('./scripts/findMaxYieldWithDeposit.js')(session, storage, arguments);

  arguments[0] = 44.42;
  return await require('./scripts/reloadAllUsers.js')(session, storage, arguments);

  // return await require('./scripts/listInsrumentsByProfiles.js')(session, storage, arguments);

}


run().then(res => {
  if (res)
    console.log(res);
}).catch(e => {
  console.error(e);
}).finally(() => {
  session.stop();
});
