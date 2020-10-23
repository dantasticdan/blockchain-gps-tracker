module.exports = (() => {
	return process.argv.slice(2).reduce((args, arg, cur, arr) => {
		if(arg.match(/^--/)) {
			args[arg.substring(2)] = process.argv[process.argv.indexOf(arg) + 1] || true;
		} else if(arg.match(/^-[^-]/)) {
			for(let key of arg.substring(1).split('')) {
				args[key] = true;
			}
		}

		return args;
	}, {});
})();