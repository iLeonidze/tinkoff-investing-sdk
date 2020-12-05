const Avatar = require("../../objects/Avatar.js");

const TYPE = "profile/avatar";

module.exports = {

	/*
		Method: api.social.avatar.get()
		Description: get avatar by id
		Args:
      - id (string, mandatory)
      - size (string, optional, by default "small")
		Returns: Avatar
	*/
  get: async function({ id, size = 'small', api = this }) {

    const file = await api.social.file.get({
      id,
      type: TYPE,
      options: {
        size
      },
      api
    });

    return new Avatar({ id, file, api });

  }

}
