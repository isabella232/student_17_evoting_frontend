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
* @param Number sciper : the sciper of the user who wants to log in.
* @param Byte[] signature : the signature of the authentication server.
*/
function sendLoginRequest(sciper, signature){

	const loginRequest = {
		master : masterPin,
		user : sciper,
		signature : signature
	}

	socket.send('Login', 'LoginReply', loginRequest).then((data) => {
		if(data.admin){
			/* The user is a confirmed admin. */
			clearDisplay();
			showNavConnected();
			sessionToken = data.token;
			recoveredElections = data.elections;
			recoveredElections = recoveredElections.sort(compareByDate);
			displayElections(recoveredElections);
		}else{
			/* The user is not an admin. */
			$("#errDiv").append(paragraph("An admin account is required to access this site."));
		}
	}).catch((err) => {
		displayError('An error occured during the login, please try again later.');
		console.log(err);
	});
    
}


/**
* Send an Open message to the cothority to create an election based on the informations entered by the user.
*
* @param String name : the name of the election.
* @param String deadline : the deadline of the election, have to be in the format DD/MM/YYYY.
* @param String description : the description of the election.
* @param Number[] participants : the list of the participants of the election.
* @param Number[] voters : the list of the voter of the election.
*/
function createElection(name, deadline, description, participants, voters){

	var newElection = {
		name : name,
		creator : userSciper,
		users : voters,
		stage : 0,
		data : votersToUint8Array(participants),
		description : description,
		end : deadline
	}
	
	var openMessage = {
		token : sessionToken,
		master : masterPin,
		election : newElection
	}

	socket.send('Open', 'OpenReply', openMessage).then((data) => {
		const loginRequest = {
		    master : masterPin,
		    user : userSciper,
		    signature : new Uint8Array([])
		}
		/* Return on election list. */
		sendLoginRequest(userSciper, new Uint8Array([]));
	}).catch((err) => {
		displayError('An error occured during the creation of the election.');
		console.log(err);	
	});	
}


/**
* Recover scipers from byte array.
*
* @param Bytes[] voters, the array to transform.
*
* @return Number[] the transformed array.
*
* @throw TypeError if voters is invalid.
*/
function votersToUint8Array(voters){
	/* Type check. */
	if(typeof voters != 'object' || typeof voters.length != 'number'){
		throw new TypeError('The voters given as argument is not a valid array.');
	}
	/* End type check. */

	var transVoters = [];
	for(var i = 0; i < voters.length; i++){
		var voter = voters[i];
		transVoters[3*i] = voter & 0xFF;
		voter = voter >> 8;
		transVoters[3*i + 1] = voter & 0xFF;
		voter = voter >> 8;
		transVoters[3*i + 2] = voter & 0xFF;
	}
	return transVoters;
}


/**
* Send a Shuffle message to the conodes, initiating the shuffle of the given election.
*
* @param Election election : the election to finalize.
*
* @throw TypeError if the id field of election is not valid.
*/
function finalize(election){
	/* Type check. */
	if(typeof election.id != 'string'){
		throw new TypeError('The field id of the given election should be a string.');
	}
	/* End type check. */

	var finalizeMessage = {
		token : sessionToken,
		genesis : election.id
	}

	$("#div2").append("Please wait while the election is being finalized");

	socket.send("Shuffle", "ShuffleReply", finalizeMessage).then((data) => {
		$("#div2").empty();
		election.stage = 1;
		displayElectionFull(election);
	}).catch((err) => {
		displayError('An error occured during the shuffle of the election. The election may have already been shuffled once.');
		console.log(err);
	});
}


/**
* Send a Decrypt message to the conodes, initiating the decryption of the ballots.
*
* @param Election election : the election of which we want to decrypt the ballots.
*
* @throw TypeError if the id field of election is not valid.
*/
function decryptBallots(election){
	/* Type check. */
	if(typeof election.id != 'string'){
		throw new TypeError('The field id of the given election should be a string.');
	}
	/* End type check. */

	var decryptBallotsMessage = {
		token: sessionToken,
		genesis: election.id
	}
	socket.send('Decrypt', 'DecryptReply', decryptBallotsMessage).then((data) => {
		$("#div2").append(paragraph("Decrypted ballots : "));
		displayDecryptedBox(data.decrypted.ballots);
	}).catch((err) => {
		displayError('An error occured during the decryption of the ballots, the election may have already been decrypted once.');
		console.log(err);
	});
}


/**
* Contacts the cothority to get the decrypted results of the election and then display them.
*
* @param Election election : the election from which we want to get the result.
*
* @throw TypeError if the id field of election is not valid.
* @throw TypeError if the stage filed of election is not valid.
* @throw RangeError if the stage field of election is not in the range [0, 2]. 
*/
function decryptAndDisplayElectionResult(election){
	/* Type check. */
	if(typeof election.id != 'string'){
		throw new TypeError('The field id of the given election should be a string.');
	}
	if(typeof election.stage != 'number'){
		throw new TypeError('The field stage of the given election should be a number.');
	}
	if(election.stage < 0 || election.stage > 2){
		throw new RangeError('The stage of the election should be in the range [0, 2].');
	}
	/* End type check. */

	if(election.stage < 2){
		/* The election is not decrypted yet. */
		var decryptBallotsMessage = {
			token: sessionToken,
			genesis: election.id
		}
		socket.send('Decrypt', 'DecryptReply', decryptBallotsMessage).then((data) => {
			election.stage = 2;
			displayElectionResult(election, data.decrypted.ballots);
		}).catch((err) => {
			displayError('An error occured during the decryption of the election. It may have already been decrypted once.');
			console.log(err);
		});

	}else{
		/* The election have already been decrypted once. */
		var aggregateDecryptedMessage = {
			token : sessionToken,
			genesis : election.id,
			type : 2
		}
		socket.send('Aggregate', 'AggregateReply', aggregateDecryptedMessage).then((data) => {
			displayElectionResult(election, data.box.ballots);
		}).catch((err) => {
			displayError('An error occured during the aggregation of the decrypted ballots.');
			console.log(err);
		});
	}
}


/**
* Send an aggregate message to the conodes to aggregate the encrypted ballots.
*
* @param Election election : the election of which we want to aggregate the ballots.
*
* @throw TypeError if the id field of election is not valid.
*/
function aggregateBallot(election){
	/* Type check. */
	if(typeof election.id != 'string'){
		throw new TypeError('The field id of the given election should be a string.');
	}
	/* End type check. */

	var aggregateBallotMessage = {
		token : sessionToken,
		genesis : election.id,
		type : 0
	}
	socket.send('Aggregate', 'AggregateReply', aggregateBallotMessage).then((data) => {
		$("#div2").append(paragraph("Original ballots : "));
		displayBallotBox(data.box.ballots);
	}).catch((err) => {
		displayError('An error occured during the aggregation of the ballots.');
		console.log(err);
	});
}


/**
* Send an aggregate message to the conodes to aggregate the encrypted and shuffled ballots.
*
* @param Election election : the election of which we want to aggregate the ballots.
*
* @throw TypeError if the id field of election is not valid.
*/
function aggregateShuffle(election){
	/* Type check. */
	if(typeof election.id != 'string'){
		throw new TypeError('The field id of the given election should be a string.');
	}
	/* End type check. */

	var aggregateShuffleMessage = {
		token : sessionToken,
		genesis : election.id,
		type : 1
	}
	socket.send('Aggregate', 'AggregateReply', aggregateShuffleMessage).then((data) => {
		$("#div2").append(paragraph("Shuffled ballots : "));
		displayShuffledBox(data.box.ballots);
	}).catch((err) => {
		displayError('An error occured during the aggregation of the ballots.');
		console.log(err);
	});
}


/**
* Election comparator.
* An election is considered superior to another if its end date is after the other election's end date.
*
* @param election1 : the first election.
* @param election2 : the second election.
*
* @return the result of the comparison between the two end dates.
*
* @throw TypeError if one of the election's deadline is invalid.
*/
function compareByDate(election1, election2){
	/* Type check. */
	if(typeof election1.end != 'string' || typeof election2.end != 'string'){
		throw new TypeError('One of the election\'s end field isn\'t a string.');
	}
	/* End type check. */

	return createDateFromString(election1.end) < createDateFromString(election2.end);
}
