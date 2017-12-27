const schnorr = require('../schnorrSign.js');
var assert = require('assert');

describe('schnorrSign', function(){
    it('getPublic after key gen is not null', function(){
        schnorr.generateRandomKeyPair();
        assert(schnorr.getPublic);
    });
    
    it('getPublic before generation is not null', function(){
       assert(schnorr.getPublic()); 
    });
    
    it('Complete process works with generated key pair', function(){
        var message = {
            number : 99999901,
            name: "Test",
            char: 'B',
            boolean: true
        };
        schnorr.generateRandomKeyPair();
        var public = schnorr.getPublic();
        var signature = schnorr.signMessage(message);
        
        assert(schnorr.schnorrVerify(public, message, signature));
    });
    
    it('Verify fails with wrong public key', function(){
        var message = {
            number : 99999901,
            name: "Test",
            char: 'B',
            boolean: true
        };
        schnorr.generateRandomKeyPair();
        var public = schnorr.getPublic();
        var signature = schnorr.signMessage(message);
        var wrongPublic;
    
        do{
            schnorr.generateRandomKeyPair();
            wrongPublic = schnorr.getPublic();
        }while(wrongPublic == public);
        
        assert(!schnorr.schnorrVerify(wrongPublic, message, signature));
    });
});