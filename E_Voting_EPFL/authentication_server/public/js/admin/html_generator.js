/**
* HTML Generator.
* Contains all the methods that allows to inject HTML in the document.
*/

const red = "#ff0707";
const green = "#30f209";
const grey = "#b2a0a0";

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
	$("#user_infos").append(clickableElement("p", "Login", function(){
		authenticate();
		}));
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
	$("#div1").append(clickableElement("button", "Login", function(){
		//authenticate();
		// Mocking authentication waiting to find the bug.
		mockAuthentication();
		show_nav_connected();
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
	    }));
	$("#div1").append(h4("End date : "+election.end));	
	$("#div1").append(separation_line());
}

/**
* Display all the informations of a given election and the radio buttons showing the possible votes.
* @param Election election : the election to display.
*/
function display_election_full(election){
	clearDisplay();	

	$("#div1").append("<h2>"+election.name+"</h2>");

	$("#div1").append(createDiv("details"));

	if(election.creator != null){
		$("#details").append(paragraph("Created by  : "+election.creator));
	}

	if(election.end != null){
		$("#details").append(paragraph("Deadline    : "+election.end));
	}

	if(election.description != null){
		$("#details").append(paragraph("Description : "+election.description));
	}

	if(create_date_from_string(election.end) >= new Date()){
		//End date not reached yet
		$("#div1").append(unclickableButton("Voting", green));
		$("#div1").append(unclickableButton("Shuffle", grey));
		$("#div1").append(unclickableButton("Finalize", grey));
		$("#div1").append(paragraph("The election end date is not reached yet, the voters can still vote."));
	}else{
		//End date reached
		$("#div1").append(unclickableButton("Voting", red));
		$("#div1").append(unclickableButton("Shuffle", green));
		$("#div1").append(unclickableButton("Finalize", grey));
		//Have to check if the election have already been shuffled or not.
		$("#div1").append(paragraph("The election is now over, you can now shuffle and finalize the election."));
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
	$("#div1").append(paragraph("Here you can create an election."));
	$("#div1").append(paragraph("Please note that only people with an administrator status are authorized to create an election."));
	$("#div1").append("<form>");
	$("#div1").append("Election name :<br>");
	$("#div1").append("<input type='text' name='name' placeholder='name'><br><br>");
	$("#div1").append("Deadline : <br>");
	$("#div1").append("<input type='text' name='deadline' placeholder='DD/MM/YYYY'><br><br>");
	$("#div1").append("Description :<br>");
	$("#div1").append("<textarea name='description' cols='40' rows='5' placeholder='Add a description'></textarea><br><br>");
	$("#div1").append("Participants :<br>");
	$("#div1").append("<textarea name='participants' cols='40' rows='5' placeholder='Write one sciper per line'></textarea><br><br>");
	$("#div2").append("</form>");

	$("#div2").append(clickableElement("button", "Finish", function(){
		var errors = false;
		$("#errDiv").empty();

		var name = $("input[type='text'][name='Name']").val();

		var deadline = $("input[type='text'][name='deadline']").val();
		if(!verify_valid_date(deadline)){
			$("#errDiv").append(paragraph("The date is in a wrong format."));
			errors = true;
		}
		
		var description = $("textarea[name='description']").val();

		var participants_string = ($("textarea[name='participants']").val()).split('\n');
		console.log(participants_string);
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
			create_election(name, deadline, description, participants);
		}
	}));

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
			Number(splitted[1]), Number(splitted[0]), 0, 0, 0, 0);
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
	$("#user_infos").empty();
}
