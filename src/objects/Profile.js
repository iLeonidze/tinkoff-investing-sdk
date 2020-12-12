const fs = require('fs');

const merge = require('../../utils/merge.js');

const ProfileEndpoint = require("../endpoints/social/Profile.js");

const SAVE_DELAY = 1000;

class Profile {

	constructor({
		profileId,
		data = null,
		storage = null,
		fsLocation = null
	}) {

		if (typeof profileId == 'undefined')
			throw new Error('Profile ID not set');

		this.profileId = profileId;
		this.data = data;
		this.storage = storage;
		this.fsLocation = fsLocation;

		this.loaded = false;
		this.saved = false;
		this.updating = false;
		this.unloaded = true;

		if (this.storage) {
			if (this.storage.profiles.isProfileInMemory(this.localId))
				throw new Error(`Profile "${this.localId}" already in memory`);
			this.storage.profiles.profilesById[this.profileId] = this;
		}

		if (this.data !== null) {
			this.verifyData();
			this.loaded = true;
			this.unloaded = false;
			setUpdated({});
		} else {
			this.tryReload();
		}

		if (this.data == null)
			this.data = {};

		if (typeof this.data['meta'] !== 'object')
			this.data['meta'] = {};

		if (typeof this.data.meta['created'] !== 'number')
			this.data.meta['created'] = new Date().getTime();

	}

	tryReload() {
		if (fs.existsSync(this.fsLocation)) {
			return this.reload();
		}
		return this;
	}

	reload() {
		if (!this.fsLocation) {
			throw new Error(`Not possible to reload profile "${this.profileId}" with FS usage disabled`)
		}
		if (!fs.existsSync(this.fsLocation)) {
			throw new Error(`Profile "${this.profileId}" not exists at "${this.fsLocation}"`)
		}
		let data;
		try {
			data = JSON.parse(fs.readFileSync(this.fsLocation, 'utf8'));
		} catch (e) {
			throw new Error(`Failed to load profile "${this.profileId}"`, e)
		}
		this.verifyData(data);
		this.data = data;
		this.saved = true;
		this.loaded = true;
		this.unloaded = false;
		this.updateIndexes();
		return this;
	}

	unload() {
		if (!this.loaded) return;
		this.storage.users.unloadProfile(this);
		this.data = {};
		this.loaded = false;
	}

	updateIndexes() {
		if (this.storage && this.storage.profiles.isProfileInMemory(this)) {
			this.storage.profiles.updateIndexesForProfile(this);
		}
		return this;
	}

	save() {
		if (this.unloaded || !this.fsLocation) return this;
		try {
			fs.writeFileSync(this.fsLocation, JSON.stringify(this.data, null, 2));
		} catch (e) {
			throw new Error(`Failed to save profile ${this.profileId}`, e)
		}
		this.saved = true;
		return this;
	}

	delete() {
		this.unload();
		if (this.fsLocation) {
			try {
				fs.unlinkSync(this.fsLocation);
			} catch (e) {
				throw new Error(`Failed to delete profile ${this.profileId}`, e)
			}
		}
		this.unloaded = true;
	}

	setUpdated({ updateMeta = true, updateIndexes = true }) {
		if (updateMeta) this.data.meta['updated'] = new Date().getTime();
		if (updateIndexes) this.updateIndexes();
		if (this.updating || !this.fsLocation) return this;
		this.updating = true;
		setTimeout(() => {
			this.updating = false;
			this.save();
		}, SAVE_DELAY);
	}

	update(data) {

		if (typeof data['id'] !== 'undefined') {
			if (this.profileId !== data['id']) throw new Error('Profile ID not equals');
			delete data['id'];
			data = {
				raw: data
			};
		}

		if (typeof data.raw['yearRelativeYield'] !== 'undefined') {
			if (typeof data.raw['statistics'] === 'undefined')
				data.raw['statistics'] = {};
			data.raw.statistics['yearRelativeYield'] = data.raw['yearRelativeYield'];
			delete data.raw['yearRelativeYield'];
		}

		this.verifyData(data);
		merge(this.data, data);

		this.loaded = true;
		this.unloaded = false;
		this.setUpdated({});

		return this;

	}

	verifyData(data) {

		if (!data)
			data = this.data;

		// TODO

		return this;

	}

	async resyncProfile(session) {
		return await ProfileEndpoint.get({
			profileId: this.profileId,
			session,
			storage: this.storage
		});
	}

	async resyncInstrumentsHistory(session, force = false) {

	}

	async resyncOperationsHistory(session, force = false) {

	}

	async resyncAll(session, force = false) {
		await this.resyncProfile(session);
		await this.resyncInstrumentsHistory(session, force);
		await this.resyncOperationsHistory(session, force);
		return this;
	}

	getNickname() {
		return typeof this.data.raw['nickname'] !== 'undefined' ? this.data.raw['nickname'] : null;
	}

	getYearRelativeYield() {
		if (typeof this.data.raw['statistics'] === 'undefined' || this.data.raw['statistics'] === null) return 0;
		return typeof this.data.raw.statistics['yearRelativeYield'] !== 'undefined' ? this.data.raw.statistics['yearRelativeYield'] : 0;
	}

	getMonthOperationsCount() {
		if (typeof this.data.raw['statistics'] === 'undefined' || this.data.raw['statistics'] === null) return 0;
		return typeof this.data.raw.statistics['monthOperationsCount'] !== 'undefined' ? this.data.raw.statistics['monthOperationsCount'] : 0;
	}

	getTotalAmountRange() {
		return typeof this.data.raw['statistics'] !== 'undefined' && this.data.raw['statistics'] !== null &&
			typeof this.data.raw.statistics['totalAmountRange'] !== 'undefined' ? this.data.raw.statistics['totalAmountRange'] : { lower: 0, upper: 10000 };
	}

	getFollowersCount() {
		return typeof this.data.raw['followersCount'] !== 'undefined' && this.data.raw['followersCount'] !== null ? this.data.raw['followersCount'] : 0;
	}

	getFollowingCount() {
		return typeof this.data.raw['followingCount'] !== 'undefined' && this.data.raw['followingCount'] !== null ? this.data.raw['followingCount'] : 0;
	}

}

module.exports = Profile;
