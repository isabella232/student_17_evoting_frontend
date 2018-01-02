/**
* DOM generator.
* Allows to generate elements to inject in the document through jQuery.
*/


/**
* Create a clickable element with a given type.
*
* @param String elementType : the type of the element to create.
* @param String textToDisplay : the text to display on the element.
* @param Function onClick : the function to execute when clicking on the created element.
* @param (Optional) String className : name of class to add to the element.
*
* @return HTMLElement : an element with the given attributes.
*
* @throw TypeError if elementType is not a String.
* @throw TypeError if textToDisplay is not a String.
* @throw TypeError if onClick is not a function.
*/
function clickableElement(elementType, textToDisplay, onClick, className){
	/* Type check. */
	if(typeof elementType != 'string'){
		throw new TypeError('The element type should be given as a string.');
	}
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The text to display should be given as a string.');
	}
	if(typeof onClick != 'function'){
		throw new TypeError('The on click method should be a function.');
	}
	/* End type check. */

	var element = document.createElement(elementType);
	element.innerHTML = textToDisplay;
	element.addEventListener("click", onClick);
	element.style.cursor = "pointer";

	/* If a class has been asked to be added, add it. Otherwise do nothing more. */
	if(typeof className != "undefined"){
		element.className += className;
	}
	return element;
}





/**
* Create a division with the given ID and a text alignment set to left.
*
* @param id : the id of the new division.
*
* @return HTMLElement : a division with the given id.
*
* @throw TypeError if id is not a string.
*/
function createCenteredDiv(id){
	/* Type check. */
	if(typeof id != 'string'){
		throw new TypeError('The id of the new div should be a string.');
	}
	/* End type check. */

	var element = document.createElement("div");
	element.id = id;
	element.style.textAlign = "left";
	element.style.width = "40%";
	element.style.margin = "0 auto";
	return element;
}


/**
* Create a division with the given ID made to host a grid.
*
* @param id : the id of the new division.
*
* @return HTMLElement : a division with the given id.
*
* @throw TypeError if id is not a String.
*/
function createGrid(id){
	/* Type check. */
	if(typeof id != 'string'){
		throw new TypeError('The id of new div for the grid should be a string.');
	}
	/* End type check. */

	var element = document.createElement("div");
	element.id = id;
	element.style.width = "80%";
	element.style.height = "350px";
	element.style.margin = "0 auto";
	return element;
}


/**
* Return a paragraph element with the given text.
*
* @param String textToDisplay : the text to display in the paragraph.
*
* @return HTMLParagraphElement an element representing a paragraph with the given text.
*
* @throw TypeError if textToDisplay is not a string.
*/
function paragraph(textToDisplay) {
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The text to display should be a string.');
	}
	/* End type check. */

	var element = document.createElement("p");
	element.innerHTML = textToDisplay;
	return element;
}


/**
* Return a header h2 with the given text.
*
* @param String textToDisplay : the text to insert in the header.
*
* @return HTMLH2Element an element representing a header h2 element with the given text.
*
* @throw TypeError if textToDisplay is not a string.
*/
function h2(textToDisplay) {
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The text to display should be a string.');
	}
	/* End type check. */
	
	var element = document.createElement("h2");
	element.innerHTML = textToDisplay;
	return element;
}


/**
* Return a header h3 with the given text.
*
* @param String textToDisplay : the text to insert in the header.
*
* @return HTMLH3Element an element representing a header h3 element with the given text.
*
* @throw TypeError if textToDisplay is not a string.
*/
function h3(textToDisplay) {
	/* Type check.*/
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The text to display should be a string.');
	}
	/* End type check. */

	var element = document.createElement("h3");
	element.innerHTML = textToDisplay;
	return element;
}


/**
* Return a header h4 with the given text.
*
* @param String textToDisplay : the text to insert in the header.
*
* @return HTMLH4Element an element representing a header h4 element with the given text.
*
* @throw TypeError if textToDisplay is not a string.
*/
function h4(textToDisplay) {
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The text to display should be a string.');
	}
	/* End type check. */

	var element = document.createElement("h4");
	element.innerHTML = textToDisplay;
	return element;
}


/**
* Returns an element representing a separation line.
* The specificities of this line can be found in the css class "underlined".
*
* @return HTMLDivElement an element representing a separation line.
*/
function separationLine(){
	var element = document.createElement("div");
	element.className += "underlined";
	return element;
}
