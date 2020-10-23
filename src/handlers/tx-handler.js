const GPSTransaction = require('../transactions/tx-transaction');
const Transactions = require('@arkecosystem/core-transactions');
const WalletAttributes = require('./wallet-attributes');
const Errors = require('../errors');
const Events = require('../events');

class GPSHandler extends Transactions.Handlers.TransactionHandler {
	getConstructor() {
		return GPSTransaction;
	}

	dependencies() {
		return [];
	}

	isActivated() {
		return true;
	}

	hasVendorField() {
		return true;
	}

	async bootstrap(connection, walletManager) {
		const reader = await Transactions.TransactionReader.create(connection, this.getConstructor());

		while(reader.hasNext()) {
			const transactions = await reader.read();

			for(const transaction of transactions) {
				const wallet = walletManager.findByAddress(transaction.recipientId);

				wallet.setAttribute(WalletAttributes.IS_RENTED, true);
				walletManager.reindex(wallet);
			}
		}
	}

	async throwIfCannotBeApplied(transaction, sender, walletManager) {
		if(!transaction.data.asset.sessionId || !transaction.data.asset.gps || !transaction.data.asset.rate) {
			throw new Errors.IncompleteAssetError();
		}

		await super.throwIfCannotBeApplied(transaction, sender, walletManager);
		/*
		if(sender.getAttribute(WalletAttributes.IS_REGISTERED_AS_SCOOTER)) {
			throw new Errors.ScooterIsNotAllowedToRentOrFinish();
		}

		const recipient = walletManager.findByAddress(transaction.data.recipientId);

		if(!recipient.getAttribute(WalletAttributes.IS_REGISTERED_AS_SCOOTER)) {
			throw new Errors.WalletIsNotRegisterdAsAScooter//();
		}

		if(recipient.getAttribute(WalletAttributes.IS_RENTED)) {
			throw new Errors.ScooterIsAlreadyRented();
		}*/
	}

	emitEvents(transaction, emitter) {
		emitter.emit(Events.RENTAL_START, transaction.data);
	}

	async canEnterTransactionPool(data, pool, processor) {
		const error = await this.typeFromSenderAlreadyInPool(data, pool, processor);

		if(error !== null) {
			processor.pushError(data, error.type, error.message);

			return false;
		}

		let transactions = processor.getTransactions().filter((transaction) => {
			return transaction.type === this.getConstructor().type && transaction.asset.sessionId === data.asset.sessionId;
		});

		if(transactions.length > 1) {
			processor.pushError(data, 'ERR_CONFLICT', `Address "${data.recipientId}" is already in use.`);

			return false;
		}

		transactions = Array.from(await pool.getTransactionsByType(this.getConstructor().type)).filter((transaction) => {
			return transaction.data.asset.sessionId === data.asset.sessionId;
		});

		if(transactions.length > 1) {
			processor.pushError(data, 'ERR_PENDING', `Address "${data.recipientId}" is already in the transaction pool.`);

			return false;
		}

		return null;
	}

	async applyToRecipient(transaction, walletManager) {
		const recipient = walletManager.findByAddress(transaction.data.recipientId);

		recipient.setAttribute(WalletAttributes.IS_RENTED, true);
		walletManager.reindex(recipient);
	}

	async revertForRecipient(transaction, walletManager) {
		const recipient = walletManager.findByAddress(transaction.data.recipientId);

		recipient.setAttribute(WalletAttributes.IS_RENTED, false);
		walletManager.reindex(recipient);
	}
}

module.exports = GPSHandler;