const GPSTransaction = require('../transactions/tx-transaction');
const Crypto = require('@arkecosystem/crypto');

class GPSBuilder extends Crypto.Transactions.TransactionBuilder {
	constructor() {
		super();
		this.data.type = GPSTransaction.type;
		this.data.typeGroup = GPSTransaction.typeGroup;
		this.data.version = 2;
		this.data.fee = GPSTransaction.defaultStaticFee;
		this.data.amount = Crypto.Utils.BigNumber.ZERO;
		this.data.asset = {};
	}

	gps(timestamp, latitude, longitude) {
		const date = new Date(timestamp);

		this.data.asset.gps = {
			timestamp: Math.floor(date.getTime() / 1000),
			latitude: latitude,
			longitude: longitude
		};

		return this.instance();
	}

	getStruct() {
		const struct = super.getStruct();

		struct.amount = this.data.amount;
		struct.asset = this.data.asset;
		struct.vendorField = this.data.vendorField;
		struct.recipientId = this.data.recipientId;

		return struct;
	}

	instance() {
		return this;
	}

}

module.exports = new GPSBuilder();