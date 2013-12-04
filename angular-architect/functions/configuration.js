//---------------------------------------------------------------------------------
// S P I N N E R 
//---------------------------------------------------------------------------------
var opts = {
		lines: 9, // The number of lines to draw
		length: 10, // The length of each line
		width: 7, // The line thickness
		radius: 10, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 13, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#fff', // #rgb or #rrggbb
		speed: 1.5, // Rounds per second
		trail: 40, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: false, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
};
var target = document.getElementById('spinner');
var spinner = new Spinner(opts).spin(target);

function toggleOverlay(){
	var overlay = document.getElementById('overlay');
	if(overlay.style.display == "block"){
		overlay.style.display = "none";
		//spinner.style.display = "none";
	} else {
		overlay.style.display = "block";
		//spinner.style.display = "block";
	}
}

function hideSpinner(){
	var overlay = document.getElementById('overlay');
	overlay.style.display = "none";
    //spinner.stop();
}

function showSpinner(opacity){
	var overlay = document.getElementById('overlay');
	 document.getElementById('loadingMessages').innerHTML="";
	//spinner.spin('overlay');
	overlay.style.display = "block";	
	if (typeof opacity !== "undefined"){
		overlay.style.opacity = opacity;
	}
}

var spinnerRequest = 0;

function stopSpinner(){
	//console.log("spinnerRequest prima di stop: "+ spinnerRequest);
	spinnerRequest = spinnerRequest-1;
	if (spinnerRequest===0){
		//console.log("nascondo spinnerRequest");
		hideSpinner();
	}	
}

function startSpinner(){
	//console.log("spinnerRequest prima di start: "+ spinnerRequest);
	if (spinnerRequest===0){
		//console.log("Mostro lo spinnerRequest");
		showSpinner(0.4);
	}
	spinnerRequest++;
}