const endpointScripts = [
	"social/Profile",
	"social/ProfileCatalog",
	"social/Avatar",
	"social/File",
	"auth/Session",
];

class TinkoffInvestingAPI {

	identitySourceFile = "./identity.json";

	data = {
		avatars: {},
		profiles: {}
	}

	identity = {
		sessionId: null,
		deviceId: null,
		userAgent: null,
		appVersion: null,
		platform: null,
		origin: null,
		ccc: null,
		cpswc: null
	}

	constructor(identity) {

		if (typeof identity !== "object") {
			if (typeof identity === "string") {
				this.identitySourceFile = identity;
				console.log(`Identity will be loaded from explicit-defined file ${this.identitySourceFile}`);
			} else {
				console.log("Identity will be loaded from default file");
			}
			identity = require(this.identitySourceFile);
		} else {
			this.identitySourceFile = null;
			console.log("Identity defined via object");
		}

		if (typeof identity["sessionId"] !== "string" || !identity["sessionId"]) {
			throw new Error("Identity do not contain mandatory sessionId");
		} else {
			this.identity.sessionId = identity["sessionId"];
		}

		for (let identityItemName of Object.keys(this.identity))
			if (typeof this.identity[identityItemName] !== "function")
				if (identity[identityItemName]) {
					this.identity[identityItemName] = identity[identityItemName];
				} else {
					console.log(`Identity ${identityItemName} skipped`);
				}

		const request = require("./src/request.js");
		this.request = async function(...args) {
			return request.apply(this, args);
		}

		for (const endpointScript of endpointScripts) {

			const endpointPath = endpointScript.split("/");

			const endpointCategory = endpointPath[0];
			if (typeof this[endpointCategory] === "undefined") {
				this[endpointCategory] = {};
			}

			const endpointName = endpointPath[1].charAt(0).toLowerCase() + endpointPath[1].slice(1);
			this[endpointCategory][endpointName] = {};

			const endpoint = require(`./src/endpoints/${endpointScript}.js`);

			for (const endpointMethodName in endpoint) {
				this[endpointCategory][endpointName][endpointMethodName] = async function(...args) {
					return endpoint[endpointMethodName].apply(this, args);
				}
			}

		}

	}

}

module.exports = TinkoffInvestingAPI;
