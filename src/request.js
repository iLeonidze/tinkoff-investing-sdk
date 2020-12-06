const https = require("https");
const ApiError = require("./objects/ApiError.js");
const ApiBuffer = require("./objects/ApiBuffer.js");
const ApiResponse = require("./objects/ApiResponse.js");

module.exports = async function({
	path,
	hostname,
	method,
	query = {},
	data = null,
	headers = {}
}) {

	if (!path) throw new Error("Invalid request path");
	if (!hostname) throw new Error("Invalid request hostname");
	if (!method) throw new Error("Invalid request method");

	let keyvals = [];
	for (const queryKey in query)
		keyvals.push(`${encodeURIComponent(queryKey)}=${encodeURIComponent(query[queryKey])}`);

	let options = {
		hostname,
		path: `${path}?${keyvals.join("&")}`,
		method,
		headers
	}

	if (data !== null) {
		newData = []
		for (const dataKey in data)
			newData.push(`${encodeURIComponent(dataKey)}=${encodeURIComponent(data[dataKey])}`);
		data = newData.join('&');
		options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8;';
		options.headers['Content-Length'] = data.length;
	}

	return new Promise((resolve, reject) => {
		request = https.request(options, response => {
			let data = [];
			response.on("data", (chunk) => {
				data.push(chunk);
			});
			response.on("end", () => {
				const buffer = Buffer.concat(data);
				if (response.headers['content-type'].split(';')[0] === 'application/json') {
					resolve(new ApiResponse({ response, data: buffer.toString() }));
				} else {
					resolve(new ApiBuffer({ response, data: buffer }));
				}
			});
		}).on("error", error => {
			reject(new ApiError({ response, error }));
		})
		if (data !== null)
			request.write(data);
		request.end();
	});

}
