/**
* Grid_generator.
* Contains all the methods allowing to generate w2ui grids and display them in the division #div2.
* Be aware that a specific format as to be respected for the ballots given as arguments.
*/


// This number will generate unique IDs for all grids.
var id = 0;


/**
* Generates a grid for the results of an election.
* 
* @param Array[Object] results : an array representing the election.
* Each object in the results array should have the following fields : 
* - recid : which should be unique for each object.
* - sciper : the sciper of a participant of the election.
* - votes : the number of votes this participant get.
*/
function generateResultGrid(results){

	$("#div2").append(paragraph("If the results does not appear in the grid, please click on its refresh button."));

	$("#div2").append(createGrid("gridDiv")); 
		
	$('#gridDiv').w2grid({
		name: "Grid"+(id++),
		header: 'List of Ballots',
		show: {
		toolbar: true,
		footer: true
		},
		columns: [
		{ field: 'recid', caption: 'Place', size: '60px', sortable: true, attr: 'align=center' },
		{ field: 'sciper', caption: 'Sciper', size: '50%', sortable: true, resizable: true },
		{ field: 'votes', caption: 'Votes', size: '50%', sortable: true, resizable: true }
		],
		searches: [
		{ field: 'user', caption: 'Sciper', type: 'text' }
		],
		sortData: [{ field: 'recid', direction: 'ASC' }],
		records: results
	});
}


/**
* Generate a grid to represent encrypted ballots.
*
* @param Array[Object] ballots : the ballots to display.
* The ballots should have the following fields :
* - user : the sciper of a participant of the election.
* - alpha : the alpha field of the ElGamal encryption of the ballot.
* - beta : the beta field of the ElGamal encryption of the ballot.
*/
function generateEncryptedBallotsGrid(ballots){
	
	$("#div2").append(paragraph("If the results does not appear in the grid, please click on its refresh button."));

	$("#div2").append(createGrid("gridDiv")); 
		
	$('#gridDiv').w2grid({
		name: "Grid"+(id++),
		header: 'List of Ballots',
		show: {
		toolbar: true,
		footer: true
		},
		columns: [
		{ field: 'user', caption: 'Sciper', size: '60px', sortable: true, attr: 'align=center' },
		{ field: 'alpha', caption: 'Alpha', size: '50%', sortable: true, resizable: true },
		{ field: 'beta', caption: 'Beta', size: '50%', sortable: true, resizable: true }
		],
		searches: [
		{ field: 'user', caption: 'Sciper', type: 'text' }
		],
		sortData: [{ field: 'user', direction: 'ASC' }],
		records: ballots
	});
}
