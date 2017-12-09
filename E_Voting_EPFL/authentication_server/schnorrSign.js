/**
* Schnorr sign.
* Takes care of the operations relative to the Schnorr Signature.
*/

var crypto = require('./../dedis-js/src/crypto.js'),
    misc = require('./../dedis-js/src/misc.js'),
    bn = require('bn.js'),
    config_file = require('./server_config.ini');

exports.signMessage = signMessage;
exports.schnorrVerify = schnorrVerify;

/**
 * Perform a Schnorr signature on a given message with the private_key of the
 * configuration file.
 already generated.
 *
 * @param {Uint8Array} message to be signed
 * 
 * @returns {Uint8Array} signature
 */
function signMessage(message){
    var secret = new bn(config_file.private_key);
    return crypto.schnorrSign(crypto.toRed(secret), message);
}

/**
 * Verify a given Schnorr signature with the configuration public key.
 *
 * @param {Uint8Array} message
 * @param {Uint8Array} signature to be verified
 *
 * @returns {boolean}
 */
function schnorrVerify(message, signature){
    var key = config_file.public_key;
    var uint8 = misc.hexToUint8Array(key);
    var unPub = crypto.unmarshal(uint8);
    return crypto.schnorrVerify(unPub, message, signature);
}