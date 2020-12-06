const fs = require('fs');
const path = require('path');
const merge = require('../../merge.js');

const ProfileEndpoint = require("../endpoints/social/Profile.js");
const Avatar = require("./Avatar.js");

class Profile {

	constructor({ data }) {

		this.data = {}

		if (typeof data['id'] == 'undefined')
			throw new Error('ID not set')

		if (typeof this['id'] === 'undefined')
			this.data.id = data['id'];

		this.localFile = path.resolve(`${__dirname}/../../data/profiles/${this.data.id}.json`);

		this.loaded = false;

		this.meta = {
			created: new Date(),
			updated: null,
			prefetched: null
		}

		this.apply = function(data) {

			if (this.data['id'] !== data['id']) {
				throw new Error('ID not equals')
			}

			//if (typeof data['image'] !== 'undefined' && (typeof this.data['avatar'] === 'undefined' || this.data.avatar.id === data['image'])) {
			//	this.data.avatar = new Avatar({ id: data['image'], api });
			//	delete data['image'];
			//}

			if (typeof data['yearRelativeYield'] !== 'undefined') {
				this.data.statistics.yearRelativeYield = data['yearRelativeYield'];
				delete data['yearRelativeYield'];
			}

			merge(this.data, data);
			this.save();

		}

		this.load = function() {
			if (fs.existsSync(this.localFile)) {
				try {
					data = JSON.parse(fs.readFileSync(this.localFile, 'utf8'));
					this.apply(data);
					this.loaded = true;
				} catch (e) {
					console.error(`Failed to load profile for user ${this.data.id} from disk`, e)
				}
			}
		}

		this.save = function() {
			try {
				// todo: make this async
				fs.writeFileSync(this.localFile, JSON.stringify(this.data));
				this.loaded = true;
				// api.data.profiles[this.id] = this;
			} catch (e) {
				console.error(`Failed to save profile for user ${this.data.id} on disk`, e)
			}
		}

		this.update = async function(session) {
			return await ProfileEndpoint.get(session, {
				id: this.id
			});
		}

		if (!this.loaded) this.load();

		this.apply(data);

	}

}

module.exports = Profile;
