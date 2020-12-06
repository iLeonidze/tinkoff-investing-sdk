const path = require('path');

const TinkoffInvestingStorage = require('./src/TinkoffInvestingStorage.js');
const TinkoffInvestingUserSession = require('./src/TinkoffInvestingUserSession.js');



const fsLocation = path.join(__dirname, 'data')

const storage = new TinkoffInvestingStorage({ fsLocation });
const localId = 'iLeonidze';

const user = storage.users.getUser(localId);
const session = new TinkoffInvestingUserSession(user);


async function run() {

  const isStarted = await session.start();
  if (!isStarted)
    throw new Error('Failed to start session')

  return await require('./scripts/findAll.js')(session, storage);

}


run().then(res => {
  console.log(res);
}).catch(e => {
  console.error(e);
}).finally(() => {
  session.stop();
});
