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

	var usersString = "";
	for(var i=0; i < election.users.length; i++){
		usersString += election.users[i];
		if(i != election.users.length - 1){
			usersString += ", ";
		}
	}
	$("#details").append(paragraph("Participants : "+usersString));

	if(createDateFromString(election.end) >= new Date()){
		//End date not reached yet
		displayVotingButtonSet();
	}else{
		//End date reached
		if(election.stage == 0){
			displayFinalizeButtonSet(election);		
		}else{
			displayAggregateButtonSet(election);
		}
	}
}


/**
* Display a set of 3 buttons representing the state of the vote in the case where the deadline is not reached yet.
*/
function displayVotingButtonSet(){
	$("#details").append(unclickableButton("Voting", green));
	$("#details").append(unclickableButton("Shuffle", grey));
	$("#details").append(unclickableButton("Aggregate", grey));
	$("#details").append(paragraph("The election end date is not reached yet, the voters can still vote."));
}


/**
* Display a set of 3 buttons representing the state of the vote in the case where the vote is over but unshuffled.
*
* @param Election election : the election.
*/
function displayFinalizeButtonSet(election){
	$("#details").append(unclickableButton("Voting", red));
	$("#details").append(clickableButton("Shuffle", green, function(){
		finalize(election);
		}));
	$("#details").append(unclickableButton("Aggregate", grey));
	$("#details").append(paragraph("The election is now over, you can now finalize and shuffle the election."));
}


/**
* Display a set of 3 buttons representing the state of the vote in the case where the vote is over and shuffled.
*
* @param Election election : the election.
*/
function displayAggregateButtonSet(election){
	$("#details").append(unclickableButton("Voting", red));
	$("#details").append(unclickableButton("Shuffle", red));
	$("#details").append(unclickableButton("Aggregate", green));
	displayChooseAggregate(election);
	$("#details").append(paragraph("The election is now over and shuffled, you can now aggregate the result."));
}


/**
* Display the different aggregations possible for the given election.
*
* @param Election election : the election concerned.
*/
function displayChooseAggregate(election){
	$("#div2").empty();
	$("#div2").append(paragraph("Show one of the following steps :"));
	$("#div2").append(clickableElement("button", "Voting", function(){
		$("#div2").empty();
		displayChooseAggregate(election);
		aggregateBallot(election);
		}));
	$("#div2").append(clickableElement("button", "Shuffle", function(){
		$("#div2").empty();
		displayChooseAggregate(election);
		aggregateShuffle(election);
		}));
	$("#div2").append(clickableElement("button", "Result", function(){
		$("#div2").empty();
		displayChooseAggregate(election);
		decryptAndDisplayElectionResult(election);
		}));
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
		$("#div1").append(h2("Your elections :"));
		$("#div1").append(separationLine());
		for(var i = 0; i < elections.length; i++){
			if(elections[i].creator == userSciper){
				$("#div1").append("    ");
				displayElectionListItem(elections[i]);
			}
		}
	}else{
		$("#div1").append(paragraph("You didn't create any elections yet."));
	}
}


/**
* Inject the code needed for the election creation.
*/
function displayElectionCreation(){
	clearDisplay();
	var numberParticipants = 0;
	$("#div1").append(createDiv("details"));
	$("#details").append(paragraph("Here you can create an election."));
	$("#details").append("<form>");
	$("#details").append("Election name :<br>");
	$("#details").append("<input type='text' name='name' placeholder='Name'><br><br>");
	$("#details").append("Deadline : <br>");
	$("#details").append("<input type='text' name='deadline' placeholder='DD/MM/YYYY'><br><br>");
	$("#details").append("Description :<br>");
	$("#details").append("<textarea name='description' cols='40' rows='5' placeholder='Add a description'></textarea><br><br>");
	$("#details").append("Participants :<br>");
	$("#details").append("<textarea name='participants' cols='40' rows='5' placeholder='Write one sciper per line'></textarea><br><br>");
	$("#details").append("</form>");

	$("#details").append(clickableElement("button", "Finish", function(){
		var errors = false;
		$("#errDiv").empty();

		var name = $("input[type='text'][name='name']").val();
		if(name == ""){
			$("#errDiv").append(paragraph("Please give a name to the election."));
			errors = true;
		}

		var deadline = $("input[type='text'][name='deadline']").val();
		if(!verifyValidDate(deadline)){
			$("#errDiv").append(paragraph("The date does not satisfy at least one of the requirements."));
			$("#errDiv").append(paragraph("The date should respect the format DD/MM/YYYY, be a valid date,"));
			$("#errDiv").append(paragraph("and no past date are allowed."));
			errors = true;
		}
		
		var description = $("textarea[name='description']").val();

		var participantsString = ($("textarea[name='participants']").val()).split('\n');
		if(participantsString.length == 0){
			$("#errDiv").append(paragraph("Please add some participants to the election."));
			errors = true;
		}
		
		var participants = [];

		for(var i = 0; i < participantsString.length; i++){
			if(verifyValidSciper(participantsString[i])){
				participants[i] = Number(participantsString[i]);
			}else{
				$("#errDiv").append(paragraph("The participant number "+(i+1)+" is not well written."));
				errors = true;
			}
		}		

		if(!errors){
			electionConfirmation(name, deadline, description, participants);
		}
	}));
}


/**
* Display a confirmation screen enabling the user to confirm or modify again his election before validating.
*
* @param String name : the name of the election.
* @param String deadline : the deadline of the election.
* @param String description : the description of the election.
* @param Uint8Array participants : the list of the scipers of the participants to the election.
*/
function electionConfirmation(name, deadline, description, participants){
	clearDisplay();
	$("#div1").append(createDiv("details"));

	$("#details").append(paragraph("Your election is ready to be created,"));
	$("#details").append(paragraph("Please verify the validity of the informations and then validate."));
	$("#details").append(separationLine());
	$("#details").append(paragraph("Name : "+name));
	$("#details").append(paragraph("Deadline : "+deadline));
	$("#details").append(paragraph("Creator : "+userSciper));
	$("#details").append(paragraph("Description : "+description));
	$("#details").append("Participants :<br>");
	var participantSciper;
	for(var i = 0; i < participants.length; i++){
		$("#details").append(participants[i]+"<br>");
	}

	$("#details").append(clickableElement("button", "Create", function(){
		createElection(name, deadline, description, participants);
		}));
	$("#details").append(clickableElement("button", "Modify", function(){
		displayElectionCreation();
		injectElectionDetails(name, deadline, description, participants);
		}));
}


/**
* Display a list of encrypted ballots in a grid. Three fields are displayed :
* - The sciper of the voter.
* - His encrypted ElGalmal pair [alpha, beta].
*
* @param Array[Ballot] box : a list of ballots. 
*/
function displayBallotBox(box){

	var numberedBallots = [];
	for(var i = 0; i < box.length; i++){
		var ballot = box[i];
		var numberedBallot = {
			recid: i,
			user: ballot.user,
			alpha: dedis.misc.uint8ArrayToHex(ballot.alpha), 
			beta: dedis.misc.uint8ArrayToHex(ballot.beta)
		}
		numberedBallots[i] = numberedBallot;
	}

	generateEncryptedBallotsGrid(numberedBallots);
}


/**
* Display a list of shuffled ballots in a grid. Three fields are displayed :
* - The sciper of the voter.
* - His encrypted shuffled ElGalmal pair [alpha, beta].
*
* @param Array[Ballot] box : a list of ballots. 
*/
function displayShuffledBox(box){

	var numberedBallots = [];
	for(var i = 0; i < box.length; i++){
		var ballot = box[i];
		var numberedBallot = {
			recid: i,
			user: ballot.user,
			alpha: dedis.misc.uint8ArrayToHex(ballot.alpha), 
			beta: dedis.misc.uint8ArrayToHex(ballot.beta)
		}
		numberedBallots[i] = numberedBallot;
	}

	generateEncryptedBallotsGrid(numberedBallots);
}


/**
* Inject the specified details in the inputs of the election creation.
*
* @param String name : the name of the election.
* @param String deadline : the deadline of the election.
* @param String description : the description of the election.
* @param Uint8Array participants : the scipers of the participants.
*/
function injectElectionDetails(name, deadline, description, participants){
	$("input[type='text'][name='name']").val(name);
	$("input[type='text'][name='deadline']").val(deadline);
	$("textarea[name='description']").val(description);
	var participantsString = "";
	for(var i = 0; i < participants.length; i++){
		participantsString += ""+participants[i];
		if(i != participants.length - 1){
			participantsString += "\n";
		}
	}
	$("textarea[name='participants']").val(participantsString);
}


/**
* Verify if a given string representing a SCIPER number is in the good format (ABCDEFG) where A,B,C,D,E,F,G are in [0 - 9].
*
* @param String sciper : the string to verify.
*
* @return true if the given sciper matches the requirements, false otherwise.
*/
function verifyValidSciper(sciper){
	var regex = /(\d\d\d\d\d\d)/;
	return sciper.length == 6 && sciper.match(regex);
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
		var genDate = new Date(year, month, day);
		//Very basic check for now, can be upgraded.
		return 1 <= month && month <= 12 && 1 <= day && day <= 31 && genDate > new Date();
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
