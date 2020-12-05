const Profile = require("../../objects/Profile.js");

const PATH = "/social/v1/profile/";

module.exports = {

	/*
		Method: api.social.profile.get()
		Description: get current profile or profile by id
		Args:
		  - id (string, optional, by default unset)
		Returns: Profile
	*/
	get: async function({ id = null, api = this }) {

		let path = PATH;
		if (id && typeof id === "string")
			path += `${id}/`

		let parameters = {
			path,
			query: {}
		};

		const { payload } = await api.request(parameters);
		return new Profile({ data: payload, api });

	}
}
