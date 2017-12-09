/**
* HTML Generator.
* Contains all the methods that allows to generate some HTML that will be injected in the page
* with jQuery.
*/

/**
* Generates the banner with the EPFL logo.
* @return String : a String in HTML format of the banner.
*/
function banner(){
    return "<h2 id='banner_text'>EPFL E-Voting </h2>"+
    "<img src='./../res/drawable/epfl_logo.png' id='banner_image'></img>";
}

/**
* Generates a welcome text when a client arrives unlogged on the web page.
* @return String : a String in HTML format welcoming the user and inviting him to log in.
*/
function welcome_text(){
    return "<p>Welcome to the EPFL E-Voting application !</p>"+
    "<p>From here you are able to access all EPFL elections where you are eligible in.</p>"+
    "<p>First, please authenticate.</p>";
}

/**
* Generates a message containing the user informations once he has successfully logged in.
* @param String id : the id of the user.
* @param String name : the full name of the user.
* @param String section : the String representation of the section of the user.
* @param String groups : the String representation of the group in which the user belong.
* @return String : a String in HTML format containing all the detailed informations.
*/ 
function connected(id, name, section, groups){
    
    var result = "<h3>Hi "+name+" ("+id+")</h3>";
    
    result += "<ul>Sections : ";
    var splitSection = section.split(',');
    for(var i = 0; i < splitSection.length; i++){
        result+= "<li>"+splitSection[i]+"</li>";
    }
    result += "</ul>";
    
    result += "<ul>Groups : ";
    var splitGroup = groups.split(',');
    for(var i = 0; i < splitGroup.length; i++){
        result+= "<li>"+splitGroup[i]+"</li>";
    }
    result += "</ul>"
    
    return result;
}