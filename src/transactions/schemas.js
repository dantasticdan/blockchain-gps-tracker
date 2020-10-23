const SchemaParameters = require("./schema-parameters");
const Types = require("./types");

module.exports = {
	GPSSchema: {
		$id: "GPS",
		required: ["asset", "type", "typeGroup", "recipientId"],
		properties: {
			type: {
				transactionType: Types.TRANSACTION_TYPE
			},
			typeGroup: {
				const: Types.TYPE_GROUP
			},
			recipientId: {$ref: "address"},
			vendorField: SchemaParameters.VENDORFIELD,
			asset: {
				type: "object",
				required: ["sessionId", "gps", "rate"],
				properties: {
					sessionId: SchemaParameters.SESSION_ID,
					gps: SchemaParameters.GPS_POINT,
					rate: {
						bignumber: {
							minimum: 1
						}
					}
				}
			}
		}
	},
};