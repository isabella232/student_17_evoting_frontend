/**
* HTML Generator.
* Contains all the methods that allows to inject HTML in the document.
*/


/**
* Inject the banner with the EPFL logo and the name of the application.
*/
function showBanner(){
    	$("#banner").append("<img src='./../res/drawable/epfl_logo.png' id='banner_image'></img>");
    	$("#banner").append("<h2 id='banner_text'>EPFL E-Voting </h2>");
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
	$("#nav_election_list").append(clickableElement("p", "Your elections", function(){
		displayElections(recoveredElections);
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
	$("#div1").append(h3("Welcome to the EPFL E-Voting application !"));
	$("#div1").append(paragraph("This application allows you to vote for EPFL's elections"));
	$("#div1").append(paragraph("while ensuring you security and authenticity.")); 
	$("#div1").append(paragraph("To see the elections available, please login."));
	$("#div1").append("<form>");
	$("#div1").append(paragraph("Sciper :"));
	$("#div1").append("<input type='text' name='sciper' placeholder='XXXXXX'><br><br>");
	$("#div1").append("</form>");
	$("#div1").append(clickableElement("button", "Login", function(){
		//authenticate();
		// Mocking authentication waiting to turn into HTTPS.
		var sciper = $("input[type='text'][name='sciper']").val();
		if(verifyValidSciper(sciper)){
			mockAuthentication(sciper);
			showNavConnected();
		}else{
			$("#errDiv").append(paragraph("Incorrect SCIPER, please enter a valid one."));
		}
		}));
}


/**
* Display an election list item and associate an OnClickListener to it.
*
* @param Election election : the election to display as a list item.
*/
function displayElectionListItem(election){
    	$("#div1").append(clickableElement('h3', ''+election.name, function(){
		displayElectionFull(election);
	    }, "list_item"));
	if(createDateFromString(election.end) > new Date()){
		//Display end date when the election is not finished.
		$("#div1").append(h4("End date : "+election.end));
	}else if(election.stage == 0){
		//Clearly state that the election is finished (unshuffled case).
		var element = h4("Finished");
		element.style.color = "#FF0000";
		$("#div1").append(element);
	}else if(election.stage == 1){
		//Clearly state that the election is finished and shuffled.
		var element = h4("Finished - Shuffled");
		element.style.color = "#FF0000";
		$("#div1").append(element);
	}else{
		var element = h4("Finished - Decrypted");
		element.style.color = "#FF0000";
		$("#div1").append(element);
	}	
	$("#div1").append(separationLine());
}


/**
* Display all the informations of a given election and the radio buttons showing the possible votes.
*
* @param Election election : the election to display.
*/
function displayElectionFull(election){

	clearDisplay();	

	$("#div1").append(createDiv("details"));

	$("#details").append("<h2>"+election.name+"</h2>");

	if(election.creator != null){
		$("#details").append(paragraph("Created by  : "+election.creator));
	}

	if(election.end != null){
		$("#details").append(paragraph("Deadline    : "+election.end));
	}

	if(election.description != null){
		$("#details").append(paragraph("Description : "+election.description));
	}

	if(createDateFromString(election.end) >= new Date()){

		$("#details").append("<form>");

		//Election not finished yet
		for(var i = 0; i < election.users.length; i++){
		var user = election.users[i];
		$("#details").append("<input type='radio' name='choice' value='"+user+"'>"+user+"</input>");
		$("#details").append("<br>");
		}
		$("#details").append("</form>");
	
	    	$("#details").append(clickableElement('button', 'Submit', function(){
			var selectedSciper = Number($("input[type='radio'][name='choice']:checked").val());
			submitVote(election, selectedSciper);
			}));
	}else{
		$("#details").append(h3("The vote for this election is over."));
		if(election.stage < 2){
			$("#details").append(h3("Please wait for the administrator of the election to finalize it."));
			$("#details").append(h3("The result will then be displayed here"));
		}else{
			decryptAndDisplayElectionResult(election)
		}
	}
}


/**
* Displays the result of the election in a grid.
* 
* @param Election election : the election of which we want to display the result.
* @param Array[Ballot] ballots : the list of the decrypted ballots of the election.
*/
function displayElectionResult(election, ballots){

	$("#div2").append(paragraph("Election result : "));
	
	var pairArray = [];
	for(var i = 0; i < election.users.length; i++){
		pairArray[i] = {key: election.users[i], value: 0};
	}

	for(var j = 0; j < ballots.length; j++){
		var ballot = ballots[j];
		var array = ballot.text;
		var plain = array[0]+0x100*array[1]+0x10000*array[2];

		var index;
		for(var i = 0; i < pairArray.length; i++){
			if(pairArray[i].key == plain){
				index = i;
			}
		}
		var tmp = pairArray[index].value;
		pairArray[index] = {key: plain, value: tmp + 1};
	}

	pairArray.sort(comparePairs);

	var displayedArray = [];
	for(var i = 0 ; i < pairArray.length; i++){
		displayedArray[i] = {recid: (i + 1), sciper: pairArray[i].key, votes: pairArray[i].value};
	}

	generateResultGrid(displayedArray);
	
}


/**
* compares a key / value pair by comparing their values.
*/
function comparePairs(pair1, pair2){
	return pair1.value < pair2.value;
}


/**
* Display all elections available in a list.
*
* @param Array{Election} elections : the election list to display.
*/
function displayElections(elections){
    	clearDisplay();

    	if(elections.length > 0){
		$("#div1").append(h2("Available elections :"));
		$("#div1").append(separationLine());
		for(var i = 0; i < elections.length; i++){
			$("#div1").append("    ");
			displayElectionListItem(elections[i]);
		}
		$("#div1").append(paragraph("Note that you can vote several times for the same election,"));
		$("#div1").append(paragraph("However, only the last vote will be taken into account."));
	}else{
		$("#div1").append(paragraph("No elections to show"));
	}
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
	return date.length == 10 && date.match(regex);
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
	$("#logout").empty();
	$("#user_infos").empty();
}
