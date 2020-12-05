const Profile = require("../../objects/Profile.js");
const File = require("../../objects/File.js");

const PATH = "/social/file/v1/cache/";

module.exports = {

	/*
		Method: api.social.file.get()
		Description: get file by id
		Args:
      - id (string, mandatory)
		  - type (string, mandatory, for example "profile/avatar")
      - options (dict, optional, by default empty, for example {'size': 'small'})
		Returns: File
	*/
  get: async function({ id, type, options = {}, api = this }) {

    const parameters = {
      path: `${PATH}${type}/${id}`,
      query: options
    };

    const data = await api.request(parameters);
    return new File({ id, type, options, data, api });

  }
}
