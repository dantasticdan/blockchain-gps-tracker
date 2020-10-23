const Schemas = {
	SCOOTER_ID: {
		type: "string",
		minLength: 10,
		maxLength: 10
	},
	SESSION_ID: {
		type: "string",
		minLength: 64,
		maxLength: 64
	},
	INTEGER_PARAMETER: {
		anyOf: [{type: "null"}, {type: "integer", maxLength: 64}]
	},
	NUMBER_PARAMETER: {
		anyOf: [{type: "null"}, {type: "number", maxLength: 64}]
	},
	GPS_COORDINATE: {
		type: "string",
		minLength: 8,
		maxLength: 11
	},
	TIMESTAMP: {
		type: "integer",
		minLength: 10,
		maxLength: 10
	},
	TRANSACTION_ID: {
		$ref: "transactionId"
	},
	VENDORFIELD: {
		anyOf: [{type: "null"}, {type: "string", format: "vendorField"}]
	},
	CONTAINS_REFUND: {
		type: "boolean",
	},
	GPS_POINT: {
		type: "object",
		required: ["timestamp", "latitude", "longitude"],
		properties: undefined
	}
};

Schemas.GPS_POINT.properties = {
	timestamp: Schemas.TIMESTAMP,
	latitude: Schemas.GPS_COORDINATE,
	longitude: Schemas.GPS_COORDINATE
};

module.exports = Schemas;
