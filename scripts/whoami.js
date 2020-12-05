const ProfileEndpoint = require("../src/endpoints/social/Profile.js");

module.exports = async (session) => {
  return await ProfileEndpoint.get(session, {});
}
