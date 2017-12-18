/**
* Communication.
* Contains all the methods relative to the communication between the frontend and the cothority.
*/

const nodes_ip = 'localhost';

// Address of the node of the cothority.
const node = {
    Address: 'tcp://'+nodes_ip+':7002'
}

// PIN of the master.
const master_pin = "CZZZRbqHM2n2dvr+T7BYrU0JcB2KEcTU22lFemVd19Y=";

var socket;
var user_sciper;
var recovered_elections;
var session_token;

/**
* Send a Login message to the cothority, asking for available elections.
* @param loginRequest : a Login message as described in the proto file.
*/
function sendLoginRequest(loginRequest){
    
    socket.send('Login', 'LoginReply', loginRequest).then((data) => {
	if(data.admin){
		clearDisplay();
		session_token = data.token;
		recovered_elections = data.elections;
		//Tests elections
		//recovered_elections = elections;
		recovered_elections = recovered_elections.sort(compare_by_date);
		display_elections(recovered_elections);
	}else{
		$("#errDiv").append(paragraph("An admin account is required to access this site."));
	}
    }).catch((err) => {
        console.log(err);
    });
    
}

/**
* Send an Open message to the cothority to create an election based on the informations entered by the user.
* @param number_participants : the number of participants in the election.
*/
function create_election(name, deadline, description, participants){

	// Add some data to the election to indicate if it has already been shuffled.
	var shuffled = new Uint8Array([0]);

	var new_election = {
		name : name,
		creator : user_sciper,
		users : participants,
		data : shuffled,
		description : description,
		end : deadline
	}
	
	var open_message = {
		token : session_token,
		master : master_pin,
		election : new_election
	}

	socket.send('Open', 'OpenReply', open_message).then((data) => {
		const loginRequest = {
		    master : master_pin,
		    user : user_sciper,
		    signature : new Uint8Array([])
		}
		//Return on election list
		sendLoginRequest(loginRequest);
	}).catch((err) => {
		console.log(err);	
	});	
}

/**
* Send a Finalize message to the conodes, initiating the shuffle of the given election.
* @param Election election : the election to finalize.
*/
function finalize(election){
	console.log(session_token);
	console.log(election.id);
	var finalize_message = {
		token : session_token,
		genesis : election.id
	}

	$("#div2").append("Please wait while the election is being finalized");

	socket.send("Finalize", "FinalizeReply", finalize_message).then((data) => {
		$("#div2").empty();
		election.data = new Uint8Array([1]);
		display_election_full(election);
	}).catch((err) => {
		console.log(err);	
	});
}

function aggregate_ballot(election){
	var aggregate_ballots_message = {
		token : session_token,
		genesis : election.id,
		type : BALLOTS
	}
	socket.send('Aggregate', 'AggregateReply', aggregate_ballot_message).then((data) => {
		$("#div2").append(paragraph("Aggregated ballots : "));
		$("#div2").append(display_ballot_box(data.box));
	}).catch((err) => {
		console.log(err);
	});
}

function aggregate_shuffle(election){
	var aggregate_shuffle_message = {
		token : session_token,
		genesis : election.id,
		type : SHUFFLE
	}
	socket.send('Aggregate', 'AggregateReply', aggregate_shuffle_message).then((data) => {
		$("#div2").append(paragraph("Aggregated shuffled ballots : "));
		$("#div2").append(display_ballot_box(data.box));
	}).catch((err) => {
		console.log(err);
	});
}

function aggregate_decrypted(election){
	var aggregate_decrypted_message = {
		token : session_token,
		genesis : election.id,
		type : DECRYPTION
	}
	socket.send('Aggregate', 'AggregateReply', aggregate_decrypted_message).then((data) => {
		$("#div2").append(paragraph("Aggregated decrypted ballots : "));
		$("#div2").append(display_ballot_box(data.box));
	}).catch((err) => {
		console.log(err);
	});
}

/**
* Election comparator.
* An election is considered superior to another if its end date is after the other election's end date.
* @param election1 : the first election.
* @param election2 : the second election.
* @return the result of the comparison between the two end dates.
*/
function compare_by_date(election1, election2){
	return create_date_from_string(election1.end) < create_date_from_string(election2.end);
}
