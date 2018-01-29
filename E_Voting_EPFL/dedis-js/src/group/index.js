"use strict";

const curve25519 = require("./edwards");
const edwards25519 = require("./edwards25519");
const nist = require("./nist");

module.exports = {
  curve25519,
  edwards25519,
  nist
};
