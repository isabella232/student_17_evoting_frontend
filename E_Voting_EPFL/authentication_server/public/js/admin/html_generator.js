/**
* HTML Generator.
* Contains all the methods that allows to inject HTML in the document.
*/


//Some colors constants for the buttons.
const red = "#ff0707";
const green = "#30f209";
const grey = "#b2a0a0";


/**
* Inject the banner with the EPFL logo and the name of the application.
*/
function showBanner(){
    	$("#banner").append("<img src='./../res/drawable/epfl_logo.png' id='banner_image'></img>");
    	$("#banner").append("<h2 id='banner_text'>EPFL E-Voting </h2>");
}


/**
* Inject the code for an unlogged admin.
*/
function showUnlogged(){
	showNavDisconnected();
	clearDisplay();
        displayWelcomePage();
}


/**
* Inject the navigation bar for a disconnected user.
*/
function showNavDisconnected(){
	clearNavigation();
}


/**
* Inject the navigation bar for a connected user.
*/
function showNavConnected(){
	clearNavigation();
	$("#nav_election_list").append(clickableElement("p", "Admin election", function(){
		displayElections(recoveredElections);
		}));
	$("#nav_create_election").append(clickableElement("p", "Create election", function(){
		displayElectionCreation(recoveredElections);
		}));
	$("#logout").append(clickableElement("p", "Logout", function(){
		logout();
		}));
	$("#user_infos").append(paragraph("Hi "+userSciper));
}


/**
* Inject a welcome text when a client arrives unlogged on the web page.
*/
function displayWelcomePage(){
	$("#div1").append(paragraph(""));
	$("#div1").append(h3("Welcome to the admin part of the EPFL E-Voting application !"));
	$("#div1").append(paragraph("This application allows you to create elections and manage the one you already created"));
	$("#div1").append(paragraph("while ensuring you security and authenticity.")); 
	$("#div1").append(paragraph("To see your elections and create some new ones, please login."));
	$("#div1").append("<form>");
	$("#div1").append(paragraph("Sciper :"));
	$("#div1").append("<input type='text' name='sciper' placeholder='XXXXXX'><br><br>");
	$("#div1").append("</form>");
	$("#div1").append(clickableElement("button", "Login", function(){
		//authenticate();
		// Mocking authentication waiting to turn in HTTPS.
		var sciper = $("input[type='text'][name='sciper']").val();
		if(verifyValidSciper(sciper)){
			mockAuthentication(sciper);
		}else{
			$("#errDiv").append(paragraph("Incorrect SCIPER, please enter a valid one."));
		}
		}));
	$("#div1").append(h4("Be aware that an admin account is required to access this page"));
}


/**
* Verify if a given string representing a SCIPER number is in the good format (ABCDEF) of (ABCDEFG) where A,B,C,D,E,F,G are in [0 - 9].
*
* @param String sciper : the string to verify.
*
* @return true if the given sciper matches the requirements, false otherwise.
*/
function verifyValidSciper(sciper){
	var regex6 = /(\d\d\d\d\d\d)/;
	var regex7 = /(\d\d\d\d\d\d\d)/;
	return (sciper.length == 6 && sciper.match(regex6)) || (sciper.length == 7 && sciper.match(regex7));
}


/**
* Verify if a given string representing a date is in the good format (DD/MM/YYYY).
*
* @param String date : the string to verify.
*
* @return true if the given string matches the requirements, false otherwise
*/
function verifyValidDate(date){
	var regex = /(\d\d\/\d\d\/\d\d\d\d)/;
	if(date.length == 10 && date.match(regex)){
		var splitted = date.split('/');
		var day = splitted[0];
		var month = splitted[1];
		var year = splitted[2];
		var genDate = new Date(year, month - 1, day);

		var today = new Date();
	

		//Very basic check for now, can be upgraded.
		return 1 <= month && month <= 12 && 1 <= day && day <= 31 && genDate > today;
	}else{
		return false;
	}
}


/**
* Create a Date from the given string (which should be in the DD/MM/YYYY format).
*
* @param String string : the string to convert into a date.
*
* @return Date : a date from the given representation, null if the representation wasn't in a good format.
*/
function createDateFromString(string){
	if(verifyValidDate(string)){
		var splitted = string.split('/');
		return new Date(Number(splitted[2]), 
			Number(splitted[1]) - 1, Number(splitted[0]), 0, 0, 0, 0);
	}else{
		return null;
	}
}


/**
* Clear the display, the banner and the navigation bar are will not be affected by this operation.
*/
function clearDisplay(){
	$("#div1").empty();
	$("#div2").empty();
	$("#errDiv").empty();
}


/**
* Clear the navigation bar, the banner and the rest of the display will not be affected by this operation.
*/
function clearNavigation(){
	$("#nav_election_list").empty();
	$("#nav_create_election").empty();
	$("#logout").empty();
	$("#user_infos").empty();
}
