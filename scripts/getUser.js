module.exports = async (session, storage, arguments) => {
  storage.profiles.loadAllProfiles();
  return storage.profiles.getProfile(arguments[0]).resyncAll(session);
}
