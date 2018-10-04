/** @module support/blockchain */

const web3admin = require('web3admin');

const tx = require('./tx');
const sender = require('./sender');
const nonce = require('./nonce');
const transactionDetails = require('./transactionDetails');
const logger = require('../logger');

function Blockchain(web3) {
  web3admin.extend(web3);
  this.web3 = web3;

  nonce.web3 = web3;
  sender.web3 = web3;
  transactionDetails.web3 = web3;
  tx.web3 = web3;
}

Blockchain.prototype = {
  /**
   * Checks if the given address is valid
   *
   * @param address
   * @return {Promise<number>}
   */
  isAddress(addressToTest) {
    if (!this.web3.isAddress(addressToTest)) {
      throw new Error(`Address (${addressToTest}) is not a valid ETH address`);
    }
    return addressToTest;
  },

  /**
   * Returns the platform coin balance for the given address.
   *
   * @param address
   * @return {Promise<BigNumber>}
   */
  getBalance(address) {
    return new Promise((resolve, reject) => {
      this.web3.eth.getBalance(address, (err, balance) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(balance);
      });
    });
  },

  contractInstance(contractName) {
    return tx.contractInstance(contractName);
  },

  send(parameters) {
    return sender.send(parameters);
  },

  sendChain(parameters) {
    return sender.sendChain(parameters);
  },

  sendPlatformCoin(fromAddress, signTx, toAddress, value) {
    return sender.sendPlatformCoin({ fromAddress, signTx, toAddress, value }).catch(error => {
      logger.error(`Error transferring platform coin: ${error.message}`);
      throw error;
    });
  }
};

const me = {
  blockchain: null,
  initBlockchain(web3) {
    const blockchain = new Blockchain(web3);
    me.blockchain = blockchain;
    return blockchain;
  }
};
module.exports = me;
