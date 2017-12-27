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
        clearDisplay();
	sessionToken = data.token;
	recoveredElections = data.elections;
	recoveredElections = recoveredElections.sort(compareByDate);
	displayElections(recoveredElections);
    }).catch((err) => {
        console.log(err);
    });
    
}


/**
* Send a Cast message to the election. An encrypted ballot is sended with the given choice in it.
*
* @param election : the elections we want to vote in.
* @param choice : the choice of the user in the election.
*/
function submitVote(election, choice){
  	
	var tmp = choice;
	var n0 = tmp & 0xFF;
	tmp = tmp >> 8;
	var n1 = tmp & 0xFF;
	tmp = tmp >> 8;
	var n2 = tmp & 0xFF;
	
	//Least significant byte first.
	var messageToEncrypt = new Uint8Array([n0, n1, n2]);

	var point = dedis.crypto.unmarshal(election.key);

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
* Election comparator.
* An election is considered superior to another if its end date is after the other election's end date.
*
* @param election1 : the first election.
* @param election2 : the second election.
*
* @return the result of the comparison between the two end dates.
*/
function compareByDate(election1, election2){
	return createDateFromString(election1.end) < createDateFromString(election2.end);
}
