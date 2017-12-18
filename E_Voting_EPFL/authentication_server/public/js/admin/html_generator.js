/**
* HTML Generator.
* Contains all the methods that allows to inject HTML in the document.
*/

const red = "#ff0707";
const green = "#30f209";
const grey = "#b2a0a0";

const fakeBox = [
	{recid : 1, user : 247222, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 2, user : 123456, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 3, user : 147852, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 4, user : 987456, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 5, user : 852369, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 6, user : 123457, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 7, user : 145236, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 8, user : 245698, alpha : "AAA", beta : "BBB", text : "plain"},
	{recid : 9, user : 345876, alpha : "AAA", beta : "BBB", text : "plain"}
	];

/**
* Inject the banner with the EPFL logo and the name of the application.
*/
function show_banner(){
    	$("#banner").append("<img src='./../res/drawable/epfl_logo.png' id='banner_image'></img>");
    	$("#banner").append("<h2 id='banner_text'>EPFL E-Voting </h2>");
}

/**
* Inject the code for an unlogged admin.
*/
function show_unlogged(){
	show_nav_disconnected();
	clearDisplay();
        display_welcome_page();
	$("#div2").append(clickableElement("button", "Show me a box", function(){
		display_ballot_box(fakeBox);
	}));
}

/**
* Inject the navigation bar for a disconnected user.
*/
function show_nav_disconnected(){
	clear_navigation();
}

/**
* Inject the navigation bar for a connected user.
*/
function show_nav_connected(){
	clear_navigation();
	$("#nav_election_list").append(clickableElement("p", "Your elections", function(){
		display_elections(recovered_elections);
		}));
	$("#nav_create_election").append(clickableElement("p", "Create election", function(){
		display_election_creation(recovered_elections);
		}));
	$("#logout").append(clickableElement("p", "Logout", function(){
		logout();
		}));
	$("#user_infos").append(paragraph("Hi "+user_sciper));
}

/**
* Inject a welcome text when a client arrives unlogged on the web page.
*/
function display_welcome_page(){
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
		if(verify_valid_sciper(sciper)){
			mockAuthentication(sciper);
			show_nav_connected();
		}else{
			$("#errDiv").append(paragraph("Incorrect SCIPER, please enter a valid one."));
		}
		}));
	$("#div1").append(h4("Be aware that an admin account is required to access this page"));
}

/**
* Display an election list item and associate an OnClickListener to it.
* @param Election election : the election to display as a list item.
*/
function display_election_list_item(election){
    	$("#div1").append(clickableElement('h3', ''+election.name, function(){
		display_election_full(election);
	    }, "list_item"));
	$("#div1").append(h4("End date : "+election.end));	
	$("#div1").append(separation_line());
}

/**
* Display all the informations of a given election and the radio buttons showing the possible votes.
* @param Election election : the election to display.
*/
function display_election_full(election){
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

	var users_string = "";
	for(var i=0; i < election.users.length; i++){
		users_string += election.users[i];
		if(i != election.users.length - 1){
			users_string += ", ";
		}
	}
	$("#details").append(paragraph("Participants : "+users_string));

	if(create_date_from_string(election.end) >= new Date()){
		//End date not reached yet
		display_voting_button_set();
	}else{
		//End date reached
		if(election.data && election.data[0] == 1){		
			display_aggregate_button_set(election);
		}else{
			display_finalize_button_set(election);
		}
	}
}

/**
* Display a set of 3 buttons representing the state of the vote in the case where the deadline is not reached yet.
*/
function display_voting_button_set(){
	$("#div1").append(unclickableButton("Voting", green));
	$("#div1").append(unclickableButton("Finalize", grey));
	$("#div1").append(unclickableButton("Aggregate", grey));
	$("#div1").append(paragraph("The election end date is not reached yet, the voters can still vote."));
}

/**
* Display a set of 3 buttons representing the state of the vote in the case where the vote is over but unshuffled.
* @param Election election : the election.
*/
function display_finalize_button_set(election){
	$("#div1").append(unclickableButton("Voting", red));
	$("#div1").append(clickableButton("Finalize", green, function(){
		finalize(election);
		}));
	$("#div1").append(unclickableButton("Aggregate", grey));
	$("#div1").append(paragraph("The election is now over, you can now finalize and shuffle the election."));
}

/**
* Display a set of 3 buttons representing the state of the vote in the case where the vote is over and shuffled.
* @param Election election : the election.
*/
function display_aggregate_button_set(election){
	$("#div1").append(unclickableButton("Voting", red));
	$("#div1").append(unclickableButton("Finalize", red));
	$("#div1").append(clickableButton("Aggregate", green, function(){
		display_choose_aggregate(election);
		}));
	$("#div1").append(paragraph("The election is now over and shuffled, you can now aggregate the result."));
}

/**
* Display all elections available in a list.
* @param Array{Election} elections : the election list to display.
*/
function display_elections(elections){
    	clearDisplay();

    	if(elections.length > 0){
		$("#div1").append(h2("Your elections :"));
		$("#div1").append(separation_line());
		for(var i = 0; i < elections.length; i++){
			if(elections[i].creator == user_sciper){
				$("#div1").append("    ");
				display_election_list_item(elections[i]);
			}
		}
	}else{
		$("#div1").append(paragraph("You didn't create any elections yet."));
	}
}

/**
* Inject the code needed for the election creation.
*/
function display_election_creation(){
	clearDisplay();
	var number_participants = 0;
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
		if(!verify_valid_date(deadline)){
			$("#errDiv").append(paragraph("The date does not satisfy at least one of the requirements."));
			$("#errDiv").append(paragraph("The date should respect the format DD/MM/YYYY, be a valid date,"));
			$("#errDiv").append(paragraph("and no past date are allowed."));
			errors = true;
		}
		
		var description = $("textarea[name='description']").val();

		var participants_string = ($("textarea[name='participants']").val()).split('\n');
		if(participants_string.length == 0){
			$("#errDiv").append(paragraph("Please add some participants to the election."));
			errors = true;
		}
		
		var participants = [];

		for(var i = 0; i < participants_string.length; i++){
			if(verify_valid_sciper(participants_string[i])){
				participants[i] = Number(participants_string[i]);
			}else{
				$("#errDiv").append(paragraph("The participant number "+(i+1)+" is not well written."));
				errors = true;
			}
		}		

		if(!errors){
			election_confirmation(name, deadline, description, participants);
		}
	}));
}

/**
* Display a confirmation screen enabling the user to confirm or modify again his election before validating.
* @param String name : the name of the election.
* @param String deadline : the deadline of the election.
* @param String description : the description of the election.
* @param Uint8Array participants : the list of the scipers of the participants to the election.
*/
function election_confirmation(name, deadline, description, participants){
	clearDisplay();
	$("#div1").append(createDiv("details"));

	$("#details").append(paragraph("Your election is ready to be created,"));
	$("#details").append(paragraph("Please verify the validity of the informations and then validate."));
	$("#details").append(separation_line());
	$("#details").append(paragraph("Name : "+name));
	$("#details").append(paragraph("Deadline : "+deadline));
	$("#details").append(paragraph("Creator : "+user_sciper));
	$("#details").append(paragraph("Description : "+description));
	$("#details").append("Participants :<br>");
	var participant_sciper;
	for(var i = 0; i < participants.length; i++){
		$("#details").append(participants[i]+"<br>");
	}

	$("#details").append(clickableElement("button", "Create", function(){
		create_election(name, deadline, description, participants);
		}));
	$("#details").append(clickableElement("button", "Modify", function(){
		display_election_creation();
		inject_election_details(name, deadline, description, participants);
		}));
}

function display_choose_aggregate(election){
	$("#div2").empty();
	$("#div2").append(paragraph("Please select the desired aggregation."));
	$("#div2").append(clickableElement("button", "Ballot", function(){
		aggregate_ballot(election);
		}));
	$("#div2").append(clickableElement("button", "Shuffle", function(){
		aggregate_shuffle(election);
		}));
	$("#div2").append(clickableElement("button", "Decrypted", function(){
		aggregate_decrypted(election);
		}));
}

function display_ballot_box(box){
	$("#div2").append(paragraph("Aggregated ballots :"));

	$("#div2").append(createGrid("gridDiv")); 

	$('#gridDiv').w2grid({
		name: 'grid',
		header: 'List of Ballots',
		show: {
		toolbar: true,
		footer: true
		},
		columns: [
		{ field: 'recid', caption: 'ID', size: '50px', sortable:true, attr: 'align=center' },
		{ field: 'user', caption: 'Sciper', size: '60px', sortable: true, attr: 'align=center' },
		{ field: 'alpha', caption: 'Alpha', size: '30%', sortable: true, resizable: true },
		{ field: 'beta', caption: 'Beta', size: '30%', sortable: true, resizable: true },
		{ field: 'text', caption: 'Plain Text', size: '40%', resizable: true },
		],
		searches: [
		{ field: 'user', caption: 'Sciper', type: 'text' },
		{ field: 'text', caption: 'Plain Text', type: 'text' },
		],
		sortData: [{ field: 'recid', direction: 'ASC' }],
		records: box,
		onRender: function(){
			console.log("chabadabadou");
			this.refresh();
		}
	});

	/*onRefresh: function (target, eventData) {
			var grid = this;
			eventData.onComplete = function () {
				console.log( "chabadabadou" );
				grid.refresh();
			}
		}*/
}

/**
* Inject the specified details in the inputs of the election creation.
* @param String name : the name of the election.
* @param String deadline : the deadline of the election.
* @param String description : the description of the election.
* @param Uint8Array participants : the scipers of the participants.
*/
function inject_election_details(name, deadline, description, participants){
	$("input[type='text'][name='name']").val(name);
	$("input[type='text'][name='deadline']").val(deadline);
	$("textarea[name='description']").val(description);
	var participants_string = "";
	for(var i = 0; i < participants.length; i++){
		participants_string += ""+participants[i];
		if(i != participants.length - 1){
			participants_string += "\n";
		}
	}
	$("textarea[name='participants']").val(participants_string);
}

/**
* Verify if a given string representing a SCIPER number is in the good format (ABCDEFG) where A,B,C,D,E,F,G are in [0 - 9].
* @param String sciper : the string to verify.
* @return true if the given sciper matches the requirements, false otherwise.
*/
function verify_valid_sciper(sciper){
	var regex = /(\d\d\d\d\d\d)/;
	return sciper.length == 6 && sciper.match(regex);
}

/**
* Verify if a given string representing a date is in the good format (DD/MM/YYYY).
* @param String date : the string to verify.
* @return true if the given string matches the requirements, false otherwise
*/
function verify_valid_date(date){
	var regex = /(\d\d\/\d\d\/\d\d\d\d)/;
	if(date.length == 10 && date.match(regex)){
		var splitted = date.split('/');
		var day = splitted[0];
		var month = splitted[1];
		var year = splitted[2];
		var gen_date = new Date(year, month, day);
		//Very basic check for now, can be upgraded.
		return 1 <= month && month <= 12 && 1 <= day && day <= 31 && gen_date > new Date();
	}else{
		return false;
	}
}

/**
* Create a Date from the given string (which should be in the DD/MM/YYYY format).
* @param String string : the string to convert into a date.
* @return Date : a date from the given representation, null if the representation wasn't in a good format.
*/
function create_date_from_string(string){
	if(verify_valid_date(string)){
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
function clear_navigation(){
	$("#nav_election_list").empty();
	$("#nav_create_election").empty();
	$("#logout").empty();
	$("#user_infos").empty();
}
