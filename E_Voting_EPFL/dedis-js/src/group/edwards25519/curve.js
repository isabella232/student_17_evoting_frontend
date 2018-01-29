'use strict'

const Scalar = require('./scalar');
const Point = require('./point');
const crypto = require('crypto');

module.exports = Curve;

function Curve() {
}


/**
 * Return the name of the curve
 *
 * @returns {undefined}
 */
Curve.prototype.string = function() {
  return "Ed25519";
}

/**
 * Returns 32, the size in bytes of a Scalar on Ed25519 curve
 *
 * @returns {number}
 */
Curve.prototype.scalarLen = function() {
  return 32;
}

/**
 * Returns a new Scalar for the prime-order subgroup of Ed25519 curve
 *
 * @returns {Scalar}
 */
Curve.prototype.scalar = function() {
  return new Scalar();
}

/**
 * Returns 32, the size of a Point on Ed25519 curve
 *
 * @returns {number}
 */
Curve.prototype.pointLen = function() {
  return 32;
}

/**
 * Creates a new point on the Ed25519 curve
 *
 * @returns {Point}
 */
Curve.prototype.point = function() {
  return new Point();
}

/**
 * NewKey returns a formatted Ed25519 key (avoiding subgroup attack by requiring
 * it to be a multiple of 8).
 * @returns {undefined}
 */
Curve.prototype.newKey = function() {
  let bytes = crypto.randomBytes(32);
  let hash = crypto.createHash('sha512');
  hash.update(bytes);
  let scalar = Uint8Array.from(hash.digest());
  scalar[0] &= 0xf8;
  scalar[31] &= 0x3f;
  scalar[31] &= 0x40;

  return this.scalar().setBytes(scalar);
}
