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
* Inject an empty navigation bar for a disconnected user.
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
	$("#div1").append(createCenteredDiv("center"));
	$("#center").append(paragraph(""));
	$("#center").append(h3("Welcome to the EPFL E-Voting application !"));
	$("#center").append(paragraph("This application allows you to vote for EPFL's elections"));
	$("#center").append(paragraph("while ensuring you security and authenticity.")); 
	$("#center").append(paragraph("To see the elections available, please login."));
	$("#center").append("<form>");
	/* Enter sciper to mock the authentication. Have to be removed in later version of the application. */
	$("#center").append(paragraph("Sciper :"));
	$("#center").append("<input type='text' name='sciper' placeholder='XXXXXX'><br><br>");
	$("#center").append("</form>");
	$("#center").append(clickableElement("button", "Login", function(){
			//authenticate();
			/* Mocking authentication waiting to turn into HTTPS. */
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
*
* @throw TypeError if the name field of the election is invalid.
* @throw TypeError if the end field of the election is invalid.
* @throw TypeError if the stage field of the election is invalid.
* @throw RangeError if the stage field of the election is not in the range [0, 2].
*/
function displayElectionListItem(election){
	/* Type check. */
	if(typeof election.name != 'string'){
		throw new TypeError('The name of the election should be a string.');
	}
	if(typeof election.end != 'string'){
		throw new TypeError('The deadline of the election should be a string.');
	}
	if(typeof election.stage != 'number'){
		throw new TypeError('The stage of the election is invalid.');
	}
	if(election.stage < 0 || election.stage > 2){
		throw new RangeError('The stage of the election is not in the good range.');
	}
	/* End type check. */

    	$("#div1").append(clickableElement('h3', ''+election.name, function(){
		displayElectionFull(election);
	    }, "list_item"));
	if(createDateFromString(election.end) > new Date()){
		/* Display end date when the election is not finished. */
		$("#div1").append(h4("End date : "+election.end));
	}else if(election.stage == 0){
		/* Clearly state that the election is finished (unshuffled case). */
		var element = h4("Finished");
		element.style.color = "#FF0000";
		$("#div1").append(element);
	}else if(election.stage == 1){
		/* Clearly state that the election is finished and shuffled. */
		var element = h4("Finished - Shuffled");
		element.style.color = "#FF0000";
		$("#div1").append(element);
	}else{
		/* Clearly state that the election is finished and decrypted. */
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
*
* @throw TypeError if the name field of the election is not a string.
* @throw TypeError if the end field of the election is invalid.
* @throw TypeError if the stage field of the election is invalid.
* @throw RangeError if the stage field of the election is not in the range [0, 2].
*/
function displayElectionFull(election){
	/* Type check. */
	if(typeof election.name != 'string'){
		throw new TypeError('The name of the election should be a string.');
	}
	if(typeof election.end != 'string'){
		throw new TypeError('The deadline of the election should be a string.');
	}
	if(typeof election.stage != 'number'){
		throw new TypeError('The stage of the election is invalid.');
	}
	if(election.stage < 0 || election.stage > 2){
		throw new RangeError('The stage of the election is not in the good range.');
	}
	/* End type check. */

	clearDisplay();	

	$("#div1").append(createCenteredDiv("details"));

	$("#details").append("<h2>"+election.name+"</h2>");
	$("#details").append(paragraph("Created by  : "+election.creator));

	if(election.end != null){
		$("#details").append(paragraph("Deadline    : "+election.end));
	}

	if(election.description != null){
		$("#details").append(paragraph("Description : "+election.description));
	}

	if(createDateFromString(election.end) >= new Date()){
		/* Election not finished yet, the user can still vote. */

		$("#details").append("<form>");

		var choices = uint8ArrayToScipers(election.data);
		for(var i = 0; i < choices.length; i++){
		var user = choices[i];
		$("#details").append("<input type='radio' name='choice' value='"+user+"'>"+user+"</input>");
		$("#details").append("<br>");
		}
		$("#details").append("</form>");
	
	    	$("#details").append(clickableElement('button', 'Submit', function(){
				var selectedSciper = Number($("input[type='radio'][name='choice']:checked").val());
				submitVote(election, selectedSciper);
			}));
	}else{
		/* Election finished, the user can't vote anymore. */
		$("#details").append(h3("The vote for this election is over."));
		if(election.stage < 2){
			$("#details").append(h4("Please wait for the administrator of the election to finalize it."));
			$("#details").append(h4("The result will then be displayed here"));
		}else{
			displayChooseAggregate(election)
		}
	}
}


/**
* Display the different aggregations possible for the given election.
*
* @param Election election : the election concerned.
*/
function displayChooseAggregate(election){
	$("#div2").empty();
	$("#div2").append(createCenteredDiv("select"));
	$("#select").append(paragraph("Show one of the following steps :"));
	$("#select").append(clickableElement("button", "Voting", function(){
		$("#div2").empty();
			displayChooseAggregate(election);
			aggregateBallot(election);
		}));
	$("#select").append(clickableElement("button", "Shuffle", function(){
		$("#div2").empty();
			displayChooseAggregate(election);
			aggregateShuffle(election);
		}));
	$("#select").append(clickableElement("button", "Result", function(){
		$("#div2").empty();
			displayChooseAggregate(election);
			aggregateResult(election);
		}));
}


/**
* Turns a uint8Array into a uint32Array representing the scipers.
* 
* @param Byte[] array the array to convert into scipers.
*
* @throw new TypeError if array is not valid.
* @throw new RangeError if the length of the array is not divisible by 3.
*/
function uint8ArrayToScipers(array){
	/* Type check. */
	if(typeof array != 'object' || typeof array.length != 'number'){
		throw new TypeError('The type of the array is not valid.');
	}
	if(array.length % 3 != 0){
		throw new RangeError('The array given has not a length divisible by 3 and can\'t be valid.');
	}
	/* End type check. */

	var recovered = [];
	for(var i = 0; 3*i < array.length; i ++){
		recovered[i] = array[3*i] + array[3*i + 1] * 0x100 + array[3*i + 2] * 0x10000;
	}
	return recovered;
}


/**
* Displays the result of the election in a grid.
* 
* @param Election election : the election of which we want to display the result.
* @param Ballot[] ballots : the list of the decrypted ballots of the election.
*
* A division with ID "grid_details" in the document have to be available.
*
* @throw TypeError if the user field of the election is invalid.
* @throw TypeError if ballots is invalid.
* @throw TypeError if at least one of the instances of ballots is invalid.
*/
function displayElectionResult(election, ballots){
	/* Type check. */
	if(typeof election.users != 'object'){
		throw new TypeError('The users field of the election is invalid.');
	}
	if(typeof ballots != 'object'){
		throw new TypeError('The ballot array is invalid.');
	}
	for(var i = 0; i < ballots.length; i++){
		if(typeof ballots[i].text != 'object'){
			throw new TypeError('At least one of the ballots is invalid.');
		}
	}
	/* End type check. */
	
	/* Computes the results from the given ballots. */

	$("#div2").append(createCenteredDiv("grid_details"));

	var participants = uint8ArrayToScipers(election.data);

	var pairArray = [];
	for(var i = 0; i < participants.length; i++){
		pairArray[i] = {key: participants[i], value: 0};
	}

	for(var j = 0; j < ballots.length; j++){
		var ballot = ballots[j];
		var array = ballot.text;

		if(typeof array != 'object' || array.length != 3){
			/* 
			* A problem happened during the encryption or during the storage, 
			* an empty ballot have been casted, we ignore it.
			*/
		}else{
			var plain = array[0]+0x100*array[1]+0x10000*array[2];

			if(ballot.user == userSciper){
				$("#grid_details").append(paragraph("Your vote : "+plain)); 
			}

			var index;
			for(var i = 0; i < pairArray.length; i++){
				if(pairArray[i].key == plain){
					index = i;
				}
			}
			var tmp = pairArray[index].value;
			pairArray[index] = {key: plain, value: tmp + 1};
		}
	}

	/* Sort the results in ascending order. */
	pairArray.sort(comparePairs);

	var displayedArray = [];
	for(var i = 0 ; i < pairArray.length; i++){
		displayedArray[i] = {recid: (i + 1), sciper: pairArray[i].key, votes: pairArray[i].value};
	}
	
	generateResultGrid(displayedArray);
	
}


/**
* Display a list of encrypted ballots in a grid. Three fields are displayed :
* - The sciper of the voter.
* - His encrypted ElGalmal pair [alpha, beta].
*
* A division with ID "grid_details" in the document have to be available.
*
* @param Ballot[] box : a list of ballots. 
*
* @throw TypeError if the box is not an array of ballots.
*/
function displayBallotBox(box){
	/* Type check. */
	if(typeof box != 'object' || typeof box.length != 'number'){
		throw new TypeError('The given box is not an array.');
	}
	for(var i = 0; i < box.length; i++){
		if(typeof box[i].user != 'number'){
			throw new TypeError('At least one of the ballots in the box is invalid.');
		}
	}
	/* End type check. */

	$("#div2").append(createCenteredDiv("grid_details"));
	var numberedBallots = [];
	for(var i = 0; i < box.length; i++){
		var ballot = box[i];
		var numberedBallot = {
			recid: i,
			user: ballot.user,
			alpha: dedis.misc.uint8ArrayToHex(ballot.alpha), 
			beta: dedis.misc.uint8ArrayToHex(ballot.beta)
		}
		if(ballot.user == userSciper){
			$("#grid_details").append(paragraph("Your ballot's encryption pair : "));
			$("#grid_details").append(paragraph(numberedBallot.alpha));
			$("#grid_details").append(paragraph(numberedBallot.beta));
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
* A division with ID "grid_details" in the document have to be available.
*
* @param Ballot[] box : a list of ballots.
*
* @throw TypeError if the box is not an array of ballots. 
*/
function displayShuffledBox(box){
	/* Type check. */
	if(typeof box != 'object' || typeof box.length != 'number'){
		throw new TypeError('The given box is not an array.');
	}
	for(var i = 0; i < box.length; i++){
		if(typeof box[i].alpha != 'object' || typeof box[i].beta != 'object'){
			throw new TypeError('At least one of the ballots in the box is invalid.');
		}
	}
	/* End type check. */

	$("#div2").append(createCenteredDiv("grid_details"));
	var numberedBallots = [];
	for(var i = 0; i < box.length; i++){
		var ballot = box[i];
		var numberedBallot = {
			recid: i,
			alpha: dedis.misc.uint8ArrayToHex(ballot.alpha), 
			beta: dedis.misc.uint8ArrayToHex(ballot.beta)
		}
		if(ballot.user == userSciper){
			$("#grid_details").append(paragraph("Your shuffled ballot's encryption pair : "));
			$("#grid_details").append(paragraph(numberedBallot.alpha));
			$("#grid_details").append(paragraph(numberedBallot.beta));
		}
		numberedBallots[i] = numberedBallot;
	}

	generateShuffledBallotsGrid(numberedBallots);
}


/**
* compares a key / value pair by comparing their values.
*
* @param Object pair1 the first key / value pair to compare.
* @param Object pair2 the second key / value pair to compare.
* The pairs should be objects with a key field and a value field.
*
* @throw TypeError if the value field of one of the pairs is invalid.
*/
function comparePairs(pair1, pair2){
	/* Type check. */
	if(typeof pair1.value != 'number' || typeof pair2.value != 'number'){
		throw new TypeError('At least one of the pairs has an invalid value field.');
	}
	/* End type check. */

	return pair1.value < pair2.value;
}


/**
* Display all elections available in a list.
*
* @param Election[] elections : the election list to display.
*
* @throw TypeError if the array of elections is invalid.
*/
function displayElections(elections){
	/* Type check. */
	if(typeof elections != 'object' || typeof elections.length != 'number'){
		throw new TypeError('The array of elections is invalid.');
	}
	/* End type check. */

    	clearDisplay();

    	if(elections.length > 0){
		/* There is some elections to display. */
		$("#div1").append(h2("Available elections :"));
		$("#div1").append(separationLine());
		for(var i = 0; i < elections.length; i++){
			$("#div1").append("    ");
			displayElectionListItem(elections[i]);
		}
		$("#div1").append(paragraph("Note that you can vote several times for the same election,"));
		$("#div1").append(paragraph("However, only the last vote will be taken into account."));
	}else{
		/* No elections to display. */
		$("#div1").append(paragraph("No elections to show"));
	}
}


/**
* Verify if a given string representing a SCIPER number is in the good format 
* (ABCDEF) of (ABCDEFG) where A,B,C,D,E,F,G are in [0 - 9].
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
* Displays an error message on the screen to alert the user of the problem.
*
* @param String message : the error message to display.
*
* @throw TypeError if the given message is not a string.
*/
function displayError(message){
	/* Type check. */
	if(typeof message != 'string'){
		throw new TypeError('The error message should be a string.');
	}
	/* End type check. */

	$('#errDiv').empty();
	$('#errDiv').append(paragraph(message));
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
