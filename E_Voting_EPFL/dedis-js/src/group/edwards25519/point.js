'use strict';

const EdDSA = require('elliptic').eddsa;
const BN = require('bn.js');
const ec = new EdDSA('ed25519');

const basepoint = {
  x: '0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',
  y: '0x6666666666666666666666666666666666666666666666666666666666666658',
};

module.exports = Point;

/**
 * Represents a Point on the twisted edwards curve
 * (X:Y:Z:T) satisfying x=X/Z, y=Y/Z, XY=ZT
 *
 * The value of the parameters is expected in little endian form if being
 * passed as a Uint8Array
 * @constructor
 *
 * @param {(number|Uint8Array|BN.jsObject)} X
 * @param {(number|Uint8Array|BN.jsObject)} Y
 * @param {(number|Uint8Array|BN.jsObject)} Z
 * @param {(number|Uint8Array|BN.jsObject)} T
 */
function Point(X, Y, Z, T) {
  let _X = X;
  let _Y = Y;
  let _Z = Z;
  let _T = T;

  if (X !== undefined && X.constructor === Uint8Array) {
    _X = new BN(X, 16, 'le');
  }
  if (Y !== undefined && Y.constructor === Uint8Array) {
    _Y = new BN(Y, 16, 'le');
  }
  if (Z !== undefined && Z.constructor === Uint8Array) {
    _Z = new BN(Z, 16, 'le');
  }
  if (T !== undefined && T.constructor === Uint8Array) {
    _T = new BN(T, 16, 'le');
  }
  // the point reference is stored in an object to make set()
  // consistent.
  this.ref = {
    point: ec.curve.point(_X, _Y, _Z, _T)
  }
}

/**
 * Returns the little endian represenation of a hex string
 * as a Uint8Array
 * @private
 *
 * @param {string} hexString The hexstring to convert
 * @returns {Uint8Array}
 */
Point.prototype._hexToUint8Array = function(hexString) {
  if (typeof hexString !== 'string') {
    throw new TypeError;
  }

  let prefixRemoved = hexString.replace(/^0x/i, '');
  return new Uint8Array(Math.ceil(prefixRemoved.length / 2)).map((element, idx) => {
    return parseInt(prefixRemoved.substr(idx * 2, 2), 16);
  }).reverse();
}

/**
 * Returns the little endian representation of the y coordinate of
 * the Point
 *
 * @returns {string}
 */
Point.prototype.toString = function() {
  const bytes = this.ref.point.getY().toArray('le', 32);
  return Array.from(bytes, b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

Point.prototype.string = Point.prototype.toString;
Point.prototype.inspect = Point.prototype.toString;

/**
 * Tests for equality between two Points derived from the same group
 *
 * @param {object} p2 Point object to compare
 * @returns {boolean}
 */
Point.prototype.equal = function(p2) {
  return this.ref.point.eq(p2.ref.point);
}

// Set point to be equal to p2

/**
 * set Set the current point to be equal to p2
 *
 * @param {object} p2 Point object
 * @returns {object}
 */
Point.prototype.set = function(p2) {
  this.ref = p2.ref;
  return this;
}

/**
 * Creates a copy of the current point
 *
 * @returns {object} new Point object
 */
Point.prototype.clone = function() {
  const point = this.ref.point;
  return new Point(point.x, point.y, point.z, point.t);
}

/**
 * Set to the neutral element, which is (0, 1) for twisted Edwards
 * Curve
 *
 * @returns {object}
 */
Point.prototype.null = function() {
  this.ref.point = ec.curve.point(0, 1, 1, 0);
  return this;;
}

/**
 * Set to the standard base point for this curve
 *
 * @returns {object}
 */
Point.prototype.base = function() {
  let x_arr = this._hexToUint8Array(basepoint.x);
  let y_arr = this._hexToUint8Array(basepoint.y);

  this.ref.point = ec.curve.point(new BN(x_arr, 16, 'le'), new BN(y_arr, 16, 'le'));
  return this;
}

/**
 * Returns the length (in bytes) of the embedded data
 *
 * @returns {number}
 */
Point.prototype.embedLen = function() {
  // Reserve the most-significant 8 bits for pseudo-randomness.
  // Reserve the least-significant 8 bits for embedded data length.
  // (Hopefully it's unlikely we'll need >=2048-bit curves soon.)
  return Math.floor((255 - 8 - 8) / 8);
}

Point.prototype.embed = function() {
  // TODO after implementing mul
}

Point.prototype.data = function() {
  // TODO
}

/**
 * Returns the sum of two points on the curve
 *
 * @param {object} p1 Point object, addend
 * @param {object} p2 Point object, addend
 * @returns {object} p1 + p2
 */
Point.prototype.add = function(p1, p2) {
  const point = p1.ref.point;
  this.ref.point = ec.curve.point(point.x, point.y, point.z, point.t).add(p2.ref.point);
  return this;
}

/**
 * Subtract two points
 *
 * @param {object} p1 Point object
 * @param {object} p2 Point object
 * @returns {object} p1 - p2
 */
Point.prototype.sub = function(p1, p2) {
  const point = p1.ref.point;
  this.ref.point = ec.curve.point(point.x, point.y, point.z, point.t).add(p2.ref.point.neg());
  return this;
}

/**
 * Finds the negative of a point p
 * For Edwards Curves, the negative of (x, y) is (-x, y)
 *
 * @param {object} p Point to negate
 * @returns {object} -p
 */
Point.prototype.neg = function(p) {
  this.ref.point = p.ref.point.neg();
  return this;
}

/**
 * mul Multiplies a point with a scalar s
 *
 * @param {object} s scalar
 * @returns {object} Point sP
 */
Point.prototype.mul = function(s) {
  // TODO after implementing scalar
}

Point.prototype.pick = function() {
  // TODO
}
