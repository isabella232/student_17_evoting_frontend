/**
* Election Display.
* Regroups all methods relative to the display of an election, its informations, and the actions available on it.
*/


/**
* Display all elections available in a list.
*
* @param Election[] elections : the election list to display.
*
* @throw TypeError if elections is not an array.
* @throw TypeError if one of the election's creator field is invalid.
*/
function displayElections(elections){
	/* Type check. */
	if(typeof elections != 'object' || typeof elections.length != 'number'){
		throw new TypeError('The given election array is invalid.');
	}
	for(var i = 0; i < elections.length; i++){
		if(typeof elections[i].creator != 'number'){
			throw new TypeError('At least one of the election\'s creator is not well defined.');
		} 
	}
	/* End type check. */

    	clearDisplay();

	var createdElections = [];
	for(var i = 0; i < elections.length; i++){
		if(elections[i].creator == userSciper){
			createdElections[createdElections.length] = elections[i];
		}
	}

    	if(createdElections.length > 0){
		/* The admin already created an election. */
		$("#div1").append(h2("Your elections :"));
		$("#div1").append(separationLine());
		for(var i = 0; i < createdElections.length; i++){
			$("#div1").append("    ");
			displayElectionListItem(elections[i]);
		}
	}else{
		/* The admin didn't create any election yet? */
		$("#div1").append(paragraph("You didn't create any elections yet."));
	}
}


/**
* Display an election list item and associate an OnClickListener to it.
*
* @param Election election : the election to display as a list item.
*
* @throw TypeError if the stage of the election is not a number.
* @throw RangeError if the stage of the election is not in the range [0, 2].
*/
function displayElectionListItem(election){
	/* Type check. */
	if(typeof election.stage != 'number'){
		throw new TypeError('The stage of the election is invalid.');
	}
	if(election.stage < 0 || election.stage > 2){
		throw new RangeError('The stage of the election should be in the range [0, 2].');
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
		/* Clearly state that the election is finished and shuffled. */
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
* @throw TypeError if the name of the election is not a string.
* @throw TypeError if the users of the election is not an array of numbers.
*/
function displayElectionFull(election){
	/* Type check. */
	if(typeof election.name != 'string'){
		throw new TypeError('The given election has an invalid name field.');
	}
	if(typeof election.users != 'object' || typeof election.users.length != 'number'){
		throw new TypeError('The given election has an invalid users field.');
	}
	for(var i= 0; i < election.users.length; i++){
		if(typeof election.users[i] != 'number'){
			throw new TypeError('At least one user of the election has a wrong format.');
		}
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

	var participantsString = "";
	var participants = uint8ArrayToScipers(election.data);
	for(var i=0; i < participants.length; i++){
		participantsString += participants[i];
		if(i != participants.length - 1){
			participantsString += ", ";
		}
	}
	$("#details").append(paragraph("Participants : "+participantsString));

	var usersString = "";
	for(var i=0; i < election.users.length; i++){
		usersString += election.users[i];
		if(i != election.users.length - 1){
			usersString += ", ";
		}
	}
	$("#details").append(paragraph("Voters : "+usersString));

	if(createDateFromString(election.end) >= new Date()){
		/* End date not reached yet. */
		displayVotingButtonSet();
	}else{
		/* End date reached. */
		if(election.stage == 0){
			displayFinalizeButtonSet(election);	// Election not shuffled.	
		}else{
			displayAggregateButtonSet(election);	// Election shuffled.
		}
	}
}


/**
* Turns a uint8Array into a uint32Array representing the scipers.
* 
* @param Byte[] array the array to convert into scipers.
* 
* @return Number[] the recovered scipers.
*
* @throw TypeError if the given array is not an array of numbers.
* @throw RangeError if the length of the array is not divisible by 3.
*/
function uint8ArrayToScipers(array){
	/* Type check. */
	if(typeof array != 'object' || typeof array.length != 'number'){
		throw new TypeError('The given array is not valid.');
	}
	for(var i = 0; i < array.length; i++){
		if(typeof array[i] != 'number'){
			throw new TypeError('At least one of the elements of the given array is invalid.');
		}
	}
	if(array.length % 3 != 0){
		throw new RangeError('The length of the array is not divisible by 3.');
	}
	/* End type check. */

	var recovered = [];
	for(var i = 0; 3*i < array.length; i ++){
		recovered[i] = array[3*i] + array[3*i + 1] * 0x100 + array[3*i + 2] * 0x10000;
	}
	return recovered;
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
* Displays the result of the election in a grid.
* 
* @param Election election : the election of which we want to display the result.
* @param Ballot[] ballots : the list of the decrypted ballots of the election.
*
* @throw TypeError if the users field of the election is not an array.
* @throw TypeError if ballots is not an array.
* @throw TypeError if one of the element of ballots has an invalid text field.
*/
function displayElectionResult(election, ballots){
	/* Type check. */
	if(typeof election.users != 'object' || typeof election.users.length != 'number'){
		throw new TypeError('The users field of the election is invalid.');
	}
	if(typeof ballots != 'object' || typeof ballots.length != 'number'){
		throw new TypeError('The given ballots array is invalid.');
	}
	for(var i =0; i < ballots.length; i++){
		if(typeof ballots[i].text != 'object' || typeof ballots[i].text.length != 'number'){
			throw new TypeError('At least one of the ballots\' text field is invalid.');
		}
	}
	/* End type check. */

	$("#div2").append(paragraph("Election result : "));
	
	/* Compute results from given ballots. */

	var participants = uint8ArrayToScipers(election.data);

	var pairArray = [];
	for(var i = 0; i < participants.length; i++){
		pairArray[i] = {key: participants[i], value: 0};
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
*
* @param Object pair1 the first key / value pair to compare.
* @param Object pair2 the second key / value pair to compare.
*
* @return the result of the comparison of the values of the pairs.
*
* @throw TypeError if the value field of one of the pair is not a number.
*/
function comparePairs(pair1, pair2){
	/* Type check. */
	if(typeof pair1.value != 'number' || typeof pair2.value != 'number'){
		throw new TypeError('At least one the pairs\' value field is not a number.');
	}
	/* End type check. */

	return pair1.value < pair2.value;
}


/**
* Display a list of encrypted ballots in a grid. Three fields are displayed :
* - The sciper of the voter.
* - His encrypted ElGalmal pair [alpha, beta].
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

	var numberedBallots = [];
	for(var i = 0; i < box.length; i++){
		var ballot = box[i];
		var numberedBallot = {
			recid: i,
			alpha: dedis.misc.uint8ArrayToHex(ballot.alpha), 
			beta: dedis.misc.uint8ArrayToHex(ballot.beta)
		}
		numberedBallots[i] = numberedBallot;
	}

	generateShuffledBallotsGrid(numberedBallots);
}
