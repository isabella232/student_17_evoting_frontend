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
* @param loginRequest : a Login message as described in the proto file.
*/
function sendLoginRequest(loginRequest){
    
    socket.send('Login', 'LoginReply', loginRequest).then((data) => {
	if(data.admin){
		clearDisplay();
		showNavConnected();
		sessionToken = data.token;
		recoveredElections = data.elections;
		recoveredElections = recoveredElections.sort(compareByDate);
		displayElections(recoveredElections);
	}else{
		$("#errDiv").append(paragraph("An admin account is required to access this site."));
	}
    }).catch((err) => {
        console.log(err);
    });
    
}


/**
* Send an Open message to the cothority to create an election based on the informations entered by the user.
*
* @param String name : the name of the election.
* @param String deadline : the deadline of the election, have to be in the format DD/MM/YYYY.
* @param String description : the description of the election.
* @param Array[String] participants : the list of the participants to the election.
*/
function createElection(name, deadline, description, participants){

	var newElection = {
		name : name,
		creator : userSciper,
		users : participants,
		stage : 0,
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
		//Return on election list
		sendLoginRequest(loginRequest);
	}).catch((err) => {
		console.log(err);	
	});	
}


/**
* Send a Shuffle message to the conodes, initiating the shuffle of the given election.
*
* @param Election election : the election to finalize.
*/
function finalize(election){

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
		console.log(err);
	});
}


/**
* Send a Decrypt message to the conodes, initiating the decryption of the ballots.
*
* @param Election election : the election of which we want to decrypt the ballots.
*/
function decryptBallots(election){
	var decryptBallotsMessage = {
		token: sessionToken,
		genesis: election.id
	}
	socket.send('Decrypt', 'DecryptReply', decryptBallotsMessage).then((data) => {
		$("#div2").append(paragraph("Decrypted ballots : "));
		displayDecryptedBox(data.decrypted.ballots);
	}).catch((err) => {
		console.log(err);
	});
}


/**
* Contacts the cothority to get the decrypted results of the election and then display them.
*
* @param Election election : the election from which we want to get the result.
*/
function decryptAndDisplayElectionResult(election){

	if(election.stage < 2){

		var decryptBallotsMessage = {
			token: sessionToken,
			genesis: election.id
		}
		socket.send('Decrypt', 'DecryptReply', decryptBallotsMessage).then((data) => {
			election.stage = 2;
			displayElectionResult(election, data.decrypted.ballots);
		}).catch((err) => {
			console.log(err);
		});

	}else{
		var aggregateDecryptedMessage = {
			token : sessionToken,
			genesis : election.id,
			type : 2
		}
		socket.send('Aggregate', 'AggregateReply', aggregateDecryptedMessage).then((data) => {
			displayElectionResult(election, data.box.ballots);
		}).catch((err) => {
			console.log(err);
		});
	}
}


/**
* Send an aggregate message to the conodes to aggregate the encrypted ballots.
*
* @param Election election : the election of which we want to aggregate the ballots.
*/
function aggregateBallot(election){
	var aggregateBallotMessage = {
		token : sessionToken,
		genesis : election.id,
		type : 0
	}
	socket.send('Aggregate', 'AggregateReply', aggregateBallotMessage).then((data) => {
		$("#div2").append(paragraph("Original ballots : "));
		displayBallotBox(data.box.ballots);
	}).catch((err) => {
		console.log(err);
	});
}


/**
* Send an aggregate message to the conodes to aggregate the encrypted and shuffled ballots.
*
* @param Election election : the election of which we want to aggregate the ballots.
*/
function aggregateShuffle(election){
	var aggregateShuffleMessage = {
		token : sessionToken,
		genesis : election.id,
		type : 1
	}
	socket.send('Aggregate', 'AggregateReply', aggregateShuffleMessage).then((data) => {
		$("#div2").append(paragraph("Shuffled ballots : "));
		displayShuffledBox(data.box.ballots);
	}).catch((err) => {
		console.log(err);
	});
}


/**
* Election comparator.
* An election is considered superior to another if its end date is after the other election's end date.
*
* @param election1 : the first election.
* @param election2 : the second election.
* @return the result of the comparison between the two end dates.
*/
function compareByDate(election1, election2){
	return createDateFromString(election1.end) < createDateFromString(election2.end);
}
