/**
* Election Creation
* Regroups all methods relative to the election creation.
*/


/**
* Inject the code needed for the election creation.
*/
function displayElectionCreation(){
	clearDisplay();
	var numberParticipants = 0;
	$("#div1").append(createCenteredDiv("details"));
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
	$("#details").append("Voters :<br>");
	$("#details").append("<textarea name='voters' cols='40' rows='5' placeholder='Write one sciper per line'></textarea><br><br>");
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
			$("#errDiv").append(paragraph("and no date before tomorrow are allowed."));
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

		var votersString = ($("textarea[name='voters']").val()).split('\n');
		if(votersString.length == 0){
			$("#errDiv").append(paragraph("Please add some voters to the election."));
			errors = true;
		}
		
		var voters = [];

		for(var i = 0; i < votersString.length; i++){
			if(verifyValidSciper(votersString[i])){
				voters[i] = Number(votersString[i]);
			}else{
				$("#errDiv").append(paragraph("The voter number "+(i+1)+" is not well written."));
				errors = true;
			}
		}		

		if(!errors){
			electionConfirmation(name, deadline, description, participants, voters);
		}
	}));
}


/**
* Display a confirmation screen enabling the user to confirm or modify again his election before validating.
*
* @param String name : the name of the election.
* @param String deadline : the deadline of the election.
* @param String description : the description of the election.
* @param Number[] participants : the list of the scipers of the participants of the election.
* @param Number[] voters : the list of the scipers of the voters of the election. 
*
* @throw TypeError if participants is not an array of numbers.
* @throw TypeError if voters is not an array of numbers.
*/
function electionConfirmation(name, deadline, description, participants, voters){
	if(typeof participants != 'object' || typeof participants.length != 'number'){
		throw new TypeError('The given participants array is invalid.');
	}
	for(var i = 0; i < participants.length; i++){
		if(typeof participants[i] != 'number'){
			throw new TypeError('At least one of the participants is not a number.');
		}
	}
	
	if(typeof voters != 'object' || typeof voters.length != 'number'){
		throw new TypeError('The given voters array is invalid.');
	}
	for(var i= 0; i < voters.length; i++){
		if(typeof voters[i] != 'number'){
			throw new TypeError('At least one of the voters is not a number.');
		}
	}	

	clearDisplay();
	$("#div1").append(createCenteredDiv("details"));

	$("#details").append(paragraph("Your election is ready to be created,"));
	$("#details").append(paragraph("Please verify the validity of the informations and then validate."));
	$("#details").append(separationLine());
	$("#details").append(paragraph("Name : "+name));
	$("#details").append(paragraph("Deadline : "+deadline));
	$("#details").append(paragraph("Creator : "+userSciper));
	$("#details").append(paragraph("Description : "+description));

	$("#details").append("Participants :<br>");
	for(var i = 0; i < participants.length; i++){
		$("#details").append(participants[i]+"<br>");
	}
	$("#details").append(paragraph(""));

	$("#details").append("Voters :<br>");
	for(var i = 0; i < voters.length; i++){
		$("#details").append(voters[i]+"<br>");
	}
	$("#details").append(paragraph(""));

	$("#details").append(clickableElement("button", "Create", function(){
		createElection(name, deadline, description, participants, voters);
		}));
	$("#details").append(clickableElement("button", "Modify", function(){
		displayElectionCreation();
		injectElectionDetails(name, deadline, description, participants, voters);
		}));
}


/**
* Inject the specified details in the inputs of the election creation.
*
* @param String name : the name of the election.
* @param String deadline : the deadline of the election.
* @param String description : the description of the election.
* @param Number[] participants : the scipers of the participants.
* @param Number[] voters : the scipers of the voters.
*
* @throw TypeError if participants is not an array of numbers.
* @throw TypeError if voters is not an array of numbers.
*/
function injectElectionDetails(name, deadline, description, participants, voters){
	if(typeof participants != 'object' || typeof participants.length != 'number'){
		throw new TypeError('The given participants array is invalid.');
	}
	for(var i = 0; i < participants.length; i++){
		if(typeof participants[i] != 'number'){
			throw new TypeError('At least one of the participants is not a number.');
		}
	}
	
	if(typeof voters != 'object' || typeof voters.length != 'number'){
		throw new TypeError('The given voters array is invalid.');
	}
	for(var i= 0; i < voters.length; i++){
		if(typeof voters[i] != 'number'){
			throw new TypeError('At least one of the voters is not a number.');
		}
	}

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

	var votersString = "";
	for(var i = 0; i < voters.length; i++){
		votersString += ""+voters[i];
		if(i != voters.length - 1){
			votersString += "\n";
		}
	}
	$("textarea[name='voters']").val(votersString);
}
