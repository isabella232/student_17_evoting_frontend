'use strict'

/**
 * Returns the little endian represenation of a hex string
 * as a Uint8Array
 * @private
 *
 * @param {string} hexString The hexstring to convert
 * @returns {Uint8Array}
 */
const hexToUint8Array = hexString => {
  if (typeof hexString !== 'string') {
    throw new TypeError;
  }

  let prefixRemoved = hexString.replace(/^0x/i, '');
  return new Uint8Array(Math.ceil(prefixRemoved.length / 2)).map((element, idx) => {
    return parseInt(prefixRemoved.substr(idx * 2, 2), 16);
  }).reverse();
}

module.exports = { hexToUint8Array };
