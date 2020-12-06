module.exports = async (session, storage) => {
  return session.user.getProfile().resync(session);
}
