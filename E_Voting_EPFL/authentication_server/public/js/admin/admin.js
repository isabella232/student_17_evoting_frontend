/**
* Client.
* Defines the behavior of the client.
* The web page is a single page application where the update of the content is made through jQuery.
*/

$('document').ready(function(){
   
    socket = new dedis.net.Socket(node, messages);
    
    /* 
    * Message returned by the authentication server.
    * If such a message does not exist, the user didn't authentify yet.
    */
    var message = sessionStorage.getItem("message");
    
    showBanner();
    clearDisplay();
    
    if(!message){

	showUnlogged();
        
    }else{

        var message = message.split(';');

        if(message.length != 2){
            throw new Error("An error as occured, the infomations haven't been well recovered");
        }
        
        userSciper = message[0];
        
        var id = Number(userSciper);
        var signature = message[1];
        $('#div1').append(paragraph("Connecting, please wait ..."));
       
        const loginRequest = {
            master : masterPin,
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
    window.location.replace(authenticationServerAuth);
}

function logout(){
	userSciper = null;
	sessionToken = null;
	recoveredElections = null;
	showNavDisconnected();
	clearDisplay();
        displayWelcomePage();
}

function mockAuthentication(sciper){
	userSciper = sciper;
	const loginRequest = {
            master : masterPin,
            user : userSciper,
            signature : new Uint8Array([])
        }
        
        sendLoginRequest(loginRequest);
}
