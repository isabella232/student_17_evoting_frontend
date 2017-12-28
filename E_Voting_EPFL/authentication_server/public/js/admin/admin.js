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
        
        sendLoginRequest(id, new Uint8Array([]));
		
    }
});


/**
* Redirects the user to the authentication server.
*/
function authenticate(){
    window.location.replace(authenticationServerAuth);
}


/**
* Log the user outs.
* The function drops the session cookie, forget the elections gathered for the user and redirects him to the main page.
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
* Mock the authentication for the given SCIPER.
*
* @param sciper : the sciper to mock the authentication.
*/
function mockAuthentication(sciper){
	userSciper = sciper;
        
        sendLoginRequest(userSciper, new Uint8Array([]));
}
