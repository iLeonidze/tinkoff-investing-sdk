const Profile = require("../src/objects/Profile.js");

const disabled = false;

module.exports = {
	get: async function() {

		const profilesList = await this.social.profileCatalog.get.call(this, {});

		if (profilesList.length !== 50)
			throw new Error(`Invalid list size: expected 50, but found ${profilesList.length}`);

		const profile = profilesList[0];

		if (!(profile instanceof Profile))
			throw new Error(`List item is not an instance of Profile`);

		console.log();
		console.log();
		console.log(this)
		const loadedProfile = await profile.load();

		console.log(loadedProfile)

	}
}

if (disabled) module.exports = {};
