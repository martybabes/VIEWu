	// globals
	var filename = "media/viewu";
  var urlmusic = "media/";
	var songlines = new Array();
	var fxshow = new Array("#","#","#","#","#","#","#","#","#","#","#","#");
	var timeslength = 30; // array length
	var timescount = 0; // how many time positions
	var timespos = 0; // current timing array position being watched
	var scrtimes = new Array(); scrtimes.length = timeslength; // secs - 0.0
	var scrviews = new Array(); scrviews.length = timeslength;// numbers 0-9
	var scrorder = "";  // empty or 'vvvvvv' v=0-9 (0==blank)
	var currentscreen = 0; // current screen showing (0==blank)
	var versecount = 9; // number of screens

	var timestarted = new Date('0:00:0'); // audioplayer start time
	var timerId = 0;

	var tm = new Date(); // click timer
	var lasttime = new Date(); // click timer
	var lastevent = new Object();
// arr = []; clears array
// arr.length - #items in the array

$(function() {
	// tells us javscript is working    
	$("#p1").html("VIEWu Timing Creator<br>Click preview buttons above<br>for instructions."); // 1st item in setlist

	var player = document.getElementById("audioplayer");
	resetTimes();
	resetScrTimes();
	
	// alert(document.URL + " " + screen.availHeight);

	// setup action handlers and bindings

	$("#files").on('change',handleFileSelect );  //binding
  	function handleFileSelect(event) {
		if (true) { // dropped maxsongs and nextslot
    	var files = event.target.files; // FileList object
		var f = files[0];

		var songSrc = f.name;
		// no extension
		filename = urlmusic + songSrc.substring(songSrc.lastIndexOf('/') + 1, songSrc.lastIndexOf('.'));
		
	    var reader = new FileReader();
	    // Closure to load the file information.
	    // occurs after reader.readAsText
	    reader.onload = (function(theFile) {
			return function(e) {
			$("#ly0").val(e.target.result);
			scrSetupSong()
	        };
      	})(f);

		if (f.type.match('text.*')) {
      		// Read in the text.
    		reader.readAsText(f);		
		}
		}
	}

	$( '.setlist' ).on( 'tap', scrSetupSong );  //binding
	function scrSetupSong(event) {
		var d = Date.now()
		tm.setTime(d);
		if (tm - lasttime > 600) {
			ix = 0;

			changePlayfile(filename);
			var lyrics = $("#ly0").val();
			if (lyrics.length < 15) { return; }

			var splitexp = /\n/;
			songlines = lyrics.split(splitexp);

			// clear previews, arrays
			for (var i=1; i<10; i++) {
			  var ix = "#p" + i;
			  $(ix).html(''); // clear the text
			  ix = "#fx" + i;
			  $(ix).val('#'); // FX
			}
			// clear timings/order
			$("#timings").val(0);
			$("#scrorder").val("");
			resetTimes();
			resetScrTimes();
			
			if (songlines[0].slice(0,5) == "PLAY:"){
				$("#title").text(songlines[1]);
				$("#timings").text(songlines[0]);
				setScrTimes(songlines[0].substring(5)); // move past PLAY:
				i = 2
			}else{
				$("#title").text(songlines[0]);
				i = 1
			} //we don't want this order
			if (songlines[i].slice(0,6) == "ORDER:") { i++ }	

			// get info lines
			s = '';
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
			//$("#info").html(s);
			
			// get verses
			versecount = 1 ;  // first preview screen
			//outerloop:
			while (i < songlines.length)  {
		  	  fl = true; // first line
			  while (i < songlines.length)  {
				if (songlines[i].length > 0) { 
					if (songlines[i].slice(0,3) == "FX:") {
						// don't add this line to verse
						$('#fx' + versecount).val("$('#p" + versecount + "')." +  songlines[i].slice(3));
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
			copyTextToScr(s, versecount)
		  	versecount++
		  	if (versecount > 9) {
		  		break;
		  	}
	  	i++; // go past blank line
	  	}
		versecount--
		currentscreen=0; screenorderpos=-1;
		changeScreen(0);
 		lasttime.setTime(d);
 		}
	} //.setlist tap handler

	// preview screen
	$( ".ui-btn" ).on( 'tap', scrShowHandler );  //binding
	function scrShowHandler( event ) {
		var d = Date.now()
		tm.setTime(d);
		if (tm - lasttime > 600) {
			tid = event.target.id.charAt(1);
			changeScreen(tid);
			lasttime.setTime(d);
		}
	}	

	function timerHandler() {
		var tm = player.currentTime
		var ts = tm.toFixed(1);
		if (player.ended) {
			clearInterval(timerId);
			ts = "End";
		}else{ CheckNextScreen(tm);
		}
		$("#curpos").text(ts);
	}

	function changeScreen( scr ) {
		var scrindex = "#p" + scr;
		// hide all preview screens
		$(".preview").css("display","none");
		var fx = "#fx" + scr
		fx = $(fx).val(); 
		if ( fx != "#") {
			eval(fx)
		}else{
			$(scrindex).css("display","flex") 
		}
	}

	function CheckNextScreen( tm ){
		// timescount cannot be greater than scrorder.length 
		if (timespos >= timescount) { return; } // can't go any further
		if (scrtimes[timespos] == 0) { return; } // can't go any further

		if (tm >= scrtimes[timespos]) {
			// get the next screen
			changeScreen(scrviews[timespos])
			timespos++
			nextNumber();
		}
	}

	$( "#btnplay" ).on( 'tap', btnPlayHandler );  //binding
	function btnPlayHandler( event ) {
		var d = Date.now()
		tm.setTime(d)
		if ((tm - lasttime) > 600) {
		//----- real stuff here
			if (scrorder.length <= timespos) {
			//	$("#poporder").click(); // must have screens to add times against
			}else{
				timerId = setInterval(timerHandler, 100);
				if (player.currentTime == 0) {
					currentscreen = 0;
					timespos = 0
				}
				nextNumber();
				player.play();
			}
		//-------done
			lasttime.setTime(d);
		}
	} 

	$( "#btnpause" ).on( 'tap', btnPauseHandler );  //binding
	function btnPauseHandler( event ) {
		var d = Date.now()
		tm.setTime(d)
		if ((tm - lasttime) > 600) {
			player.pause();
			lasttime.setTime(d);
		}
	}

//------------ COPY TEXT TO SCR -------------------------------------
	function copyTextToScr(text, scr){
		var ix = text.indexOf('<br>'); // -1 if only command line
		var cmd = true;
		
		if (ix == -1 ) {
			s = text.substring(3)
		}else{
			s = text.substring(3, ix) // BG:[..returns this bit..]<br>
		}
		
		// the following saves having to reset defaults
		switch(text.substr(0,3))
		{
		case 'FB:':
			s = '<div id="#' + scr + '" class="bg" '
			 + 'style="background-image:url(\'' + s.substring(s.indexOf(" ") + 1)
			 + '\');  color:' + s.substring(0,s.indexOf(" ")) + '">';
			break;

		case 'CI:':
			//<div class="bc" style="background-image:url(' + "'images/LookUp.jpg'" +')">
			s = '<div id="#' + scr + '" class="b' + s.substring(0,s.indexOf(" ")) + '" '
			  + 'style="background-image:url(\'' + s.substring(s.indexOf(" ") + 1) + '\');">'
			break;

		default:
			cmd = false;
			s = text;
		}
		if (cmd == true) {
			if (ix > 0) { s = s + text.substring(ix + 4) }
			s = s + '</div>'
		}
		
		var scrid = "#p" + scr; // preview
		$(scrid).html(s);
		//scrid = "#v" + scr; // VIEW
		//$(scrid).html(s);	
	}
	

//-------------LOAD FILE-------------------------------	
	function changePlayfile(srcUrl){
		$("#mp3src").attr('src',srcUrl + '.mp3');
		$("#oggsrc").attr('src',srcUrl + '.ogg');
		var s = $("#player").html();
		player.load();
	}

	// Load Play Timings
	function setScrTimes(line){ // return msec
		var tl = [], s = [];
		scrorder = "";
		if (line.length) {
			tl = line.split('#');
			timescount = tl.length-1; 
			for (var i=0; i < timescount; i++) {
				s = tl[i].split('s');
				scrtimes[i] = Number(s[0]);
				scrviews[i] = Number(s[1]); // play timings is the standard for screen order
				scrorder = scrorder + s[1];
				$( ".tdt" )[i].innerText = itemToString(i); // editor only				
	 		}
		}
		$("#scrorder").val(scrorder);//editor only
	}

	function resetTimes() {
		timescount = 0; 
		for (var i=0; i < timeslength ; i++) {
			scrtimes[i] = 0; // nothing happens at time = 0.0
			scrviews[i] = 0;
		}
	}
	function resetScrTimes() {
		for (var i=0; i < timeslength ; i++) {
			$( ".tdt" )[i].innerText = "s"; // editor only				
		}
	}

	// show upcoming screen number
	function nextNumber() {
		if (timespos < timescount) {
			$("#next").text(scrviews[timespos])
		}else{	
			$("#next").text("?")
		}
	}
//-------EDIT SCREENS/TIMES -----------------------	

	function itemToString(ix) { // return timing/scr item as string
		var ti = "0";
		if  (scrtimes[ix] > 0) { ti = scrtimes[ix].toFixed(1) }
		return ti + "s" + scrviews[ix];
	}

	function itemsToLine() { // return timings string
		var ts = "";
		for (var i=0; i < timescount; i++) {
			ts = ts + itemToString(i) + "#";
		}
		return ts;
	}

	$( "#scrorder" ).on( 'blur', scrorderBlur );  //binding
	function scrorderBlur ( event ) {
		scrorder = $("#scrorder").val()
		timescount = scrorder.length;
		timespos = Math.min(timespos, timescount-1);
		player.currentTime = scrtimes[timespos]
		for (var i = 0; i < scrorder.length; i++) {
			scrviews[i] = scrorder.substr(i,1)
		}
		var scrline = itemsToLine();
		resetTimes();
		resetScrTimes();
		setScrTimes(scrline);
	}

	// add a time
	$( "#btnnow" ).on( 'tap', timeAddHandler );  //binding
	function timeAddHandler( event ) {
		var d = Date.now()
		tm.setTime(d);
		if (tm - lasttime > 600) {
		//----	
			if 	(player.ended) {  //alert("Audio ended")
				$("#popnow").click(); return }
			var thistime = (player.currentTime).toFixed(1);
			if (thistime == 0) { return; }
			if (timespos >= timescount) { 
			//	$("#poporder").click();				
				return; 
			}
			// add time
			scrtimes[timespos] = Number(thistime);
			currentscreen = scrviews[timespos];
			$( ".tdt" )[timespos].innerText = itemToString(timespos);
			changeScreen(scrviews[timespos])

			timespos++;
			// show upcoming screen number
			nextNumber();
		//	CheckNextScreen(thistime)
		//----
			lasttime.setTime(d);
		}
	}

	$( ".tdt" ).on( 'tap', tdTap );  //binding
	function tdTap ( event ) {
		lastevent = event.target;
		// only open if "t.dsN" (not "0sN")
		if (lastevent.innerText.length > 3) {
			btnPauseHandler(event)
			getEditTime ( event )
			$( "#edtime" ).show();
		}	
	}
	
	function getEditTime ( event ) {	
		var tt = lastevent.innerText; //get <td> to update
		$("#edittime").val(tt.split("s")[0]) 
	}

	$( "#btndel" ).on( 'tap', btnDelHandler );  //binding
	function btnDelHandler( event ) {
		var d = Date.now()
		tm.setTime(d);
		if (tm - lasttime > 600) {
		//----
			--timespos;
			if (timespos == -1) { 
				currentscreen = 0;
				timespos = 0
			}else {
				currentscreen = scrviews[timespos - 1];
				scrtimes[timespos] = 0;
				$( ".tdt" )[timespos].innerText = itemToString(timespos);
			}
			changeScreen(currentscreen);
		//----
			lasttime.setTime(d);
		}
	}

	$( "#btntmupdate" ).on( 'tap', updateTime );  //binding
	function updateTime ( event ) {
		var tt = Number($("#edittime").val());    // get updated time
		$("#edtime").hide();
		if (! isNaN(tt)) {
			var ix = parseInt(lastevent.id.slice(1)) - 1;
			scrtimes[ix] = tt;
			var tl = lastevent.innerText.split("s")[1];  // get <td> to update
			var txt = tt.toFixed(1) + "s" + tl
			lastevent.innerText = txt;//update the tables time
		}
	}
	
	$( "#btnfwd" ).on( 'tap', btnFwdHandler );  //binding
	function btnFwdHandler( event ) {
		var tm = player.currentTime + 10;
		player.currentTime = tm;
		timespos--;
	}
	$( "#btnback" ).on( 'tap', btnBackHandler );  //binding
	function btnBackHandler( event ) {
		var tm = Math.max(0, player.currentTime - 10);
		player.currentTime = tm;
		timespos = 0;
	}	
	$( "#btntimings" ).on( 'tap', btnTimesToLineHandler );  //binding
	function btnTimesToLineHandler( event ) {
		var tl = itemsToLine();
		$('#timings').val("PLAY:" + tl).select();
		
	}	

});  // END
