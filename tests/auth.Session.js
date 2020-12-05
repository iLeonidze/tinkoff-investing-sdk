const disabled = false;

module.exports = {
	get: async function() {

		await this.auth.session.get.call(this, {});

		await this.auth.session.ping.call(this, {});

	}
}

if (disabled) module.exports = {};
