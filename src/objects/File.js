class File {

	constructor({ id, type, options = {}, data = null, api }) {

		this.id = id;
		this.type = type;
		this.options = options;
		this.data = data;

		this.load = async function() {
			return await api.social.file.get({
				id,
				type,
				options,
				api
			});
		}

	}

}

module.exports = File;
