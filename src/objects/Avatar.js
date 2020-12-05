class Avatar {

	constructor({ id, file = null, api }) {

		this.id = id;
		this.file = file;

		if (file === null) {
			// load file
		} else {
			// save file
		}

		this.load = async function() {
			return await api.social.avatar.get({
				id: this.id,
				size: 'small',
				api
			});
		}

		this.getBuffer = function() {
			return this.file.data.buffer;
		}

	}

}

module.exports = Avatar;
