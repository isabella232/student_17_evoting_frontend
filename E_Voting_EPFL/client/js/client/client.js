/**
* Client.
* This is the main of the project, the code executed when the user connects.
* The web page is a single page application where the updates of the content is made through jQuery.
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
* Log the client out.
* Drops the session cookie and display the welcome page.
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
*
* @param String sciper : the sciper of which we want to mock the authentication.
*
* @throw TypeError if the sciper is not a string.
*/
function mockAuthentication(sciper){
	/* Type check. */
	if(typeof sciper != 'string'){
		throw new TypeError('The sciper should be a string');
	}
	/* End type check. */

	userSciper = sciper;
        
        sendLoginRequest(userSciper, new Uint8Array([]));
}
