const Schema = require("./schemas").GPSSchema;
const Crypto = require("@arkecosystem/crypto");
const ByteBuffer = require("bytebuffer");
const Long = require('long');

class GPSTransaction extends Crypto.Transactions.Transaction {
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
		const buffer = new ByteBuffer(8 + 21 + 4 + 8 + 8 + 4 + 8 + 8 + 32 + 1, true);

		buffer.writeUint64(this.data.amount.toString()); // 8
		buffer.append(Crypto.Identities.Address.toBuffer(this.data.recipientId).addressBuffer); // 21
		buffer.writeUint32(this.data.asset.gps[0].timestamp); // 4
		buffer.writeInt64(parseFloat(this.data.asset.gps[0].latitude).toFixed(6).replace('.', '')); // 8
		buffer.writeInt64(parseFloat(this.data.asset.gps[0].longitude).toFixed(6).replace('.', '')); // 8
		buffer.writeUint32(this.data.asset.gps[1].timestamp); // 4
		buffer.writeInt64(parseFloat(this.data.asset.gps[1].latitude).toFixed(6).replace('.', '')); // 8
		buffer.writeInt64(parseFloat(this.data.asset.gps[1].longitude).toFixed(6).replace('.', '')); // 8
		buffer.append(Buffer.from(this.data.asset.sessionId, 'hex')); // 32
		buffer.writeUint8(this.data.asset.containsRefund ? 1 : 0); // 1

		return buffer;
	}

	deserialize(buffer) {
		this.data.amount = Crypto.Utils.BigNumber.make(buffer.readUint64().toString());
		this.data.recipientId = Crypto.Identities.Address.fromBuffer(buffer.readBytes(21).toBuffer());
		this.data.asset = {
			gps: [{
				timestamp: buffer.readUint32(),
				latitude: formatGpsCoordinate(buffer.readInt64().toString()),
				longitude: formatGpsCoordinate(buffer.readInt64().toString()),
			}, {
				timestamp: buffer.readUint32(),
				latitude: formatGpsCoordinate(buffer.readInt64().toString()),
				longitude: formatGpsCoordinate(buffer.readInt64().toString()),
			}],
			sessionId: buffer.readBytes(32).toBuffer().toString('hex'),
			containsRefund: Boolean(buffer.readUint8())
		};

		this.data.asset.gpsCount = this.data.asset.gps.length;
		this.data.asset.gps[0].human = (new Date(this.data.asset.gps[0].timestamp * 1000)).toJSON();
		this.data.asset.gps[1].human = (new Date(this.data.asset.gps[1].timestamp * 1000)).toJSON();
		this.data.asset.rideDuration = this.data.asset.gps[1].timestamp - this.data.asset.gps[0].timestamp;
	}
}

function formatGpsCoordinate(str) {
	return str.slice(0, str.length - 6) + '.' + str.slice(-6);
}

module.exports = GPSTransaction;