'use strict';

const EdDSA = require('elliptic').eddsa;
const BN = require('bn.js');
const ec = new EdDSA('ed25519');
const crypto = require('crypto');
const utils = require('./utils');

const basepoint = {
  x: '0x216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',
  y: '0x6666666666666666666666666666666666666666666666666666666666666658',
};

// 2^252 + 27742317777372353535851937790883648493)
const P = '0x1000000000000000000000000000000014def9dea2f79cd65812631a5cf5d3ed';
const PFSCALAR = new BN(utils.hexToUint8Array(P), 16, 'le');

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
 * Returns the little endian representation of the y coordinate of
 * the Point
 *
 * @returns {string}
 */
Point.prototype.toString = function() {
  const bytes = this.marshalBinary();
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
  const b1 = this.marshalBinary();
  const b2 = this.marshalBinary();
  for (var i = 0; i < 32; i++) {
    if (b1[i] !== b2[i]) {
      return false;
    }
  }
  return true;
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
  let x_arr = utils.hexToUint8Array(basepoint.x);
  let y_arr = utils.hexToUint8Array(basepoint.y);

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

/**
 * Returns a Point with data embedded in the y coordinate
 *
 * @param {Uint8Array} data to embed with length <= embedLen
 *
 * @throws {TypeError} if data is not Uint8Array
 * @throws {Error} if data.length > embedLen
 * @returns {object}
 */
Point.prototype.embed = function(data) {
  if (data.constructor !== Uint8Array) {
    throw TypeError;
  }

  let dl = this.embedLen();
  if (data.length > dl) {
    throw Error;
  }

  if (dl > data.length) {
    dl = data.length;
  }

  let point_obj  = new Point();
  while(true) {
    let buff = crypto.randomBytes(32);
    let bytes = Uint8Array.from(buff);

    if (dl > 0) {
      bytes[0] = dl; // encode length in lower 8 bits
      bytes.set(data, 1) // copy in data to embed
    }

    let bnp = new BN(bytes, 16, 'le');

    if (bnp.cmp(PFSCALAR) > 0) {
      continue; // try again
    }

    try {
      point_obj.unmarshalBinary(bytes);
    } catch(e) {
      continue; // try again
    }
    if (dl == 0) {
      if (point_obj.equal(null_point)) {
        continue; // unlucky
      }
      return point_obj;
    }

    let q = new Point();
    q.mul(PFSCALAR, point_obj);
    if (q.equal(null_point)) {
      return point_obj;
    }
  }
}

/**
 * Extract embedded data from a point
 *
 * @throws {Error} when length of embedded data > embedLen
 * @returns {Uint8Array}
 */
Point.prototype.data = function() {
  const bytes = this.marshalBinary();
  const dl = bytes[0];
  if (dl > this.embedLen()) {
    throw Error;
  }
  return bytes.slice(1, dl + 1);
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
 * Multiply point p by scalar s
 *
 * @param {object} s Scalar
 * @param {object} p Point
 * @returns {object}
 */
Point.prototype.mul = function(s, p) {
  this.ref.point = p.ref.point.mul(s);
  return this;
}

/**
 * Selects a random point
 *
 * @returns {object}
 */
Point.prototype.pick = function() {
  return this.embed(new Uint8Array());
}

Point.prototype.marshalSize = function() {
  return 32;
}

/**
 * Convert a ed25519 curve point into a byte representation
 *
 * @returns {Uint8Array} byte representation
 */
Point.prototype.marshalBinary = function() {
  this.ref.point.normalize();

  const buffer = this.ref.point.getY().toArray('le', 32);
  buffer[31] ^= (this.ref.point.x.isOdd() ? 1 : 0) << 7;

  return new Uint8Array(buffer);
}

/**
 * Convert a Uint8Array back to a ed25519 curve point
 * {@link tools.ietf.org/html/rfc8032#section-5.1.3}
 * @param {Uint8Array} bytes
 *
 * @throws {TypeError} when bytes is not Uint8Array
 * @throws {Error} when bytes does not correspond to a valid point
 * @returns {object}
 */
Point.prototype.unmarshalBinary = function(bytes) {
  if (bytes.constructor !== Uint8Array) {
    throw new TypeError;
  }

  const odd = (bytes[31] >> 7) == 1;

  bytes[31] &= 0x7F;
  let bnp = new BN(bytes, 16, 'le');
  if (bnp.cmp(ec.curve.p) >= 0) {
    throw new Error
  }
  this.ref.point = ec.curve.pointFromY(new BN(bytes, 16, 'le'), odd);
  return this;
}


const null_point = new Point().null();
