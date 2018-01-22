'use strict';

const BN = require('bn.js');
const crypto = require('crypto');
const utils = require('./utils');
const P = '0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed';

const PFSCALAR = new BN(utils.hexToUint8Array(P), 16, 'le');

// RED is constant because reduction operations require the same instance
// across operations
const RED = BN.red(PFSCALAR);

module.exports = Scalar;

/**
 * Scalar represents a value in GF(2^252 + 27742317777372353535851937790883648493)
 * @Constructor
 */
function Scalar() {
  this.ref = {
    arr: new BN(0, 16).toRed(RED)
  }
}

/**
 * Equality test for two Scalars derived from the same Group
 *
 * @param {object} s2 Scalar
 * @returns {boolean}
 */
Scalar.prototype.equal = function(s2) {
  return this.ref.arr.cmp(s2.ref.arr) == 0;
}

/**
 * Sets the receiver equal to another Scalar a
 *
 * @param {object} a Scalar
 * @returns {object}
 */
Scalar.prototype.set = function(a) {
  this.ref = a.ref;
  return this;
}

/**
 * Returns a copy of the scalar
 *
 * @returns {object}
 */
Scalar.prototype.clone = function() {
  return new Scalar().setBytes(new Uint8Array(this.ref.arr.fromRed().toArray('le')));
}

/**
 * Set to the additive identity (0)
 *
 * @returns {object}
 */
Scalar.prototype.zero = function() {
  this.ref.arr = new BN(0, 16).toRed(RED);
  return this;
}

/**
 * Set to the modular sums of scalars s1 and s2
 *
 * @param {object} s1 Scalar
 * @param {object} s2 Scalar
 * @returns {object} s1 + s2
 */
Scalar.prototype.add = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redAdd(s2.ref.arr);
  return this;
}

/**
 * Set to the modular difference
 *
 * @param {object} s1 Scalar
 * @param {object} s2 Scalar
 * @returns {object} s1 - s2
 */
Scalar.prototype.sub = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redSub(s2.ref.arr);
  return this;
}

/**
 * Set to the modular negation of scalar a
 *
 * @param {object} a Scalar
 * @returns {object}
 */
Scalar.prototype.neg = function(a) {
  this.ref.arr = a.ref.arr.redNeg();
  return this;
}

/**
 * Set to the multiplicative identity (1)
 *
 * @returns {object}
 */
Scalar.prototype.one = function() {
  this.ref.arr = new BN(1, 16).toRed(RED);
  return this;
}

/**
 * Set to the modular products of scalars s1 and s2
 *
 * @param {object} s1
 * @param {object} s2
 * @returns {object}
 */
Scalar.prototype.mul = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redMul(s1.ref.arr);
  return this;
}

/**
 * Set to the modular division of scalar s1 by scalar s2
 *
 * @param s1
 * @param s2
 * @returns {object}
 */
Scalar.prototype.div = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redMul(s2.ref.arr.redInvm())
  return this;
}

/**
 * Set to the modular inverse of scalar a
 *
 * @param a
 * @returns {object}
 */
Scalar.prototype.inv = function(a) {
  this.ref.arr = a.ref.arr.redInvm();
  return this;
}

/**
 * Sets the scalar from little-endian Uint8Array
 * and reduces to the appropriate modulus
 * @param b
 *
 * @throws {TypeError} when b is not Uint8Array
 * @returns {object}
 */
Scalar.prototype.setBytes = function(b) {
  if (b.constructor !== Uint8Array) {
    throw new TypeError;
  }
  this.ref.arr = new BN(b, 16, 'le').toRed(RED);
  return this;
}

/**
 * Returns a big-endian representation of the scalar
 *
 * @returns {Uint8Array}
 */
Scalar.prototype.bytes = function() {
  return this.ref.arr.fromRed().toArray('be', 32);
}

Scalar.prototype.toString = function() {
  let bytes = this.ref.arr.fromRed().toArray('le', 32);
  return Array.from(bytes, b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

/**
 * Set to a random scalar
 *
 * @returns {object}
 */
Scalar.prototype.pick = function() {
  let buff = crypto.randomBytes(32);
  let bytes = Uint8Array.from(buff);
  this.setBytes(bytes);
  return this;
}

Scalar.prototype.inspect = Scalar.prototype.toString;
Scalar.prototype.string = Scalar.prototype.toString;
