const ProfileCatalogEndpoint = require('../src/endpoints/social/ProfileCatalog.js');

module.exports = async (session, storage) => {
  return ProfileCatalogEndpoint.get({
    session,
    storage
  });
}
