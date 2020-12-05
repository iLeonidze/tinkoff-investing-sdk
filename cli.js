const TinkoffInvestingUser = require('./src/TinkoffInvestingUser.js')
const TinkoffInvestingUserSession = require('./src/TinkoffInvestingUserSession.js')


const localId = 'iLeonidze';

const user = new TinkoffInvestingUser(localId);
const session = new TinkoffInvestingUserSession(user);


async function run() {

  const isStarted = await session.start();
  if (!isStarted)
    throw new Error('Failed to start session')

  return await require('./scripts/whoami.js')(session);

}


run().then(res => {
  console.log(res);
}).catch(e => {
  console.error(e);
}).finally(() => {
  session.stop();
});
