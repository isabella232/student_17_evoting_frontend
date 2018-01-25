"use strict";

const elliptic = require("elliptic");
const Scalar = require("./scalar");
const Point = require("./point");
const BN = require("bn.js");

/**
 * @module group/edwards
 */

/**
 * Class representing an EdwardsCurve
 * @class
 */
class EdwardsCurve {
  /**
   * Create an Edwards Curve
   *
   * @param {object} config - The curve configuration
   * @param {String} config.name - Name of the curve
   * @param {(String|Uint8Array|BN.jsObject)} config.p - Prime defining the underlying field. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.q - Order of the prime-order base point. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.r - Cofactor: Q * R is the total size of curve. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.a - Edwards Curve equation parameter. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.d - Edwards Curve equation parameter. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.fbx - Standard Base Point for full group. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.fby - Standard Base Point for full group. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.pbx - Standard Base Point for prime-order sub group. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.pby - Standard Base Point for prime-order subgroup. Little Endian if String or Uint8Array.
   * @param {Boolean} config.fullGroup - Flag for using full group
   * @constructor
   */
  constructor(config) {
    this.r = new BN(config.r, 16, "le");
    this.q = new BN(config.q, 16, "le");
    this.fullGroup = config.fullGroup;
    this.name = config.name;
    let options = {
      p: new BN(config.p, 16, "le"),
      a: new BN(config.a, 16, "le"),
      d: new BN(config.d, 16, "le"),
      c: "1",
      n: new BN(config.q, 16, "le")
    };
    let g = this.fullGroup
      ? [new BN(config.fbx, 16, "le"), new BN(config.fby, 16, "le")]
      : [new BN(config.pbx, 16, "le"), new BN(config.pby, 16, "le")];

    // if no base point given, find the one with the lowest y coordinate
    if (g[1].cmp(new BN(0)) !== 0) {
      options.g = g;
      this.curve = new elliptic.curve.edwards(options);
    } else {
      this.curve = new elliptic.curve.edwards(options);
      this._selectBasePoint();
    }
    this.order = this.q.toRed(this.curve.red);
    this.cofact = this.r.toRed(this.curve.red);
    this.order = this.fullGroup ? this.r.mul(this.curve.n) : this.curve.n;

    // sanity check
    if (!this.curve.validate(this.curve.g)) {
      throw new Error("Invalid Curve");
    }
    if (!this.fullGroup) {
      if (!this.curve.g.mul(this.curve.n).isInfinity()) {
        throw new Error("Invalid Curve, G*Q != 0");
      }
    }
  }

  /**
   * Sets a base point for the curve if none is specified
   * in the options
   *
   * @private
   */
  _selectBasePoint() {
    let point;
    let y;
    y = new BN(2).toRed(this.curve.red);
    const one = new BN(1).toRed(this.curve.red);
    while (true) {
      try {
        point = this.curve.pointFromY(y);
        if (point.x.isOdd()) {
          point = point.neg();
        }
        if (this.curve.validate(point)) {
          break;
        }
        point = point.neg();
        if (this.curve.validate(point)) {
          break;
        }
      } catch (e) {}
      y.redIAdd(one);
    }
    this.curve.g = point;
  }

  /**
   * Returns the name of the curve
   *
   * @return {string}
   */
  string() {
    return this.name;
  }

  /**
   * Returns the length of the scalar
   *
   * @return {number}
   */
  scalarLen() {
    return Math.floor((this.order.bitLength() + 7) / 8);
  }

  /**
   * Returns a new scalar instance
   *
   * @return {module:group/edwards~Scalar}
   */
  scalar() {
    return new Scalar(this);
  }

  /**
   * Returns the length in bytes of a Point
   *
   * @return {number}
   */
  pointLen() {
    return Math.floor((this.curve.p.bitLength() + 7 + 1) / 8);
  }

  /**
   * Returns a new Point on the curve
   *
   * @return {module:group/edwards~Point}
   */
  point() {
    return new Point(this);
  }
}

module.exports = EdwardsCurve;
