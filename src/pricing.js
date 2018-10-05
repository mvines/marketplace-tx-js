/**
 * @module pricing
 *
 * @description Handles setting, retrieving and deleting prices for {@link CredentialItem}s in
 * the CvcPricing contract.
 */

/**
 * A credential item price entry in the Pricing contract. It refers to a
 * credential item in the ontology contract and its price for a given IDV
 * @global
 * @typedef {Object} module:price.CredentialItemPrice
 * @see CredentialItem
 * @property {string} id - The credential item price record internal ID.
 * @property {string} price - The price of the credential item in creds (CVC x 10e-8)
 * @property {string} idv - The address of the IDV to whom the price belongs
 * @property {string} type - The credential item type (e.g. credential, claim)
 * (see {@link CredentialItem}.type)
 * @property {string} name - The name of the credential item (unique for type and version)
 * (see {@link CredentialItem}.name)
 * @property {string} version - The credential item version (e.g. v1.0)
 * (see {@link CredentialItem}.version)
 * @property {boolean} deprecated - True if this is a deprecated credential item
 * that should no longer be used
 */

const pricing = {};
module.exports = pricing;

const { assertAddress, assertCredentialItemPrice } = require('./support/asserts');
const { CONTRACT_PRICING } = require('./support/constants');
const { NotFoundError } = require('./support/errors');
const { blockchain } = require('./support/blockchain');

/**
 * Maps an array with price data and returns the price object with corresponding properties.
 * @param {string} id - see {@link CredentialItemPrice}.id
 * @param {string} price - see {@link CredentialItemPrice}.price
 * @param {string} idv - see {@link CredentialItemPrice}.idv
 * @param {string} type - see {@link CredentialItemPrice}.type
 * @param {string} name - see {@link CredentialItemPrice}.name
 * @param {string} version - see {@link CredentialItemPrice}.version
 * @param {boolean} deprecated - see {@link CredentialItemPrice}.deprecated
 * @returns {CredentialItemPrice}
 */
const mapCredentialItemPrice = function([id, price, idv, type, name, version, deprecated]) {
  return {
    id,
    price,
    idv,
    credentialItem: { type, name, version },
    deprecated
  };
};

/**
 * Checks whether the price exists.
 * @param {Object} credentialItemPrice - an object containing an id of a
 * credential item price in the contract
 * @returns {*}
 */
const checkPriceIsSet = function(credentialItemPrice) {
  // By convention all existing records must have non empty ID.
  if (!credentialItemPrice.id || /0x0{64}/.test(credentialItemPrice.id)) {
    throw new NotFoundError('Undefined price');
  }

  return credentialItemPrice;
};

/**
 * @alias module:pricing.getPrice
 * @memberOf pricing
 * @description Retrieve credential Item price by type, name and version for specific IDV.
 * @param {string} idv - The IDV address
 * @param {string} type - see {@link CredentialItemPrice}.type
 * @param {string} name - see {@link CredentialItemPrice}.name
 * @param {string} version - see {@link CredentialItemPrice}.version
 * @returns {*}
 */
pricing.getPrice = function(idv, type, name, version) {
  assertAddress(idv);
  return blockchain
    .contractInstance(CONTRACT_PRICING)
    .then(instance => instance.getPrice(idv, type, name, version))
    .then(mapCredentialItemPrice)
    .then(checkPriceIsSet);
};

/**
 * @alias module:pricing.getAllPrices
 * @memberOf pricing
 * @description Returns all prices.
 * @return {Promise<array>}
 */
pricing.getAllPrices = function() {
  return blockchain
    .contractInstance(CONTRACT_PRICING)
    .then(instance =>
      instance
        .getAllIds()
        .then(ids => Promise.all(ids.map(id => instance.getPriceById(id).then(mapCredentialItemPrice))))
    );
};

/**
 * @alias module:pricing.setPrice
 * @memberOf pricing
 * @description Set credential Item price by type, name and version for specific IDV.
 * @see CredentialItem
 * @param {string} fromAddress - The address of the sender.
 * @param {function} signTx - The callback to use to sign the transaction
 * @param {string} type - see {@link CredentialItemPrice}.type
 * @param {string} name - see {@link CredentialItemPrice}.name
 * @param {string} version - see {@link CredentialItemPrice}.version
 * @param {string} price - the credential item price in creds (CVC x 10e-8)
 * @returns {*}
 */
pricing.setPrice = function(fromAddress, signTx, type, name, version, price) {
  assertAddress(fromAddress);
  assertCredentialItemPrice(price);
  return blockchain.send({
    fromAddress,
    signTx,
    contractName: CONTRACT_PRICING,
    method: 'setPrice',
    params: [type, name, version, price]
  });
};

/**
 * @alias module:pricing.deletePrice
 * @memberOf pricing
 * @description Deletes a credential Item price by type, name and version for specific IDV.
 * @see CredentialItem
 * @param {string} fromAddress - The address of the sender.
 * @param {function} signTx - The callback to use to sign the transaction
 * @param {string} type - see {@link CredentialItemPrice}.type
 * @param {string} name - see {@link CredentialItemPrice}.name
 * @param {string} version - see {@link CredentialItemPrice}.version
 * @returns {*}
 */
pricing.deletePrice = function(fromAddress, signTx, type, name, version) {
  assertAddress(fromAddress);
  return blockchain.send({
    fromAddress,
    signTx,
    contractName: CONTRACT_PRICING,
    method: 'deletePrice',
    params: [type, name, version]
  });
};
