const RentalStartHandler = require("./handlers/rental-start-handler");
const Transactions = require('@arkecosystem/core-transactions');

exports.plugin = {
	pkg: require('../package.json'),
	defaults: require('./defaults'),
	alias: 'dantasticdan:gps-transactions',
	async register(container, options) {
		const logger = container.resolvePlugin('logger');
		//logger.info('Hello World!');
		
		if(!options.enabled) {
			logger.info(`[${this.alias}] Plugin is disabled!`);
			return;
		}

		logger.info(`[${this.alias}] Registering GPS transaction...`);

		await Transactions.Handlers.Registry.registerTransactionHandler(RentalStartHandler);

		logger.info(`[${this.alias}] GPS transaction registered.`);
	}
};