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
const master_pin = "/txcurJbTQIkhFwYLK56nGQG/pfOzJLB1j2SKS1DE/c=";

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
        clearDisplay();
	session_token = data.token;
	//recovered_elections = data.elections;
	console.log(data.elections.length);
	//Tests elections
	recovered_elections = elections;
	display_elections(recovered_elections);
    }).catch((err) => {
        console.log(err);
    });
    
}

/**
* Send an Open message to the cothority to create an election based on the informations entered by the user.
* @param number_participants : the number of participants in the election.
*/
function create_election(name, deadline, description, participants){

	//For now we don't add deadline and description
	var new_election = {
		name : "name",
		creator : 247222,
		users : new Uint32Array([])
	}

	var open_message = {
		token : session_token,	
		master : master_pin,
		election : new_election
	}

	socket.send('Open', 'OpenReply', open_message).then((data) => {
	
	}).catch((err) => {
		$("#ErrDiv").append(paragraph("An admin account is required to create an election"));
		console.log(err);	
	});

	clearDisplay();
	$("#div1").append(paragraph("Ready to go !"));
	$("#div1").append(paragraph("New election name : "+name));
	$("#div1").append(paragraph("Deadline : "+deadline));
	$("#div1").append(paragraph("Creator : "+user_sciper));
	$("#div1").append(paragraph("Session token : "+session_token));
	$("#div1").append(paragraph("Description : "+description));
	$("#div1").append("Participants :<br>");
	var participant_sciper;
	for(var i = 0; i < participants.length; i++){
		$("#div1").append(participants[i]+"<br>");
	}
	$("#div1").append(clickableElement("button", "Back to elections list", function(){
		const loginRequest = {
		    master : master_pin,
		    user : user_sciper,
		    signature : new Uint8Array([])
		}
		
		sendLoginRequest(loginRequest);
	}));	
}
