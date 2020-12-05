const fs = require("fs");

console.log("Running tests for Tinkoff Investing API");

const TinkoffInvestingAPI = require(".");
const api = new TinkoffInvestingAPI();
	
let totalTestsAmount = 0;
let succeededTestsAmount = 0;
	
(async () => {
	
	const testModules = fs.readdirSync("./tests");
	for(const testModuleName of testModules) {
		console.log();
		const testModule = require(`./tests/${testModuleName}`);
		for(const testMethodName in testModule) {
			if(typeof testModule[testMethodName] === "function") {
				totalTestsAmount++;
				process.stdout.write(`Test ${testModuleName}::${testMethodName} `);
				try {
					await testModule[testMethodName].call(api);
					succeededTestsAmount++;
					process.stdout.write("PASS\n");
				} catch (e) {
					process.stdout.write("FAIL\n");
					console.error(e);
				}
			}
		}
	}
	
})().then(()=>{
	console.log();
	console.info("DONE");
	console.log(`Succeeded ${succeededTestsAmount} of ${totalTestsAmount}`)
	process.exit(0);
}).catch((error) => {
	console.log();
	console.error("FAILURE", error);
	console.log(`Succeeded ${succeededTestsAmount} of ${totalTestsAmount}`)
	process.exit(1);
});