const Schema = require("./schemas").RentalStart;
const Crypto = require("@arkecosystem/crypto");
const ByteBuffer = require("bytebuffer");
const Long = require('long');

class RentalStartTransaction extends Crypto.Transactions.Transaction {
	static get typeGroup() {
		return Schema.properties.typeGroup.const;
	}

	static get type() {
		return Schema.properties.type.transactionType;
	}

	static get key() {
		return Schema.$id;
	}

	static getSchema() {
		return Crypto.Transactions.schemas.extend(Crypto.Transactions.schemas.transactionBaseSchema, Schema);
	}

	static get defaultStaticFee() {
		return Crypto.Utils.BigNumber.make('1');
	}

	hasVendorField() {
		return true;
	}

	serialize() {
		const buffer = new ByteBuffer(8 + 21 + 4 + 8 + 8 + 32 + 8, true);

		buffer.writeUint64(Long.fromString(this.data.amount.toString())); // 8
		buffer.append(Crypto.Identities.Address.toBuffer(this.data.recipientId).addressBuffer); // 21
		buffer.writeUint32(this.data.asset.gps.timestamp); // 4
		buffer.writeInt64(parseFloat(this.data.asset.gps.latitude).toFixed(6).replace('.', '')); // 8
		buffer.writeInt64(parseFloat(this.data.asset.gps.longitude).toFixed(6).replace('.', '')); // 8
		buffer.append(Buffer.from(this.data.asset.sessionId, 'hex')); // 32
		buffer.writeUint64(this.data.asset.rate.toString()); // 8

		return buffer;
	}

	deserialize(buffer) {
		this.data.amount = Crypto.Utils.BigNumber.make(buffer.readUint64().toString());
		this.data.recipientId = Crypto.Identities.Address.fromBuffer(buffer.readBytes(21).toBuffer());
		this.data.asset = {
			gps: {
				timestamp:  buffer.readUint32(),
				latitude: formatGpsCoordinate(buffer.readInt64().toString()),
				longitude: formatGpsCoordinate(buffer.readInt64().toString()),
			},
			sessionId: buffer.readBytes(32).toBuffer().toString('hex'),
			rate: Crypto.Utils.BigNumber.make(buffer.readUint64().toString()),
		};
		this.data.asset.gpsCount = 1;
		this.data.asset.gps.human = (new Date(this.data.asset.gps.timestamp * 1000)).toJSON();
	}
}

function formatGpsCoordinate(str) {
	return str.slice(0, str.length - 6) + '.' + str.slice(-6);
}

module.exports = RentalStartTransaction;