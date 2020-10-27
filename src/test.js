const Crypto = require("@arkecosystem/crypto");
const GPSBuilder = require("./builders/tx-builder");
//const ScooterRegistrationBuilder = require("./builders/scooter-registration-builder");
//const RentalStartBuilder = require("./builders/rental-start-builder");
//const RentalFinishBuilder = require("./builders/rental-finish-builder");
const GPSTransaction = require("./transactions/tx-transaction");
//const ScooterRegistrationTransaction = require("./transactions/scooter-registration-transaction");
//const RentalStartTransaction = require("./transactions/rental-start-transaction");
//const RentalFinishTransaction = require("./transactions/rental-finish-transaction");
const TransactionBuilder = Crypto.Transactions.BuilderFactory.transfer().instance();
const childProcess = require('child_process');
const config = require("./bridgechain-config");
const args = require("./args");
const nonce = args.nonce || '1';
const passphrase_rx = 'oak coral glimpse slide one blood type later average solve chronic stage';
const passphrase_tx = 'today riot stomach inspire pill buzz mandate now quantum gown left pizza';
const address_rx = 'TXFBL7xjeAi7sbQf8LaQ8ZUSCcydXpXeCC';
const address_tx = 'YYtChwRnAffk3GKgSfcFdL4ybazChLece';

console.log('\n---------- ARGS ----------');
console.log(args);

// https://api.radians.nl/api/v2/node/configuration/crypto
Crypto.Managers.configManager.setConfig(config);

Crypto.Transactions.TransactionRegistry.registerTransactionType(GPSTransaction);
//Crypto.Transactions.TransactionRegistry.registerTransactionType(ScooterRegistrationTransaction);
//Crypto.Transactions.TransactionRegistry.registerTransactionType(RentalStartTransaction);
//Crypto.Transactions.TransactionRegistry.registerTransactionType(RentalFinishTransaction);

let transactions = [];

if(args.txt === 'g') {
	transactions.push(GPSBuilder.gps(Date.now(), '1.111111', '-180.222222')
		.amount('1') 
		.recipientId(address_rx)
		.nonce(nonce)
		.vendorField(args.vf)
		.sign(passphrase_tx));

} else if(args.txt === 't') {
	transactions.push(TransactionBuilder.amount('1')
		.version(2)
		.recipientId(address_rx)
		.vendorField(args.vf)
		.nonce(nonce)
		.fee('1')
		.sign(passphrase_rx));
}



let payload = {
	transactions: []
};

for(const transaction of transactions) {
	payload.transactions.push(transaction.getStruct());

	if(args.d) {
		let serialized = transaction.build().serialized.toString('hex');
		let deserialized = Crypto.Transactions.Deserializer.deserialize(serialized);

		console.log(`\nTransaction is verified: ${transaction.verify()}`);
		console.log(`\nSerialized: ${serialized}`);
		console.log('\nDeserialized: %O', deserialized);
	}
}

console.log('\n---------- COMMAND ----------');
	
const command = 'curl --request POST --url https://api.radians.nl/api/transactions ' +
	'--header "content-type:application/json" --data ' + JSON.stringify(JSON.stringify(payload));

console.log(command);

if(!args.d) {
	console.log('\n---------- RESPONSE ----------');
	console.log(childProcess.execSync(command).toString('UTF8'));
}


