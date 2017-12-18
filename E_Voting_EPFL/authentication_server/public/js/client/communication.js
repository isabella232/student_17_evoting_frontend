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
        clearDisplay();
	session_token = data.token;
	recovered_elections = data.elections;
	//Tests elections
	//recovered_elections = elections;
	recovered_elections = recovered_elections.sort(compare_by_date);
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
  	
	var n2 = choice % 100;
	var n1 = (choice / 100) % 100;
	var n0 = (choice / 10000) % 100;
	
	var message_to_encrypt = new Uint8Array([n0, n1, n2]);

	var point = dedis.crypto.unmarshal(election.key);

	var encrypted_message = dedis.crypto.elgamalEncrypt(point, message_to_encrypt);

	var alpha = dedis.crypto.marshal(encrypted_message.Alpha);
	var beta = dedis.crypto.marshal(encrypted_message.Beta);
	
	var ballot = {
	user : user_sciper,
	alpha : alpha,
	beta : beta
	}

	var cast_message = {
	    token : session_token,
	    genesis : election.id,
	    ballot : ballot
	}
        
	socket.send('Cast', 'CastReply', cast_message).then((data) => {
		clearDisplay();
		$("#div1").append(paragraph("Vote successfully submitted !"));
		var alpha_hex = dedis.misc.uint8ArrayToHex(alpha);
		var beta_hex = dedis.misc.uint8ArrayToHex(beta);
		$('#div1').append(paragraph("Your ballot encryption : ["+alpha_hex+", "+beta_hex+"]."));
		$("#div1").append(paragraph("Ballot stored in block : "+data.index));
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
