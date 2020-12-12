const ApiError = require("./ApiError.js");

class ApiResponse {

	constructor({ response, data }) {

		this.code = response.statusCode;

		let content;
		try {
			content = JSON.parse(data);
		} catch (error) {
			throw new ApiError({
				error,
				response
			});
		}

		if (typeof content['status'] !== 'undefined')
			this.status = typeof content['status'] === 'string' ? content.status.toLowerCase() : content['status'];

		if (typeof content['resultCode'] !== 'undefined')
			this.status = content.resultCode.toLowerCase();

		if (this.status !== "ok") {
			throw new ApiError({
				content,
				response
			});
		}
		this.trackingId = content.trackingId;
		this.payload = content.payload || null;

		if (typeof content['time'] !== 'undefined')
			this.time = new Date(content.time);

	}

}

module.exports = ApiResponse;
