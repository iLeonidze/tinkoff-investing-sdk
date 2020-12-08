const ProfileCatalogEndpoint = require('../src/endpoints/social/ProfileCatalog.js');

module.exports = async (session, storage, arguments) => {
  return ProfileCatalogEndpoint.get({
    session,
    storage
  });
}
