/**
* DOM generator.
* Allows to generate elements with associated functions.
*/


/**
* Create a clickable element with a given type.
*
* @param String elementType : the type of the element to create.
* @param String textToDisplay : the text to display on the element.
* @param Function onClick : the function to execute when clicking on the created element.
* @param String className : name of class to add to the element.
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
	if(typeof className != "undefined"){
		element.className += className;
	}
	return element;
}


/**
* Creates a real button, satisfying the design of the buttons set with a given color.
*
* @param String textToDisplay : the text to display on the button.
* @param String color : the hex representation of the color of the button.
* @param Function onClick : the function to execute on click.
*
* @return HTMLElement : a clickable button with the given text, color and on click function.
*
* @throw TypeError if textToDisplay is not a string.
* @throw TypeError if color is not a string.
* @throw TypeError if onClick is not a function.
*/
function clickableButton(textToDisplay, color, onClick){
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The text to display should be a string.');
	}
	if(typeof color != 'string'){
		throw new TypeError('The color of the element should be given as an hexadecimal string.');
	}
	if(typeof onClick != 'function'){
		throw new TypeError('The on click function given is not a function.');
	}
	/* End type check. */

	var element = clickableElement("button", textToDisplay, onClick);
	element.style.backgroundColor = color;
	element.style.height = "50px";
	element.style.color = "#000000";
	return element;
}


/**
* Create an unclickable button.
*
* @param String textToDisplay : the text to display on the button.
* @param String color : the hex representation of the color of the button.
*
* @return HTMLElement : an unclickable button with the given text insight.
*
* @throw TypeError if textToDisplay is not a string.
* @throw TypeError if color is not a string.
*/
function unclickableButton(textToDisplay, color){
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The text to display should be a string.');
	}
	if(typeof color != 'string'){
		throw new TypeError('The color of the element should be given as an hexadecimal string.');
	}
	/* End type check. */

	var element = document.createElement("button");
	element.innerHTML = textToDisplay;
	element.disabled = "disabled";
	element.style.backgroundColor = color;
	element.style.height = "50px";
	element.style.color = "#000000";
	return element;
}


/**
* Create a division with the given ID centered and with a text alignment set to left.
*
* @param String id : the id of the new division.
*
* @return HTMLElement : a division with the given id.
*
* @throw TypeError if id is not a string.
*/
function createCenteredDiv(id){
	/* Type check. */
	if(typeof id != 'string'){
		throw new TypeError('The given id should be a string.');
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
* @return HTML Element : a division with the given id.
*
* @throw TypeError if id is not a string.
*/
function createGrid(id){
	/* Type check. */
	if(typeof id != 'string'){
		throw new TypeError('The given id should be a string.');
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
* @throw TypeError if the text to display is not a string.
*/
function paragraph(textToDisplay) {
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The given text to display is not a string.');
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
* @throw TypeError if the text to display is not a string.
*/
function h2(textToDisplay) {
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The given text to display is not a string.');
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
* @throw TypeError if the text to display is not a string.
*/
function h3(textToDisplay) {
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The given text to display is not a string.');
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
* @throw TypeError if the text to display is not a string.
*/
function h4(textToDisplay) {	
	/* Type check. */
	if(typeof textToDisplay != 'string'){
		throw new TypeError('The given text to display is not a string.');
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
