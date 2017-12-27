var ldap = require('ldapjs');
const assert = require('assert');

exports.getUserAttributes = getUserAttributes;

/**
 * LDAP requests function, allow to get the EPFL groups of a user and his section.
 * The result of the query will be given to the callback function given as a parameter in the form of an object.
 * This object has two fields : section and groups, both Arrays of Strings.
 * @param {String} the full name of the user we want to get the groups he belongs to.
 * @param {Function} callback The function where the the groups have to be used. 
*/
function getUserAttributes(name, callback){
    
    var done = false;

    var client = ldap.createClient({
        url: 'ldap://ldap.epfl.ch/'
    });
    
    var opts = {
        filter: '(&(objectClass=person)(cn='+name+'))',
        scope: 'sub',
        attributes: ['uniqueIdentifier', 'memberOf', 'dn']
    }

    client.search('o=epfl, c=ch', opts, function(err, res) {
        assert.ifError(err);
        res.on('searchEntry', function(entry) {
            if(!done){
                var answer = JSON.stringify(entry.object);
                
                //Extracting SCIPER
                var target = '"uniqueIdentifier":"';
                var sciper = answer.substr(answer.indexOf(target)+target.length, answer.length);
                sciper = sciper.substr(0, 6);
                
                //Extracting groups
                var toSkip = '"memberOf":';
                var groups = answer.substr(answer.indexOf(toSkip)+toSkip.length, answer.length);
                groups = groups.substr(0, (answer.indexOf(target) - answer.indexOf(toSkip) - toSkip.length));
                
                groups = groups.substr(groups.indexOf('[') + 1, groups.length);
                
                var gpArray = groups.split(",");
                for(var i = 0; i < gpArray.length; i++){
                    gpArray[i] = gpArray[i].substr(1, gpArray[i].length - 2);
                }
                
                //Extracting section
                var splittedSec = answer.split(',');
                
                var filtered = [];
                var elements = 0;
                for(var i = 0; i < splittedSec.length; i++){
                    var secFlag = "ou="
                    if(splittedSec[i].substr(0, 3) == secFlag){
                        filtered[elements++] = splittedSec[i].substr(secFlag.length, splittedSec[i].length);
                    }
                }
                
                var result = {
                    sciper : sciper,
                    section: filtered,
                    groups: gpArray
                }
                callback(result);
                done = true;
            }
          });
          res.on('searchReference', function(referral) {
              if(!done){
                console.log('referral: ' + referral.uris.join());
                  done = true;
              }
          });
          res.on('error', function(err) {
              if(!done){
                console.error('error: ' + err.message);
                  done = true;
              }
          });
          res.on('end', function(result) {
              if(!done){
                callback(null);
                  done = true;
              }
          });
    });
}
