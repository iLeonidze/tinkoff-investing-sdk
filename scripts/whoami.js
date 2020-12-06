const ProfileEndpoint = require("../src/endpoints/social/Profile.js");

console.log(ProfileEndpoint)

module.exports = async (session) => {
  const profileBefore = await ProfileEndpoint.get(session, {});
  const profileAfter = await profileBefore.update(session);
  console.log(profileAfter);
}
