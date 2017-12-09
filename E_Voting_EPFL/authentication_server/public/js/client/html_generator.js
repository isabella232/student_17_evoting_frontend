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
	$("#user_infos").append(clickableElement("p", "Login", function(){
		authenticate();
		}));
}

/**
* Inject the navigation bar for a connected user.
*/
function show_nav_connected(){
	clear_navigation();
	$("#nav_election_list").append(clickableElement("p", "Election list", function(){
		display_elections(recovered_elections);
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
	$("#div1").append(clickableElement("button", "Login", function(){
		//authenticate();
		// Mocking authentication waiting to find the bug.
		mockAuthentication();
		show_nav_connected();
		}));
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
	if(election.creator != null){
	$("#div1").append("<p>Created by : "+election.creator+"</p>");
	}

	if(election.end != null){
	$("#div1").append("<p>Deadline : "+election.end+"</p>");
	}

	if(election.description != null){
	$("#div1").append("<p>Description : "+election.description+"</p>");
	}

	$("#div1").append("<form>");

	for(var i = 0; i < election.users.length; i++){
	var user = election.users[i];
	$("#div1").append("<input type='radio' name='choice' value='"+user+"'>"+user+"</input>");
	$("#div1").append("<br>");
	}
	$("#div1").append("</form>");
	
    	$("#div1").append(clickableElement('button', 'Submit', function(){
		var selected_sciper = Number($("input[type='radio'][name='choice']:checked").val());
		submit_vote(election, selected_sciper);
		}));
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
