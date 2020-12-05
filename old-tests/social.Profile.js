const Profile = require("../src/objects/Profile.js");

const disabled = false;

module.exports = {
	get: async function() {

		const profile = await this.social.profile.get.call(this, {});

		console.log(profile);

		const loadedProfile = await profile.load();

		console.log(loadedProfile);

		const loadedAvatar = await profile.avatar.load();

		console.log(loadedAvatar);

	}
}

if (disabled) module.exports = {};
