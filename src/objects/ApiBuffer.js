class ApiBuffer {

	constructor({ response, data }) {

		this.code = response.statusCode;
		this.buffer = data;

	}

}

module.exports = ApiBuffer;
