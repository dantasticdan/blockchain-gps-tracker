const pkg = require('../package.json');
exports.plugin = {
	pkg: pkg,
	defaults: {},
	alias: pkg.name,
	async register(container, options) {
		const logger = container.resolvePlugin('logger');
		
        logger('Hello World!');
	}
};