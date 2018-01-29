"use strict";

const BN = require("bn.js");
const crypto = require("crypto");

module.exports = Scalar;

/**
 * @module group/nist
 */

/**
 * Scalar
 * @param {module:group/nist~Weierstrass} curve
 * @constructor
 */
function Scalar(curve) {
  this.ref = {
    arr: new BN(0, 16).toRed(curve.curve.red),
    curve: curve
  };
}

/**
 * Equality test for two Scalars derived from the same Group
 *
 * @param {module:group/nist~Scalar} s2 Scalar
 * @return {boolean}
 */
Scalar.prototype.equal = function(s2) {
  return this.ref.arr.cmp(s2.ref.arr) == 0;
};

/**
 * Sets the receiver equal to another Scalar a
 *
 * @param {module:group/nist~Scalar} a Scalar
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.set = function(a) {
  this.ref = a.ref;
  return this;
};

/**
 * Returns a copy of the scalar
 *
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.clone = function() {
  return new Scalar(this.ref.curve).setBytes(
    new Uint8Array(this.ref.arr.fromRed().toArray("le"))
  );
};

/**
 * Set to the additive identity (0)
 *
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.zero = function() {
  this.ref.arr = new BN(0, 16).toRed(this.curve.curve.red);
  return this;
};

/**
 * Set to the modular sums of scalars s1 and s2
 *
 * @param {module:group/nist~Scalar} s1 Scalar
 * @param {module:group/nist~Scalar} s2 Scalar
 * @return {module:group/nist~Scalar} s1 + s2
 */
Scalar.prototype.add = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redAdd(s2.ref.arr);
  return this;
};

/**
 * Set to the modular difference
 *
 * @param {module:group/nist~Scalar} s1 Scalar
 * @param {module:group/nist~Scalar} s2 Scalar
 * @return {module:group/nist~Scalar} s1 - s2
 */
Scalar.prototype.sub = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redSub(s2.ref.arr);
  return this;
};

/**
 * Set to the modular negation of scalar a
 *
 * @param {module:group/nist~Scalar} a Scalar
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.neg = function(a) {
  this.ref.arr = a.ref.arr.redNeg();
  return this;
};

/**
 * Set to the multiplicative identity (1)
 *
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.one = function() {
  this.ref.arr = new BN(1, 16).toRed(this.ref.curve);
  return this;
};

/**
 * Set to the modular products of scalars s1 and s2
 *
 * @param {module:group/nist~Scalar} s1
 * @param {module:group/nist~Scalar} s2
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.mul = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redMul(s1.ref.arr);
  return this;
};

/**
 * Set to the modular division of scalar s1 by scalar s2
 *
 * @param {module:group/nist~Scalar} s1
 * @param {module:group/nist~Scalar} s2
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.div = function(s1, s2) {
  this.ref.arr = s1.ref.arr.redMul(s2.ref.arr.redInvm());
  return this;
};

/**
 * Set to the modular inverse of scalar a
 *
 * @param {module:group/nist~Scalar} a
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.inv = function(a) {
  this.ref.arr = a.ref.arr.redInvm();
  return this;
};

/**
 * Sets the scalar from little-endian Uint8Array
 * and reduces to the appropriate modulus
 * @param {Uint8Array} b
 *
 * @throws {TypeError} when b is not Uint8Array
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.setBytes = function(b) {
  if (b.constructor !== Uint8Array) {
    throw new TypeError();
  }
  this.ref.arr = new BN(b, 16, "le").toRed(this.ref.curve);
  return this;
};

/**
 * Returns a big-endian representation of the scalar
 *
 * @return {Uint8Array}
 */
Scalar.prototype.bytes = function() {
  return new Uint8Array(this.ref.arr.fromRed().toArray("be", 32));
};

Scalar.prototype.toString = function() {
  let bytes = this.ref.arr.fromRed().toArray("le", 32);
  return Array.from(bytes, b => {
    return ("0" + (b & 0xff).toString(16)).slice(-2);
  }).join("");
};

/**
 * Set to a random scalar
 *
 * @return {module:group/nist~Scalar}
 */
Scalar.prototype.pick = function() {
  let buff = crypto.randomBytes(this.ref.curve.scalarLen());
  let bytes = Uint8Array.from(buff);
  this.setBytes(bytes);
  return this;
};

Scalar.prototype.inspect = Scalar.prototype.toString;
Scalar.prototype.string = Scalar.prototype.toString;

Scalar.prototype.marshalSize = function() {
  return this.ref.curve.scalarLen();
};

/**
 * Returns the binary representation (little endian) of the scalar
 *
 * @return {Uint8Array}
 */
Scalar.prototype.marshalBinary = function() {
  return new Uint8Array(
    this.ref.arr.fromRed().toArray("le", this.ref.curve.scalarLen())
  );
};

/**
 * Reads the binary representation (little endian) of scalar
 *
 * @param {Uint8Array} bytes
 * @return {undefined}
 */
Scalar.prototype.unmarshalBinary = function(bytes) {
  if (bytes.constructor !== Uint8Array) {
    throw TypeError;
  }

  if (bytes.length !== this.marshalSize()) {
    throw Error;
  }
  this.setBytes(bytes);
};
