'use strict';

const EdDSA = require('elliptic').eddsa;
const ec = new EdDSA('ed25519');

const basepoint = {
  x: '0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',
  y: '0x6666666666666666666666666666666666666666666666666666666666666658',
};

module.exports = Point;

/**
 * Represents a Point on the twisted edwards curve
 * (X:Y:Z:T) satisfying x=X/Z, y=Y/Z, XY=ZT
 * @constructor
 *
 * @param {(number|Uint8Array)} X
 * @param {(number|Uint8Array)} Y
 * @param {(number|Uint8Array)} Z
 * @param {(number|Uint8Array)} T
 */
function Point(X, Y, Z, T) {
  // the point reference is stored in an object to make set()
  // consistent.
  this.ref = {
    point: ec.curve.point(X, Y, Z, T)
  }
}

/**
 * Returns the big endian represenation of a hex string
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
  });
}

/**
 * Returns the little endian representation of the y coordinate of
 * the Point
 *
 * @returns {string}
 */
Point.prototype.toString = function() {
  // return a little endian representation
  return this.ref.point.getY().toArray('le').map(x => x.toString(16)).join('');
}

Point.prototype.string = Point.prototype.toString;

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
  return new Point(this.ref.point.getX(), this.ref.point.getY());
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

  this.ref.point = ec.curve.point(x_arr, y_arr)
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
  this.ref.point = ec.curve.point(p1.ref.point.getX(), p1.ref.point.getY()).add(p2.ref.point);
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
  this.ref.point = ec.curve.point(p1.ref.point.getX(), p1.ref.point.getY()).add(p2.ref.point.neg());
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
