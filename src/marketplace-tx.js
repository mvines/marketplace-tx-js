function MarketplaceTx(web3, config, logger) {
  /* eslint-disable global-require */
  // ensure this is called before requiring the submodules
  const resolvedConfig = require('../config')(config);

  require('./logger/setup')(logger);
  const blockchain = require('./support/blockchain').initBlockchain(web3);

  this.constants = require('./support/constants');
  this.coin = require('./support/coin');
  this.token = require('./token');
  this.util = require('./support/util');
  this.escrow = require('./escrow');
  this.errors = require('./support/errors');
  this.asserts = require('./support/asserts');
  this.ontology = require('./ontology');
  this.pricing = require('./pricing');
  this.idvRegistry = require('./idv-registry');
  this.transactionDetails = require('./support/transactionDetails');
  /* eslint-enable global-require */

  if (resolvedConfig.preloadContracts) {
    /**
     * Initialises all contracts found in the contracts directory,
     * throwing an error if any are not found on the blockchain.
     */
    Promise.all(this.constants.CONTRACTS.forEach(contract => blockchain.contractInstance(contract))).catch(error => {
      throw error;
    });
  }
}

module.exports = MarketplaceTx;
