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
* Send a Cast message to the election. An encrypted ballot is sended with the given choice in it.
* @param election : the elections we want to vote in.
* @param choice : the choice of the user in the election.
*/
function submit_vote(election, choice){
    
	$('#div1').append(paragraph("Vote submitted ! You voted for : "+choice));
	
	var n2 = choice % 100;
	var n1 = (choice / 100) % 100;
	var n0 = (choice / 10000) % 100;
	
	var message_to_encrypt = new Uint8Array([n0, n1, n2]);

	var encrypted_message = dedis.crypto.elgamalEncrypt(election.key, message_to_encrypt);

	var ballot = {
	user : user_sciper,
	alpha : encrypted_message.Alpha,
	beta : encrypted_message.Beta
	};

	var cast_message = {
	    token : session_token,
	    genesis : election.id,
	    ballot : ballot
	};
        
	clearDisplay();
	socket.send('Cast', 'CastReply', cast_message).then((data) => {
	    
	}).catch((err) => {
		$('#errDiv').append("An error happened, the conodes didn't register your message");
		console.log(err);	
	});
	$('#div1').append(paragraph("Your ballot encryption : ["+encrypted_message.Alpha+", "+encrypted_message.Beta+"]."));
}
