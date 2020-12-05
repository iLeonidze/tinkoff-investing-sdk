const https = require("https");
const ApiError = require("./objects/ApiError.js");
const ApiBuffer = require("./objects/ApiBuffer.js");
const ApiResponse = require("./objects/ApiResponse.js");

module.exports = async function({
	path,
	hostname,
	method,
	query,
	data,
	headers = {},
	ignoreDefaultQuery = false,
	ignoreDefaultHeaders = false
}) {

	if (!hostname) hostname = "api-invest-gw.tinkoff.ru"
	if (!method) method = "GET"
	if (!query) query = {}
	if (!data) data = null

	if (!path) throw new Error("Invalid request path");

	if (!ignoreDefaultQuery)
		query = { ...this.identity, ...query };

	let keyvals = [];
	for (const key of Object.keys(query))
		if (key !== "userAgent")
			keyvals.push(`${key}=${query[key]}`);

	const defaultHeaders = {
		"Accept-Language": "en"
	};

	if (!ignoreDefaultHeaders)
		headers = { ...defaultHeaders, ...headers }

	let options = {
		hostname,
		path: `${path}?${keyvals.join("&")}`,
		method,
		headers
	}

	if (data !== null) {
		newData = []
		for (const key in data)
			newData.push(`${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`);
		data = newData.join('&');
		options.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8;';
		options.headers['Content-Length'] = data.length;
	}

	if (this.identity.userAgent) options.headers["User-Agent"] = this.identity.userAgent;

	const api = this;

	console.log(options, data)

	return new Promise((resolve, reject) => {
		request = https.request(options, response => {
			let data = [];
			response.on("data", (chunk) => {
				data.push(chunk);
			});
			response.on("end", () => {
				const buffer = Buffer.concat(data);
				if (response.headers['content-type'].split(';')[0] === 'application/json') {
					resolve(new ApiResponse({ api, response, data: buffer.toString() }));
				} else {
					resolve(new ApiBuffer({ api, response, data: buffer }));
				}
			});
		}).on("error", error => {
			reject(new ApiError({ api, response, error }));
		})
		if (data !== null)
			request.write(data);
		request.end();
	});

}
