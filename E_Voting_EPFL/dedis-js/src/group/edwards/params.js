"use strict";

/**
 * @module group/edwards
 */

module.exports = {
  c1174: {
    name: "Curve1174",
    p: "f7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff07",
    q: "71c966d15fd444893407d3dfc46579f7ffffffffffffffffffffffffffffff01",
    r: "4",
    a: "1",
    // -1174 mod p
    d: "61fbffffffffffffffffffffffffffffffffffffffffffffffffffffffffff07",
    fbx: "675c58c6643d2f9843cfa468dede70ec732df2e3e0bd7ca7bcd45e8b9797d403",
    fby: "c8cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc04",
    fullGroup: false
  },
  ed25519: {
    name: "Curve25519",
    p: "edffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    q: "edd3f55c1a631258d69cf7a2def9de1400000000000000000000000000000010",
    r: "8",
    a: "-1",
    d: "a3785913ca4deb75abd841414d0a700098e879777940c78c73fe6f2bee6c0352",
    pbx: "1ad5258f602d56c9b2a7259560c72c695cdcd6fd31e2a4c0fe536ecdd3366921",
    pby: "5866666666666666666666666666666666666666666666666666666666666666",
    fullGroup: false
  },
  e382: {
    name: "E-382",
    p:
      "97ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff3f",
    q:
      "19973cfd137ee273272d101b28695e7ce1ee951ef221fbd5ffffffffffffffffffffffffffffffffffffffffffffff0f",
    r: "8",
    a: "1",
    // -67254 mod p
    d:
      "e1f8feffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff3f",
    pbx:
      "0396f77094ccc0eb985310e8bc7d519311846453b8ba232935640b2b0340f868ae208d6ee95bf0e59103b2ead08d6f19",
    pby: "11",
    fullGroup: false
  },
  c41417: {
    name: "Curve41417",
    p:
      "efffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff3f",
    q:
      "79af06e1a5710e1b18cf63ad38031c6fb3226070cf1424c93cebffffffffffffffffffffffffffffffffffffffffffffffffff07",
    r: "8",
    a: "1",
    d: "210e",
    pbx:
      "95c5cbf31238fdc4647c53a8fa731a3011a16b6d4daba49854f37ff5c73ec0449f3646cd5f6e321c63c01802304314140549331a",
    pby:
      "22000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    fullGroup: false
  },
  e521: {
    name: "E-521",
    p:
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01",
    q:
      "6b0d18f53524ea40451f8f9a56c4d8fb043fc57e5eafb836f785fc4647c6b615fdffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
    r: "8",
    a: "1",
    // -376014 mod p
    d:
      "3143faffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff01",
    pbx:
      "6cba192f0a942a30aa38483613fbd059609cc98f569d94aeb13424c7ccc5ecf6133920c6c0c9f38bec18c8c62ff4d9bfa378286b29b20cf99d188b64485cb42c75",
    pby:
      "0c00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    fullGroup: false
  }
};
