const ApiError = require("./ApiError.js");

class ApiResponse {

	constructor({ api, response, data }) {

		this.code = response.statusCode;

		let content;
		try {
			content = JSON.parse(data);
		} catch (error) {
			throw new ApiError({
				error,
				api,
				response
			});
		}

		if (typeof content['status'] !== 'undefined')
			this.status = content.status.toLowerCase();

		if (typeof content['resultCode'] !== 'undefined')
			this.status = content.resultCode.toLowerCase();

		if (this.status !== "ok") {
			throw new ApiError({
				content,
				api,
				response
			});
		}
		this.trackingId = content.trackingId;
		this.payload = content.payload;

		if (typeof content['time'] !== 'undefined')
			this.time = new Date(content.time);

	}

}

module.exports = ApiResponse;
