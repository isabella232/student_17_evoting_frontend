/**
* Key Generation.
* This piece of code allows to generate a key pair and display it on the console.
* It will be used only in the case where the key pair needs to be changed.
*/

var crypto = require('./../dedis-js/crypto.js'),
    misc = require('./../dedis-js/misc.js');

var keyPair = crypto.generateRandomKeyPair();

console.log("Public key : \n"+misc.uint8ArrayToHex(crypto.marshal(keyPair.getPublic())));

console.log("Private key : \n"+keyPair.getPrivate());
