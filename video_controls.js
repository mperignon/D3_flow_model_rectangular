function Decrement() {

	console.log('time = ', (sl*dt).toFixed(2))
	
	// upper
	path.transition()
	   .duration(1)
	   .style("fill", function(d, j) { return shots.slice(sl,sl+1)[0][j] });
	   
// 	path_l.transition()
// 	   .duration(100)
// 	   .style("fill", function(d, j) { return sedColors(topo.slice(sl,sl+1)[0][j]) });

	sl++;
	if (sl==shots.length){sl = 0;}
 
    tv= setTimeout('Decrement()',vid_dt);
    
}

function play() {

    tv = setTimeout('Decrement()',vid_dt);
    document.getElementById("playvideo").disabled = true;
    document.getElementById("stopvideo").disabled = false;
    document.getElementById("slower").disabled = false;
    document.getElementById("faster").disabled = false;
    
}

function pause() { 

    clearTimeout(tv);
    tv=0;
    document.getElementById("playvideo").disabled = false;
    document.getElementById("stopvideo").disabled = true;
    document.getElementById("slower").disabled = true;
    document.getElementById("faster").disabled = true;
    
}


function slower() { vid_dt = vid_dt + 200; }
function faster() { vid_dt = vid_dt - 200; }

