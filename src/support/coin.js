const coin = {};
module.exports = coin;

const { blockchain } = require('./blockchain');

/**
 * Returns platform coin balance for given address.
 * @param address
 * @returns {Promise<any>}
 */
coin.getBalance = address => blockchain.getBalance(address);

coin.getBalances = function(users) {
  return Promise.all(
    users.map(user => coin.getBalance(user.address).then(balance => Object.assign({}, user, { balance })))
  );
};

coin.transfer = function(fromAddress, signTx, toAddress, value) {
  return blockchain.sendPlatformCoin(fromAddress, signTx, toAddress, value);
};
