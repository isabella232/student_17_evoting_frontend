/**
* Client.
* Defines the behavior of the client.
* The web page is a single page application where the update of the content is made through jQuery.
*/

const authentication_server_auth = "http://localhost:3000/auth";

$('document').ready(function(){
   
    var message = sessionStorage.getItem("message");
    
    $('#banner').append(banner());
    
    if(!message){
        
        $('#div1').append(welcome_text());
        $("#div2").append(login_button());
        
    }else{
        var message = message.split(';');
        if(!(message.length == 6)){
            throw new Error("An error as occured, the infomations haven't been well recovered");
        }
        
        var id = message[0];
        var fullName = message[1];
        var section = message[2];
        var groups = message[3];
        var fullDate = message[4];
        var signature = message[5];
        $('#div1').append(connected(id, fullName, section, groups));
        
        const loginMessage = {
            id: id,
            name: name,
            groups: groups,
            date: fullDate
        };
        
        const permissionRequest = {
            message: loginMessage,
            signature: signature
        };
        
        sendPermissionRequest(permissionRequest);
        
    }
});

function authenticate(){
    window.location.replace(authentication_server_auth);
}

function login_button(){
    return "<button onclick='authenticate()'>Log in</button>";
}

const node = {
    Address: 'tcp://127.0.0.1:7002'
}

function sendPermissionRequest(permissionRequest){
    
    const socket = new dedis.net.Socket(node, skeleton);
    
}