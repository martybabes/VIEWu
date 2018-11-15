// globals
var songmode = "___";
var maxsongs = 30;
var urlmusic = "" // alternative music file location
var songlines = new Array();
var scrtimes = []; //mm:ss(:d) 
var scrviews = ""; //v  v=0-9 (99==blank change to 0)
var scrtimespos = 0; // current timing array position being watched
var scrorder = "";  // empty or 'vvvvvv' v=0-9 (0==blank)
var currentscreen = 1; // cuurrent screen showing (0==blank)
var oldscreen = 0;
var scrorderpos= 0;	//current pos in scrorder string (overrides going incremental order of screens)
var versecount = 9; // number of screens
var fxshow = new Array("#","#","#","#","#","#","#","#","#","#","#","#");
var currentpos = 0; // position pointer for scrtimes[]
var nextsong = 0;

var theme = "green";
var widescreen = true;
var fontwidthClass = "fontXnormal";
var fontheightClass = "fontYnormal";
var textClass = "txtwhite";
var splashFN = "splash";
var backgndFN = "#";
var bgClass = "bgblack";
var plainTI = false;
var progcount = 0;
var progpos = -1;
var gonextitem = false;
var showtitleinf = false;
var actioned = false; // prevent another view doing event 
var screenTimer;
var canstartTimer;
var playerwait = 0;
var clickTimer;
// arr = []; clears array
// arr.length - #items in the array

$(function() {
var	audioPlayer = document.getElementById("audioplayer"),
	homescr = 	document.getElementById("home"),
	blankscr = 	document.getElementById("blank"),
	titlescr = document.getElementById("titlescr"),
	viewscr =	document.getElementById("view"),
	setlistscr = document.getElementById("setlist"),
	previewscr = document.getElementById("previewtable"),
	titlediv = document.getElementById("title"),
	infodiv = document.getElementById("info");
	setupscr = document.getElementById("setupscr");
	
	var inputs = document.querySelectorAll( '.inputfile' );
	Array.prototype.forEach.call( inputs, function( input )
	{
		var label	 = input.nextElementSibling,
			labelVal = label.innerHTML;

		input.addEventListener( 'change', function( e )
		{
			var fileName = '';
			if( this.files && this.files.length > 1 )
				fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
			else
				fileName = e.target.value.split( '\\' ).pop();

			if( fileName )
				label.querySelector( 'span' ).innerHTML = fileName;
			else
				label.innerHTML = labelVal;
		});
	});
	// set titles
  $(function() {
	for (i = 0 ; i <= maxsongs ; i++) {
  	  var el = "#tn" + i; var s = $(el).val();
	  if (s.length > 0) { var el = "#s" + i; $(el).text(s);}
	}
  });
	
//	urlmusic = $("#player").css("backgroundImage");
//	urlmusic = urlmusic.substring(urlmusic.indexOf('(') + 1, urlmusic.lastIndexOf(')'));
	urlmusic = "media/";
// initiate opening screens
	if (!window.FileReader) {
        $("#s3").text('reader not supported');
        $("#s4").html('<a href="help.htm">clickhere</a>');
    }
	// tells us javscript is working    
	$("#s0").text("WELCOME TO VIEWu"); // 1st item in setlist - replaceed by cached input items

	//// alert(document.URL + " " + screen.availHeight);
    

	// setup action handlers and bindings
	function myAction() { actioned = false; }

	$("#splash").on("change", function() {
		var ix = $("input:radio[name='spl']:checked").val();
		if (ix < 5 ) {
			homescr.style.backgroundImage = "url('splash" + ix + ".jpg')";
			$( "#imgprev" ).attr( 'src' , 'splash' + ix + '.jpg' );	
		}else {
			var fn = document.getElementById('splashfn').value;
			homescr.style.backgroundImage = "url('" + fn + "')";
			$( "#imgprev" ).attr( 'src', fn );
		}
	});
	$("#titlebg").on("change", function() {
		var c = "navy";
		var ix = $("input:radio[name='tbg']:checked").val();
		switch (ix) {
			case "1": c = "navy"; break;
			case "2": c = "#444"; break;
			case "3": c = "black"; break;
		}
		titlescr.style.backgroundColor = c;		
	});
	$("#songbg").on("change", function() {
		var ix = $("input:radio[name='sbg']:checked").val();
		textClass = "txtblack";
		switch (ix) {
			case "1":	textClass = "txtwhite";
						bgClass = "bgblack"; break;
			case "2":	bgClass = "bgiwhite"; break;
			case "3":	bgClass = "bgfabric"; break;
			case "4":	bgClass = "bgtan"; break;
			case "5": 	textClass = "txtwhite";
						bgClass = "bgidark2";
						break;
		}
	});
	$("#gosong").on('change',handleSongSelect );  //binding
  	function handleSongSelect(event) {
    	var files = event.target.files; // FileList object
		if (files.length === 0) { return; }
		var f = files[0];
		var songSrc = f.name;
		if (songSrc.slice(-4) === ".mp4") {
			showVideo("videos/" + songSrc);
			return;
		}
	    var reader = new FileReader();
	    // Closure to load the file information.
	    // occurs after reader.readAsText
	    reader.onload = (function(theFile) {
			return function(e) {
			$( "#lyz").val(e.target.result);	
			var lyrics = $( "#lyz").val();
			changePlayfile(urlmusic + songSrc.substring(songSrc.lastIndexOf('/') + 1, songSrc.lastIndexOf('.')));
			scrSetupSong(lyrics);
			};
      	})(f);
		if (f.type.match('text.*')) {
      		// Read in the text.
    		reader.readAsText(f);
		} 
	}

	$("#image").on('change',handleImageSelect );  //binding
  	function handleImageSelect(event) {
    	var files = event.target.files; // FileList object
		if (files.length === 0) { return; }
		var nextslot = $("#lycount").val();
		if (nextslot < maxsongs){
			var f = files[0];
			var imgSrc = "images/" + f.name;
	    	var sx = "#s" + (nextslot);
			$(sx).text(imgSrc);	
	    	var fn = "#fn" + nextslot;
			$(fn).val(imgSrc);
			nextslot++;
			$("#lycount").val(nextslot);
	     }  		
  	} 	
	$("#prog").on('change',handleProgSelect );  //binding
  	function handleProgSelect(event) {
  	}
	$("#btnreset").on('tap',handleReset );  //binding
  	function handleReset(event) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		nextsong = 0;
  	}
	$("#btnclr").on('tap',handleClearList );  //binding
  	function handleClearList(event) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		nextsong = 0;
		for (var i = maxsongs; i >= 0; i--) {
			var el ="#s" + (i);
			// delete lyrics
			$(el).html("&nbsp;");
		}
		$("#lycount").val(0);
  	}

	
	$("#files").on('change',handleFileSelect );  //binding
  	function handleFileSelect(event) {
    	var files = event.target.files; // FileList object
		if (files.length === 0) { return; }
		var nextslot = $("#lycount").val();
		if (nextslot < maxsongs){
    	var fn = "#fn" + nextslot;
    	var ly = "#ly" + nextslot;
		var f = files[0];
		var songSrc = f.name;
		// filename- no extension
		$(fn).val(urlmusic + songSrc.substring(songSrc.lastIndexOf('/') + 1, songSrc.lastIndexOf('.')));
		// $(fn).val('music/' + songSrc.substring(songSrc.lastIndexOf('/') + 1, songSrc.lastIndexOf('.');));
		
	    var reader = new FileReader();
	    // Closure to load the file information.
	    // occurs after reader.readAsText
	    reader.onload = (function(theFile) {
			return function(e) {
			var nextslot = $("#lycount").val();
			// load lyrics into hidden input
			var ly = "#ly" + nextslot;
			$(ly).val(e.target.result);

			// copy lyrics to array for the moment
			songlines = [];
			var lyrics = $(ly).val();
			var splitexp = /\n/;
			var songlines = lyrics.split(splitexp);

			var sx = "#s" + (nextslot);
			//var tn = "#tn" + (nextslot);
			 // TITLE to setlist - and hidden input (cache)
			if (songlines[0].slice(0,5) == "PLAY:"){
				$(sx).text(songlines[1]	);
				//$(tn).val(songlines[1]);
			}else{			 
				$(sx).text(songlines[0]);
				//$(tn).val(songlines[0]);
			}
			nextslot++
			$("#lycount").val(nextslot);
	        };
      	})(f);
		if (f.type.match('text.*')) {
      		// Read in the text.
    		reader.readAsText(f);
		}
		}
	}
	
	$( '#delete' ).on( 'tap', removeSong );  //binding
	function removeSong(event) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		var nextslot = $("#lycount").val();
		if (nextslot > 0) {
			nextslot--;
			$("#lycount").val(nextslot);
			var el ="#s" + (nextslot);
			// delete lyrics
			$(el).html("&nbsp;");
		}
	}
	
	// display the setlist
	$("#navtop,#btnsetlist,#btnsetlist1" ).on( 'tap', btnSetListHandler );  //binding
	function btnSetListHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		audioPlayer.pause();
		//$("#debug").text($("#mp3src").attr("src"));
		showSetlist();
	}
	function showSetlist() {
		titlescr.style.display = "none";
		homescr.style.display = "none";
		previewscr.style.display = "none";
		setupscr.style.display = "none";
		setlistscr.style.display = "block";
	}

	$( "#setup" ).on('tap', function() {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		setlistscr.style.display = "none";
		setupscr.style.display = "block";
		
	});
	// display the home scr (close all others)
	$("#btnhome,#btnslhome, #btnsuhome" ).on( 'tap', btnHomeHandler );  //binding
	$(titlediv).on( 'tap', btnHomeHandler );
	function btnHomeHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		audioPlayer.pause();
		//$("#debug").text($("#mp3src").attr("src"));
		titlescr.style.display = "none";
		previewscr.style.display = "none";
		setlistscr.style.display = "none";
		setupscr.style.display = "none";
		homescr.style.display = "block";
	}
	
	$( "#arttop" ).on( 'tap', function() {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		listSetupSong();
	});
	$( "#artbot" ).on( 'tap', function() {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		listSetupSong();
		// if play
		playSong();   
	});
	
	$( '.runbtn' ).on( 'tap', scrSetupPlaySong );  //binding
	function scrSetupPlaySong(event) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		nextsong = parseInt(event.target.id.slice(1));		// get the item index (0-39)
		var p = listSetupSong();

		if (p === true) { playSong(); }

	}

	$( '.setlist' ).on( 'tap', setlistTap );  //binding
	function setlistTap(event) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		nextsong = parseInt(event.target.id.slice(1));		// get the item index (0-39)
		listSetupSong();
	}
	function listSetupSong() {
		ix = nextsong++;
		var slot = $("#lycount").val();
	
		if (ix >= slot) {
			if (ix != 0 ) { return; }
		}
		clearPreviews();
		var eid = "#fn" + ix;
		var eidval = $(eid).val();
		if (eidval.slice(0,7) === 'images/') {
			showImage(eidval);
			return false;
		}
		changePlayfile(eidval);
		// get lyrics
		var eid = "#ly" + ix;
		scrSetupSong($(eid).val());
		return true;
	}
	function scrSetupSong(lyrics) {
		if (lyrics.length < 15) { return; }
		var splitexp = /\n/;
		songlines = lyrics.split(splitexp);

		// clear previews, arrays
		for (var i=1; i<10; i++) {
			var ix = "#p" + i;
			$(ix).html(''); // clear the text
			ix = "#v" + i;
			$(ix).html(''); // clear the text
			fxshow[i] = "#"
		}
		scrtimes = []; scrviews = []

		if (songlines[0].slice(0,5) == "PLAY:"){
			titlediv.innerHTML = songlines[1];
			setScrTimes();
			i = 2;
		}else{
			titlediv.innerHTML = songlines[0];
			i = 1;
		}
		scrorder = "";
		if (songlines[i].slice(0,6) == "ORDER:") {
			scrorder = songlines[i].slice(6);
			i++;
		}
		$("#screenorder span:first-child").text(scrorder);
		s = '';
		// get info lines
		var fl = true; // first line
		while (i < songlines.length)  {
			if (songlines[i].length > 0) {
				if (fl) {
					s = songlines[i];
					fl = false;		
				}else{
					s = s + '<br>' + songlines[i];
				}
				i++
			}else{
			break;
			}
		}
		i++; // go past blank line 
		infodiv.innerHTML = s;
		
		// get verses
		versecount = 1 ;  // first preview screen
		//outerloop:
		while (i < songlines.length)  {
		  fl = true; // first line
		  while (i < songlines.length)  {
			if (songlines[i].length > 0) { 
				if (songlines[i].slice(0,3) == "FX:") {
					// don't add this line to verse
					fxshow[versecount] = "$('#v" + versecount + "')." +  songlines[i].slice(3);
				}else{
					if (fl) {
						s = songlines[i];
						fl = false;		
					}else{
						s = s + '<br>' + songlines[i];
					}
				}
				i++;
			}else{
			break; //outerloop;
			}
		  }
		copyTextToScr(s, versecount);
		versecount++;
		if (versecount > 9) { break; }
		
		i++; // go past blank line
		}
		versecount--;
		currentscreen=1; screenorderpos=0;
		if (scrorder.length === 0) { scrorder = "123456789".substr(0,versecount); }
		setlistscr.style.display = "none";
		//document.getElementById("controls").style.display = "block";
		//document.getElementById("btnplay").style.visibility = "visible";
		titlescr.style.display = "block";
	} //.setlist tap handler
	
	// btnpreview on TITLE page
	$( "#btnpreview" ).on( 'tap', btnPreviewHandler );  //binding
	function btnPreviewHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		titlescr.style.display = "none";
		previewscr.style.display = "block";
	}

	$( ".imagediv" ).on( 'tap', imgDivHandler );  //binding
	function imgDivHandler( event ) {
		alert( $(this).parent().get(0).tagName);
	}

	// Verse screen taphold
//	$( blankscr ).on( 'taphold', scrExitHandler );  //binding
	$( ".ol_bot" ).on( 'tap', scrExitHandler );  //binding
//	$( titlescr ).on( 'taphold', scrExitHandler );  //binding
//	$( viewscr ).on( 'taphold', scrExitHandler );  //binding
	function scrExitHandler() {		
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		blankscr.style.display = "none";
		viewscr.style.display = "none";
		titlescr.style.display = "none";
		audioPlayer.pause();
		clearInterval(screenTimer);
		homescr.style.display = "block";
		var tnd = document.createTextNode(" ");
		viewscr.replaceChild(tnd, viewscr.firstChild);
	}
	
//	$( viewscr ).on( 'swipeup', scrPreviewHandler );  //binding
	$( '.ol_top' ).on( 'tap', scrPreviewHandler );  //binding
	function scrPreviewHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		currentscreen = 0;
		viewscr.style.display = "none";
		previewscr.style.display = "block";
	}

//	$( viewscr ).on( 'swiperight', scrFwdHandler );  //binding
	function scrFwdHandler( event ) {
		// this handler ignores screen order and rotates thru screen 0 - swipe is optional operation
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		oldscreen = currentscreen;
		currentscreen++;
		if (currentscreen > versecount) { currentscreen=0; }
		currentScreenShow();
	}
//	$( viewscr ).on( 'swipeleft', scrBackHandler );  //binding
	$( '.ol_left' ).on( 'tap', scrBackHandler );  //binding
	function scrBackHandler( event ) {
		// this handler ignores screen order and rotates thru screen 0 - swipe is optional operation
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		oldscreen = currentscreen;
		currentscreen--;
		if (currentscreen < 0) { currentscreen = versecount; }
		currentScreenShow();
	}

	// preview screen middle button --> show TITLE screen
	$( '.ol_middle' ).on( 'tap', btnPlayPauseHandler );  //binding
	function btnPlayPauseHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		if (audioPlayer.paused) {
			audioPlayer.play();
		}else{
			audioPlayer.pause();
		}
	}

//	$( viewscr ).on( 'tap', scrNextHandler );  //binding
	$( '.ol_right' ).on( 'tap', scrNextHandler );  //binding
//	$( blankscr ).on( 'tap', scrNextHandler );  //binding
	function scrNextHandler( event ) {
		// this handler rotates thru screen order
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);		
		nextOrderScreen();
		currentScreenShow();
	}
	// preview screen middle button --> show TITLE screen
	$( "#btnstartscreen" ).on( 'tap', btnStartHandler );  //binding
	function btnStartHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		audioPlayer.pause();
		previewscr.style.display = "none";
		//document.getElementById("controls").style.display = "block";
		//document.getElementById("btnplay").style.visibility = "visible";
		titlescr.style.display = "block";
	}
	// Blank button
	$( "#btnblankscreen" ).on( 'tap', btnBlankHandler );  //binding
	function btnBlankHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		titlescr.style.display = "none";
		previewscr.style.display = "none";
		blankscr.style.display = "block";
		//	scrorderpos = 0;
		oldscreen = currentscreen;
		currentscreen = 0;
	}
	// View button -- start watching
	$( "#btnshow" ).on( 'tap', btnShowHandler );  //binding
	function btnShowHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		titlescr.style.display = "none";
		previewscr.style.display = "none";
		oldscreen = 0;
		scrorderpos = 0;
		currentscreen = 0;
		currentScreenShow();
	}
	// preview screen
	$( ".preview" ).on( 'tap', scrSelHandler );  //binding
	function scrSelHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		if (currentscreen === undefined) {	currentscreen = 0;	}
		var ix = event.target.id.slice(-1);
		if (ix === "") {
			ix = event.target.parentNode.id.slice(-1);			
			if (ix === "") {return;}
		}
		if (ix > versecount) { return;}
		oldscreen = currentscreen;
		previewscr.style.display = "none";
		currentscreen = ix;
		//screenToggleFX(oldscreen); 
		currentScreenShow();
	}	

	function timerHandler() {
		var tm = audioPlayer.currentTime;
		var ts = tm.toFixed(1);
		if (audioPlayer.ended) {
			clearInterval(screenTimer);
			viewScreensHide();
			homescr.style.display = "block";
		}else{
			if (scrtimes.length > scrtimespos) {
				if ((scrtimes[scrtimespos] > 0) && (tm >= scrtimes[scrtimespos])){
					oldscreen = currentscreen;
			   		currentscreen = parseInt(scrviews.charAt(scrtimespos));		
			   		scrtimespos++;
					currentScreenShow();
			   	//	screenToggleFX(oldscreen)
			   	}
			}
		}
	}

	$( "#btnplay" ).on( 'tap', btnPlayHandler );  //binding
	function btnPlayHandler( event ) {
		if (actioned) { return; }
		actioned = true; clickTimer = setTimeout(myAction, 600);
		playSong();
	}
	function playSong() {	
		// DO NOTHING IF CANNOT LOAD
		playerwait = 0;
		canstartTimer = setInterval(startHandler, 50);
	}
	function startHandler () { 
		playerwait++
		if (audioPlayer.readyState > 0) {
			firstScreenShow();
			audioPlayer.play();
			clearInterval(canstartTimer);
			screenTimer = setInterval(timerHandler, 100);					
		}else {
			// stop trying to start after 1sec
			if (playerwait > 20) {clearInterval(canstartTimer);}
		}
	} 
	function firstScreenShow() {
		// started from runbtn or play button (setlist)
		currentscreen = -1;
		oldscreen = 0;
		scrtimespos = 0;
		setlistscr.style.display = "none";
		//document.getElementById("controls").style.display = "none";
		titlescr.style.display = "block"; // depends on setting (to be done)
	}
	// update currentscreen
	function nextOrderScreen(){
		if (scrorder.length > 0) {
			oldscreen = currentscreen;
			currentscreen = parseInt(scrorder.charAt(screenorderpos));
			screenorderpos++;
			if (screenorderpos >= scrorder.length){ screenorderpos=0 }
		}	
	}

	function viewScreensHide(){
		// may need to hide blank
		viewscr.style.display = "none";
		blankscr.style.display = "none";
	}
	
	function currentScreenShow(){
		// if title showing
		if (currentscreen === -1) {
			titlescr.style.display = "block"; // depends on setting (to be done)
			return;
		}
		titlescr.style.display = "none";
		if (currentscreen === 0) {
			viewscr.style.display = "none";
			blankscr.style.display = "block";
		} else {
			var idx = "id-sd" + currentscreen;
			var cln = document.getElementById(idx)
			clnscr = cln.cloneNode(true);
			clnscr.id = "viewdiv";
			viewscr.replaceChild(clnscr, viewscr.firstChild);
			//viewscr.innerHTML = clnscr.outerHTML + blankscr.innerHTML;
			blankscr.style.display = "none";
			viewscr.style.display = "block";
		}
	}
	
	function nextScreenShow(){
		oldscreen = currentscreen;
		currentscreen++;
	  	if (currentscreen > versecount) { currentscreen = 0; }
		currentScreenShow;
	}

	// oldscreen=currentscreen; nextOrderScreen; screenToggleFX(oldscreen)
	// oldscreen=currentscreen; nextPlayScreen; screenToggleFX(oldscreen)
/*	function screenToggleFX(oldscreen){
		var scrindex = "#v" + oldscreen
		if ((currentscreen > 0) && (fxshow[currentscreen] != "#")) {
			$(scrindex).fadeOut()
			$(scrindex).css("display","none")
			eval(fxshow[currentscreen])
		}else{
			$(scrindex).css("display","none")
			var scrindex = "#v" + currentscreen			
			$(scrindex).css("display","block")
		}
	}
*/
	function showImage(url) {
		//clearPreviews(); done
		var fdiv = document.createElement('DIV');
		fdiv.style.backgroundImage = "url('" + url + "')";
		fdiv.style.backgroundSize="100% 100%"
		fdiv.id = "id-sd1";
		document.querySelector("#p1").appendChild(fdiv);
		currentscreen = 1;
		setlistscr.style.display = "none";
		currentScreenShow();
	}	
	function showVideo (fn) {
	  //<video width="400" controls>
	  //<source src="mov_bbb.mp4" type="video/mp4">
	  //</video>
		var fragment = document.createDocumentFragment();
		var vid = document.createElement('VIDEO');
		vid.id = "viewdiv";
		vid.setAttribute("width","100%");
		vid.setAttribute("height","100%");
		vid.src = fn;
		//vid.setAttribute("preload","metadata");
		//vid.setAttribute("controls","true");
		//vid.setAttribute("type", "video/mp4");
		vid.autoplay = true;
		viewscr.style.display = "block";
		//document.getElementById('viewcontrols').style.display = "none";
		fragment.appendChild(vid);
		viewscr.replaceChild(fragment, viewscr.firstChild);
		titlescr.style.display = "none";
		previewscr.style.display = "none";
	}
//------------ COPY TEXT TO SCR -------------------------------------
	function copyTextToScr(text, scr){
		var cmd = false;  var img = false; var music = false;
		var s = "";
		var sUrl = "#"; // "#" or filename backgndFN;
		var sColor = "";
		var scls = "";  // string class
		var cs = "";
		
		var fdiv = document.createElement('DIV');
		fdiv.id = "id-sd" + scr;
		var fp = document.createElement('P');// place all text into span element and wrap in a div
		  fp.id = "id-ss" + scr;
		  fdiv.appendChild(fp);
		var ix = text.indexOf('<br>'); // -1 if only command line
		if (ix == -1 ) { s = text;
		}else{ 	s = text.substring(0, ix) ; // (no '<br>')
		}
		// combine classes and Image file (use '#' where no file)
		// span font height and width classes must be included
		// format eg. CI:divclass1 divclass2,spanclass1 spanclass2,# (note commas) 
		if (s.substr(0,3) === 'CI:') {
		  cs = s.substr(3).split(",");
		  fdiv.className = cs[0];
		  fp.className = cs[1];
		  sUrl = cs[2];
			cmd = true;
		}
		// Loop Forever -- if filename supplied, load a media file.
		if (s.substr(0,3) === 'LF:') {
			var fname ="media/" + s.substr(3);  	    //filename or '' or '#'
			changePlayfile(fname);
			cmd = true;
		}
		if (s.substr(0,3) === 'TL:') {
		  fdiv.className = bgClass + " midcenter ";
		  fp.className = fontheightClass + " " + fontwidthClass + " " + textClass + " txtleft";
			cmd = true;
		}
		// combine color and Image file (use '#' where no file)
		// format FB:color #  (no comma -- special 'notext') 
		if (s.substr(0,3) === 'FB:') { 
		  cs = s.substr(3).split(" "); // color imagefile
		  fdiv.className = "bgimage midcenter";
		  fp.className = fontheightClass + " " + fontwidthClass + " txtcenter"; // includes color padding and align
		  var css = cs[0];
		  if (css.substr(0,1) === ".") {
			fp.className += " " + (css.substr(1));
		  }else{   
			if (cs[0]==="notext") {
			  fp.style.visibility="hidden";
			}else{
			  fp.style.color=cs[0];   
			}
		  }
		  sUrl = cs[1];
			cmd = true;
		}

		if (!cmd) { // default color centering
		  fdiv.className = bgClass + " midcenter ";
		  fp.className = fontheightClass + " " + fontwidthClass + " " + textClass + " txtcenter"; // includes color padding and align
			s = text ;
		}
		
		if (cmd) {
			if (ix > 0) {
			  s = text.substring(ix + 4); // go past <br>
			} else {
			  s = ""; // ix=-1, no more text
			}
		}
		fp.innerHTML = s;  
	  
		if (sUrl !== "#") { // || sUrl !== "") { 	// get the file URL Data
		  fdiv.style.backgroundImage = "url('" + sUrl + "')";
		}
		// add to preview table
		document.querySelector("#p" + scr).appendChild(fdiv);
	}
	clearPreviews = function(){
		for (var i = 1; i < 10; i++) {
			var parent = document.getElementById("p" + i);
			var child = document.getElementById("id-sd" + i);
			if (child !== null) { parent.removeChild(child);}
		  //$("#id-ptd" + i).empty();
		}
	}
//---------------------------------------------------------------	
	function changePlayfile(srcUrl){
		//$("#btnplay").css("display","none");
		$("#mp3src").attr('src',srcUrl + '.mp3');
		$("#list").text(srcUrl);
		audioPlayer.load();
	}

	function audioFileLoaded() {
		console.log("audioFileLoaded")
	}	
	
	function setScrTimes(){ // return msec
		var tl = [], s = []
		tl = songlines[0].substring(5).split('#');
		for (var i=0; i < tl.length ; i++) {
			s = tl[i].split('s')
			scrtimes.push(Number(s[0]));
			scrviews += String(s[1]);
 		}
 		tl = [];
 		//alert(scrviews)
	}
	
});
		
