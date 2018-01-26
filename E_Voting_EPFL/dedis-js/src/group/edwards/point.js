"use strict";

const BN = require("bn.js");
const crypto = require("crypto");

module.exports = Point;

/**
 * @module group/edwards
 */

/**
 * Represents a Point on the twisted edwards curve
 * (X:Y:Z:T) satisfying x=X/Z, y=Y/Z, XY=ZT
 *
 * The value of the parameters is expected in little endian form if being
 * passed as a Uint8Array
 * @constructor
 *
 * @param {module:group/edwards~EdwardsCurve} curve - Edwards Curve
 * @param {(number|Uint8Array|BN.jsObject)} X
 * @param {(number|Uint8Array|BN.jsObject)} Y
 * @param {(number|Uint8Array|BN.jsObject)} Z
 * @param {(number|Uint8Array|BN.jsObject)} T
 */
function Point(curve, X, Y, Z, T) {
  let _X = X || null;
  let _Y = Y || null;
  let _Z = Z || null;
  let _T = T || null;

  if (X !== undefined && X.constructor === Uint8Array) {
    _X = new BN(X, 16, "le");
  }
  if (Y !== undefined && Y.constructor === Uint8Array) {
    _Y = new BN(Y, 16, "le");
  }
  if (Z !== undefined && Z.constructor === Uint8Array) {
    _Z = new BN(Z, 16, "le");
  }
  if (T !== undefined && T.constructor === Uint8Array) {
    _T = new BN(T, 16, "le");
  }

  // the point reference is stored in an object to make set()
  // consistent.
  this.ref = {
    curve: curve,
    point: curve.curve.point(_X, _Y, _Z, _T)
  };
}

/**
 * Returns the little endian representation of the y coordinate of
 * the Point
 *
 * @return {string}
 */
Point.prototype.toString = function() {
  const bytes = this.marshalBinary();
  return Array.from(bytes, b => ("0" + (b & 0xff).toString(16)).slice(-2)).join(
    ""
  );
};

Point.prototype.string = Point.prototype.toString;
Point.prototype.inspect = Point.prototype.toString;

/**
 * Tests for equality between two Points derived from the same group
 *
 * @param {module:group/edwards~Point} p2 Point object to compare
 * @return {boolean}
 */
Point.prototype.equal = function(p2) {
  return this.ref.point.eq(p2.ref.point);
  const b1 = this.marshalBinary();
  const b2 = this.marshalBinary();
  for (let i = 0; i < this.ref.curve.pointLen(); i++) {
    if (b1[i] !== b2[i]) {
      return false;
    }
  }
  return true;
};

// Set point to be equal to p2

/**
 * set Set the current point to be equal to p2
 *
 * @param {module:group/edwards~Point} p2 Point object
 * @return {module:group/edwards~Point}
 */
Point.prototype.set = function(p2) {
  this.ref = p2.ref;
  return this;
};

/**
 * Creates a copy of the current point
 *
 * @return {module:group/edwards~Point} new Point object
 */
Point.prototype.clone = function() {
  const point = this.ref.point;
  return new Point(this.ref.curve, point.x, point.y, point.z, point.t);
};

/**
 * Set to the neutral element, which is (0, c) for Edwards Curve
 *
 * @return {module:group/edwards~Point}
 */
Point.prototype.null = function() {
  this.ref.point = this.ref.curve.curve.point(0, this.ref.curve.curve.c);
  return this;
};

/**
 * Set to the standard base point for this curve
 *
 * @return {module:group/edwards~Point}
 */
Point.prototype.base = function() {
  this.ref.point = this.ref.curve.curve.point(
    this.ref.curve.g.getX(),
    this.ref.curve.curve.g.getY()
  );
  return this;
};

/**
 * Returns the length (in bytes) of the embedded data
 *
 * @return {number}
 */
Point.prototype.embedLen = function() {
  // Reserve the most-significant 8 bits for pseudo-randomness.
  // Reserve the least-significant 8 bits for embedded data length.
  // (Hopefully it's unlikely we'll need >=2048-bit curves soon.)
  return Math.floor((this.ref.curve.curve.p.bitLength() - 8 - 8) / 8);
};

/**
 * Returns a Point with data embedded in the y coordinate
 *
 * @param {Uint8Array} data to embed with length <= embedLen
 *
 * @throws {TypeError} if data is not Uint8Array
 * @throws {Error} if data.length > embedLen
 * @return {module:group/edwards~Point}
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

  let pointObj = new Point(this.ref.curve);
  const nullPoint = new Point(this.ref.curve).null();
  while (true) {
    let buff = crypto.randomBytes(this.ref.curve.pointLen());
    let bytes = Uint8Array.from(buff);

    if (dl > 0) {
      bytes[0] = dl; // encode length in lower 8 bits
      bytes.set(data, 1); // copy in data to embed
    }

    let bnp = new BN(bytes, 16, "le");

    if (bnp.cmp(this.ref.curve.curve.n) > 0) {
      continue; // try again
    }

    try {
      pointObj.unmarshalBinary(bytes);
    } catch (e) {
      continue; // try again
    }

    // if we are using full group then return the point
    if (this.ref.curve.fullGroup) {
      return pointObj;
    }

    // We're using prime-order subgroup so we need to ensure the
    // point is in the subgroup. If we are not trying to embed data then we
    // can convert our point into one in subgroup by multiplying with cofactor
    //
    if (dl == 0) {
      pointObj.ref.point = pointObj.ref.point.mul(this.ref.curve.cofact);
      if (pointObj.equal(nullPoint)) {
        continue; // unlucky
      }
      return pointObj;
    }

    let q = new Point(this.ref.curve);
    q.mul(this.ref.curve.order, pointObj);
    if (q.equal(nullPoint)) {
      return pointObj;
    }
  }
};

/**
 * Extract embedded data from a point
 *
 * @throws {Error} when length of embedded data > embedLen
 * @return {Uint8Array}
 */
Point.prototype.data = function() {
  const bytes = this.marshalBinary();
  const dl = bytes[0];
  if (dl > this.embedLen()) {
    throw Error;
  }
  return bytes.slice(1, dl + 1);
};

/**
 * Returns the sum of two points on the curve
 *
 * @param {module:group/edwards~Point} p1 Point object, addend
 * @param {module:group/edwards~Point} p2 Point object, addend
 * @return {module:group/edwards~Point} p1 + p2
 */
Point.prototype.add = function(p1, p2) {
  const point = p1.ref.point;
  this.ref.point = this.ref.curve.curve
    .point(point.x, point.y, point.z, point.t)
    .add(p2.ref.point);
  return this;
};

/**
 * Subtract two points
 *
 * @param {module:group/edwards~Point} p1 Point object
 * @param {module:group/edwards~Point} p2 Point object
 * @return {module:group/edwards~Point} p1 - p2
 */
Point.prototype.sub = function(p1, p2) {
  const point = p1.ref.point;
  this.ref.point = this.ref.curve.curve
    .point(point.x, point.y, point.z, point.t)
    .add(p2.ref.point.neg());
  return this;
};

/**
 * Finds the negative of a point p
 * For Edwards Curves, the negative of (x, y) is (-x, y)
 *
 * @param {module:group/edwards~Point} p Point to negate
 * @return {module:group/edwards~Point} -p
 */
Point.prototype.neg = function(p) {
  this.ref.point = p.ref.point.neg();
  return this;
};

/**
 * Multiply point p by scalar s
 *
 * @param {module:group/edwards~Scalar} s Scalar
 * @param {module:group/edwards~Point} p Point
 * @return {module:group/edwards~Point}
 */
Point.prototype.mul = function(s, p) {
  this.ref.point = p.ref.point.mul(s);
  return this;
};

/**
 * Selects a random point
 *
 * @return {module:group/edwards~Point}
 */
Point.prototype.pick = function() {
  return this.embed(new Uint8Array());
};

Point.prototype.marshalSize = function() {
  return this.ref.curve.pointLen();
};

/**
 * Convert a ed25519 curve point into a byte representation
 *
 * @return {Uint8Array} byte representation
 */
Point.prototype.marshalBinary = function() {
  this.ref.point.normalize();

  const buffer = this.ref.point.getY().toArray("le", this.ref.curve.pointLen());
  buffer[this.ref.curve.pointLen() - 1] ^=
    (this.ref.point.x.isOdd() ? 1 : 0) << 7;

  return new Uint8Array(buffer);
};

/**
 * Convert a Uint8Array back to a ed25519 curve point
 * {@link tools.ietf.org/html/rfc8032#section-5.1.3}
 * @param {Uint8Array} bytes
 *
 * @throws {TypeError} when bytes is not Uint8Array
 * @throws {Error} when bytes does not correspond to a valid point
 * @return {module:group/edwards~Point}
 */
Point.prototype.unmarshalBinary = function(bytes) {
  if (bytes.constructor !== Uint8Array) {
    throw new TypeError();
  }

  const msbi = this.ref.curve.pointLen() - 1;
  const odd = bytes[msbi] >> 7 == 1;

  bytes[msbi] &= 0x7f;
  let bnp = new BN(bytes, 16, "le");
  if (bnp.cmp(this.ref.curve.curve.p) >= 0) {
    throw new Error();
  }
  this.ref.point = this.ref.curve.curve.pointFromY(
    new BN(bytes, 16, "le"),
    odd
  );
  return this;
};
