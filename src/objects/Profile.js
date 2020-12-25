const fs = require('fs');

const merge = require('../../utils/merge.js');

const ProfileEndpoint = require("../endpoints/social/Profile.js");
const ProfileInstrumentsEndpoint = require("../endpoints/social/ProfileInstruments.js");
const ProfileOperationsEndpoint = require("../endpoints/social/ProfileOperations.js");

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

		this.reloadOperations();

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
		console.log(`Loading profile`);
		return await ProfileEndpoint.get({
			profileId: this.profileId,
			session,
			storage: this.storage
		});
	}

	async resyncInstrumentsHistory(session, force = false) {
		if (typeof this.data.meta['instrumentsSyncStamp'] !== 'number' || force) {
			this.data.meta['instrumentsSyncStamp'] = 0;
		}

		let firstStamp = null;

		let nextCursor = null;
		let loadNext = true;
		while (loadNext) {
			console.log(`Loading instruments ${nextCursor}`);
			const instrumentsHistoryRaw = await ProfileInstrumentsEndpoint.get({
				session,
				storage: this.storage,
				profileId: this.profileId,
				nextCursor
			});
			const newInstruments = [];
			for (const item of instrumentsHistoryRaw) {
				if (typeof item['type'] === 'undefined') continue;
				const instrument = {
					type: item['type'],
					ticker: item['ticker'],
					classCode: item['classCode'],
					operations: item['statistics']['totalOperationsCount'],
					stamp: Date.parse(item['statistics']['maxTradeDateTime'])
				}
				if (firstStamp === null) {
					firstStamp = instrument.stamp;
				}
				if (typeof this.data['instruments'] === 'undefined') {
					this.data['instruments'] = [];
				}
				if (instrument.stamp < this.data.meta['instrumentsSyncStamp'] || instrument.stamp === this.data.meta['instrumentsSyncStamp']) {
					loadNext = false;
				}
				newInstruments.push(instrument);
			}
			if (typeof this.data['instruments'] !== 'undefined') {
				this.data['instruments'] = this.data['instruments'].concat(newInstruments.reverse());
				this.data['instruments'] = this.data['instruments'].filter(function(el) {
					return el != null && typeof el !== 'undefined';
				});
				this.data['instruments'].sort(function(a, b) {
					return a.stamp - b.stamp;
				});
				for (const i in this.data['instruments']) {
					for (const j in this.data['instruments']) {
						if (i !== j
							&& typeof this.data['instruments'][i] !== 'undefined'
							&& typeof this.data['instruments'][j] !== 'undefined'
							&& this.data['instruments'][i].ticker === this.data['instruments'][j].ticker
							&& this.data['instruments'][i].classCode === this.data['instruments'][j].classCode
							&& (this.data['instruments'][i].stamp < this.data['instruments'][j].stamp || this.data['instruments'][i].stamp === this.data['instruments'][j].stamp)) {
							delete this.data['instruments'][i];
						}
					}
				}
				this.data['instruments'] = this.data['instruments'].filter(function(el) {
					return el != null && typeof el !== 'undefined';
				});
			}
			if (instrumentsHistoryRaw.hasNext()) {
				nextCursor = instrumentsHistoryRaw.nextCursor;
				if (force) {
					loadNext = true;
				}
			} else {
				loadNext = false;
			}
		}

		if (firstStamp !== null) {
			this.data.meta['instrumentsSyncStamp'] = firstStamp;
		}
		this.data.meta['instrumentsSynced'] = new Date().getTime();
		this.setUpdated({ updateMeta: true });
	}

	async resyncOperationsHistory(session, force = false) {
		if (typeof this.data['instruments'] === 'undefined') {
			await this.resyncInstrumentsHistory(session);
		}
		if (typeof this.data['instruments'] === 'undefined' || this.data['instruments'].length === 0) {
			return;
		}
		if (typeof this.data.meta['operationsSyncStamp'] !== 'number' || force) {
			this.data.meta['operationsSyncStamp'] = 0;
		}
		if (typeof this.data['operations'] === 'undefined') {
			this.data['operations'] = {};
		}

		let maxSyncStamp = 0;
		const instrumentsToSync = [];
		for (const instrument of this.data['instruments']) {
			if (instrument.stamp > this.data.meta['operationsSyncStamp']) {
				instrumentsToSync.push(instrument);
				if (instrument.stamp > maxSyncStamp) {
					maxSyncStamp = instrument.stamp;
				}
			}
		}

		if (instrumentsToSync.length < 1) return;

		for (const instrument of instrumentsToSync) {
			if (typeof this.data['operations'][instrument.classCode] === 'undefined') {
				this.data['operations'][instrument.classCode] = {};
			}
			if (typeof this.data['operations'][instrument.classCode][instrument.ticker] === 'undefined') {
				this.data['operations'][instrument.classCode][instrument.ticker] = {};
			}

			const instrumentStamps = Object.keys(this.data['operations'][instrument.classCode][instrument.ticker]);
			const instrumentMaxSyncStamp = instrumentStamps.length > 0 ? Math.max.apply(null, instrumentStamps) : 0;

			let nextCursor = null;
			let loadNext = true;
			while (loadNext) {
				console.log(`Loading operations ${instrument.classCode}/${instrument.ticker} ${nextCursor}`);
				const operationsHistoryRaw = await ProfileOperationsEndpoint.get({
					session,
					storage: this.storage,
					profileId: this.profileId,
					ticker: instrument.ticker,
					classCode: instrument.classCode,
					nextCursor
				});

				for (const operation of operationsHistoryRaw) {
					const operationStamp = Date.parse(operation['tradeDateTime']);
					this.data['operations'][instrument.classCode][instrument.ticker][operationStamp] = {
						action: operation['action'],
						price: operation['averagePrice']
					}
					if (operation['relativeYield'] !== null) {
						this.data['operations'][instrument.classCode][instrument.ticker][operationStamp]['yield'] = operation['relativeYield'];
					}
					if (operationStamp < instrumentMaxSyncStamp || operationStamp === instrumentMaxSyncStamp) {
						loadNext = false;
					}
				}

				if (operationsHistoryRaw.hasNext()) {
					nextCursor = operationsHistoryRaw.nextCursor;
					if (force) {
						loadNext = true;
					}
				} else {
					loadNext = false;
				}

			}

		}

		this.data.meta['operationsSyncStamp'] = maxSyncStamp;
		this.data.meta['operationsSynced'] = new Date().getTime();
		this.setUpdated({ updateMeta: true });
		this.reloadOperations();
	}

	reloadOperations() {
		if (!this.hasOperations()) return;
		for (const classCode in this.data['operations']) {
			for (const ticker in this.data['operations'][classCode]) {
				this.storage.operations.resetTickerForUser({
					classCode,
					ticker,
					profileId: this.profileId
				})
				for (const stamp in this.data['operations'][classCode][ticker]) {
					this.storage.operations.newOperation({
						profileId: this.profileId,
						classCode,
						ticker,
						stamp,
						action: this.data['operations'][classCode][ticker][stamp].action,
						price: this.data['operations'][classCode][ticker][stamp].price
					});
				}
			}
		}
	}

	hasOperations() {
		return typeof this.data['operations'] !== 'undefined' && Object.keys(this.data['operations']).length > 0
	}

	async resyncAll(session, force = false) {
		await this.resyncProfile(session);
		if (this.isOpened()) {
			await this.resyncInstrumentsHistory(session, force);
			await this.resyncOperationsHistory(session, force);
		}
		return this;
	}

	isClosed() {
		return this.data.raw.status === 'close';
	}

	isOpened() {
		return this.data.raw.status === 'open';
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

	getInstruments() {
		return typeof this.data['instruments'] !== 'undefined' ? this.data['instruments'] : [];
	}

}

module.exports = Profile;
