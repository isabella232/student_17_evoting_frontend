/**
* Communication.
* Contains all the methods relative to the communication between the frontend and the cothority.
*/


var socket;
var userSciper;
var recoveredElections;
var sessionToken;


/**
* Send a Login message to the cothority, asking for available elections.
*
* @param String sciper : the sciper of the user.
* @param Byte[] signature : the signature of the authentication server.
*/
function sendLoginRequest(sciper, signature){

	const loginRequest = {
            master : masterPin,
            user : sciper,
            signature : signature
        }
    
	socket.send('Login', 'LoginReply', loginRequest).then((data) => {
		clearDisplay();
		sessionToken = data.token;
		recoveredElections = data.elections;
		recoveredElections = recoveredElections.sort(compareByDate); //Sort election by deadlines.
		displayElections(recoveredElections);
	}).catch((err) => {
		displayError('An error occured during the login, please try again later.');
		console.log(err);
	});
    
}


/**
* Send a Cast message to the election. An encrypted ballot is sent with the given choice in it.
*
* @param Election election : the elections we want to vote in.
* @param Number choice : the choice of the user in the election.
*
* @throw TypeError if choice is not a number.
* @throw TypeError if the key field of the election is invalid.
* @throw TypeError if the id field of the election is invalid.
* @throw RangeError if the choice is not a 6 or 7 digits.
*/
function submitVote(election, choice){
	/* Type check. */
	if(typeof choice != 'number'){
		throw new TypeError('The choice should be a number.');
	}
	if(choice < 100000 || choice > 9999999){
		throw new RangeError('The sciper number should be a 6 or 7 digits number.');
	} 
	if(typeof election.key != 'object'){
		throw new TypeError('The given election has an invalid key field.');
	}
	if(typeof election.id != 'string'){
		throw new TypeError('The given election has an invalid id field.');
	}
	/* End type check. */
  	
	var tmp = choice;
	var n0 = tmp & 0xFF;
	tmp = tmp >> 8;
	var n1 = tmp & 0xFF;
	tmp = tmp >> 8;
	var n2 = tmp & 0xFF;
	
	/* Least significant byte first. */
	var messageToEncrypt = new Uint8Array([n0, n1, n2]);

	var point = dedis.crypto.unmarshal(election.key);

	/* Encrypt ballot. */
	var encryptedMessage = dedis.crypto.elgamalEncrypt(point, messageToEncrypt);
	var alpha = dedis.crypto.marshal(encryptedMessage.Alpha);
	var beta = dedis.crypto.marshal(encryptedMessage.Beta);
	
	var ballot = {
		user : userSciper,
		alpha : alpha,
		beta : beta
	}

	var castMessage = {
		token : sessionToken,
		genesis : election.id, 
		ballot : ballot
	}
        
	socket.send('Cast', 'CastReply', castMessage).then((data) => {
		displayElections(recoveredElections);
	}).catch((err) => {
		displayError('An error occured during the submission of the ballot.');
		console.log(err);	
	});
}


/**
* Contacts the cothority to get the decrypted results of the election and then display them.
*
* @param Election election : the election from which we want to get the result.
*
* @throw TypeError if the stage field of the election is invalid.
* @throw typeError if the id field of the election is invalid.
* @throw RangeError if hte stage field of the election is not in the range [0, 2].
*/
function decryptAndDisplayElectionResult(election){
	/* Type check. */
	if(typeof election.stage != 'number'){
		throw new TypeError('The given election has an invalid stage field.');
	}
	if(election.stage < 0 || election.stage > 2){
		throw new RangeError('The stage of the election should be between 0 and 2.');
	}
	if(typeof election.id != 'string'){
		throw new TypeError('The given election has an invalid id field.');
	}
	/* End type check. */

	if(election.stage < 2){
		/* Election not decrypted yet. */		

		var decryptBallotsMessage = {
			token: sessionToken,
			genesis: election.id
		}
		socket.send('Decrypt', 'DecryptReply', decryptBallotsMessage).then((data) => {
			election.stage = 2;
			displayElectionResult(election, data.decrypted.ballots);
		}).catch((err) => {
			displayError('An error occured during the decryption of the election.');
			console.log(err);
		});

	}else{
		/* Election already decrypted. */

		var aggregateDecryptedMessage = {
			token : sessionToken,
			genesis : election.id,
			type : 2
		}
		socket.send('Aggregate', 'AggregateReply', aggregateDecryptedMessage).then((data) => {
			displayElectionResult(election, data.box.ballots);
		}).catch((err) => {
			displayError('An error occured during the aggregation of the ballots.');
			console.log(err);
		});
	}
}


/**
* Election comparator.
* An election is considered superior to another if its end date is after the other election's end date.
*
* @param Election election1 : the first election.
* @param Election election2 : the second election.
*
* @return boolean the result of the comparison between the two end dates.
*
* @throws TypeError if either of the two deadlines of the elections is not a string.
*/
function compareByDate(election1, election2){
	/* Type check. */
	if(typeof election1.end != 'string' || typeof election2.end != 'string'){
		throw new TypeError('The deadline of an election should be a string.');
	}
	/* End type check. */

	return createDateFromString(election1.end) < createDateFromString(election2.end);
}
