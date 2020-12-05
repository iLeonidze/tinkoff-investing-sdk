class ApiError extends Error {

	constructor({
		error = null,
		data = null,
		content = null,
		response,
		api
	}) {

		if (error) {
			super(error);
			this.type = "InternalError";
		} else if (content) {
			if (typeof content['payload'] === "object") {
				super(content.payload.message);
				this.name = content.payload.code;
			} else if (typeof content['resultCode'] === "string") {
				super(content['errorMessage']);
				this.name = content['resultCode']
			} else {
				super("Unknown payload error");
				this.name = "PayloadError";
			}
			this.type = "ExternalError";
			console.error(content)
		} else {
			super(`Unknown error`);
			this.type = "UnknownError";
			this.data = data;
			this.response = response;
		}

	}

}

module.exports = ApiError;
