/**
* Client.
* Defines the behavior of the client.
* The web page is a single page application where the update of the content is made through jQuery.
*/

const auth_server_ip = 'localhost';

// Client authentication server location
const authentication_server_auth = "http://"+auth_server_ip+":3000/auth";

//******************************
// Testing election display
var election1 = {
    name : "Elect the next EPFL director",
    creator : 247222,
    users : [247222, 123456, 789456, 147252],
    description : "The EPFL needs a new director.",
    end : "December 12, 2017"
}

var election2 = {
    name : "Elect the next DeDis president",
    creator : 247222,
    users : [247222, 123456, 789456, 147252, 123764, 369741],
    description : "Who's gonna be the next ?",
    end : "February 22, 2018"
}

var election3 = {
    name : "Other election",
    creator : 247222,
    users : [247222, 123456, 789456],
    description : "Some description",
    end : "Tomorrow"
}

var election4 = {
    name : "Another election",
    creator : 247222,
    users : [247222, 123456, 789456, 147252],
    description : "Another description",
    end : "Sometime"
}

var elections = [election1, election2, election3, election4];
//**************************************

$('document').ready(function(){
   
    socket = new dedis.net.Socket(node, messages);
    
    /* 
    * Message returned by the authentication server.
    * If such a message does not exist, the user didn't authentify yet.
    */
    var message = sessionStorage.getItem("message");
    
    show_banner();
    clearDisplay();
    
    if(!message){

	show_nav_disconnected();
        display_welcome_page();
        
    }else{

	show_nav_connected();

        var message = message.split(';');

        if(message.length != 2){
            throw new Error("An error as occured, the infomations haven't been well recovered");
        }
        
        user_sciper = message[0];
        
        var id = Number(user_sciper);
        var signature = message[1];
        $('#div1').append(paragraph("Connecting, please wait ..."));
       
        const loginRequest = {
            master : master_pin,
            user : id,
            signature : new Uint8Array([])
        }
        
        sendLoginRequest(loginRequest);
		
    }
});

/**
* Redirects the user to the authentication server.
*/
function authenticate(){
    window.location.replace(authentication_server_auth);
}

function mockAuthentication(){
	user_sciper = 247222;
	const loginRequest = {
            master : master_pin,
            user : user_sciper,
            signature : new Uint8Array([])
        }
        
	mockConodes();
        sendLoginRequest(loginRequest);
}

function mockConodes(){
	clearDisplay();
	session_token = 0;
	//Tests elections
	recovered_elections = elections;
	display_elections(recovered_elections);
}
