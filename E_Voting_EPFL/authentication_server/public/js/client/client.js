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

	showNavDisconnected();
        displayWelcomePage();
        
    }else{

	showNavConnected();

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


/**
* Log the client out.
* Drops the session cookie and redirects the client to the welcome page.
*/
function logout(){
	userSciper = null;
	sessionToken = null;
	recoveredElections = null;
	showNavDisconnected();
	clearDisplay();
        displayWelcomePage();
}


/**
* Mock the authentication with the given sciper.
*/
function mockAuthentication(sciper){
	userSciper = sciper;
	const loginRequest = {
            master : masterPin,
            user : userSciper,
            signature : new Uint8Array([])
        }
        
        sendLoginRequest(loginRequest);
}
