const GPSHandler = require("./handlers/tx-handler");
const Transactions = require('@arkecosystem/core-transactions');

exports.plugin = {
	pkg: require('../package.json'),
	defaults: require('./defaults'),
	alias: pkg.name,
	async register(container, options) {
		const logger = container.resolvePlugin('logger');
		//logger.info('Hello World!');
		
		if(!options.enabled) {
			logger.info(`[${this.alias}] Plugin is disabled!`);
			return;
		}

		logger.info(`[${this.alias}] Registering GPS tracker transaction...`);

		await Transactions.Handlers.Registry.registerTransactionHandler(GPSHandler);

		logger.info(`[${this.alias}] GPS tracker transaction registered.`);
	}
};