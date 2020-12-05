class ApiBuffer {

	constructor({ api, response, data }) {

		this.code = response.statusCode;
		this.buffer = data;

	}

}

module.exports = ApiBuffer;
