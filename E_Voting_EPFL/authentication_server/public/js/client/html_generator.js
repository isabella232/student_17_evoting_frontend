/**
* HTML Generator.
* Contains all the methods that allows to inject HTML in the document.
*/

/**
* Inject the banner with the EPFL logo and the name of the application.
*/
function show_banner(){
    	$("#banner").append("<img src='./../res/drawable/epfl_logo.png' id='banner_image'></img>");
    	$("#banner").append("<h2 id='banner_text'>EPFL E-Voting </h2>");
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
	$("#nav_election_list").append(clickableElement("p", "Election list", function(){
		display_elections(recovered_elections);
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
		if(verify_valid_sciper(sciper)){
			mockAuthentication(sciper);
			show_nav_connected();
		}else{
			$("#errDiv").append(paragraph("Incorrect SCIPER, please enter a valid one."));
		}
		}));
}

/**
* Display an election list item and associate an OnClickListener to it.
* @param Election election : the election to display as a list item.
*/
function display_election_list_item(election){
    	$("#div1").append(clickableElement('h3', ''+election.name, function(){
		display_election_full(election);
	    }, "list_item"));
	if(create_date_from_string(election.end) > new Date()){
		//Display end date when the election is not finished.
		$("#div1").append(h4("End date : "+election.end));
	}else if(election.data[0] == 0){
		//Clearly state that the election is finished (unshuffled case).
		var element = h4("Finished");
		element.style.color = "#FF0000";
		$("#div1").append(element);
	}else{
		//Clearly state that the election is finished and shuffled.
		var element = h4("Finished - Shuffled");
		element.style.color = "#FF0000";
		$("#div1").append(element);
	}	
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
		//Can be used to display remaining time when we found a good way to compute election.end - today.
		/*if(create_date_from_string(election.end) > new Date()){
			var rem_time = create_date_from_string(election.end);
			var today = new Date();
			rem_time.set
			$("#details").append(paragraph("Remaining time : "+rem_time.toDateString()));
		}else{
			$("#details").append(paragraph("This election is already over."));
		}*/
	}

	if(election.description != null){
		$("#details").append(paragraph("Description : "+election.description));
	}

	$("#div1").append("<form>");

	if(create_date_from_string(election.end) >= new Date()){	

		$("#div1").append(createDiv("choices"));

		//Election not finished yet
		for(var i = 0; i < election.users.length; i++){
		var user = election.users[i];
		$("#choices").append("<input type='radio' name='choice' value='"+user+"'>"+user+"</input>");
		$("#choices").append("<br>");
		}
		$("#choices").append("</form>");
	
	    	$("#choices").append(clickableElement('button', 'Submit', function(){
			var selected_sciper = Number($("input[type='radio'][name='choice']:checked").val());
			submit_vote(election, selected_sciper);
			}));
	}else{
		$("#div1").append(h3("The vote for this election is over."));
		//Should show the result
	}
}

/**
* Display all elections available in a list.
* @param Array{Election} elections : the election list to display.
*/
function display_elections(elections){
    	clearDisplay();

    	if(elections.length > 0){
		$("#div1").append(h2("Available elections :"));
		$("#div1").append(separation_line());
		for(var i = 0; i < elections.length; i++){
			$("#div1").append("    ");
			display_election_list_item(elections[i]);
		}
	}else{
		$("#div1").append(paragraph("No elections to show"));
	}
	
	$("#div1").append(paragraph("Note that you can vote several times for the same election,"));
	$("#div1").append(paragraph("However, only the last vote will be taken into account."));
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
	return date.length == 10 && date.match(regex);
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
	$("#logout").empty();
	$("#user_infos").empty();
}
