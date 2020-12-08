module.exports = async (session, storage, arguments) => {
  return session.user.getProfile().resync(session);
}
