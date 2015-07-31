function Decrement() {

	strTime = '  Time = ';
	strTime = strTime.concat((5*sl*dt).toFixed(2).toString());
	strTime = strTime.concat(' seconds');
	document.getElementById("counter").innerHTML = strTime;
	
	// upper
	svg.selectAll(".cell").transition()
	.duration(100)
	   .style("fill", function(d, j) { return shots.slice(sl,sl+1)[0][j] })
	   .style("stroke", function(d, j) { return shots.slice(sl,sl+1)[0][j] });

	svg2.selectAll(".cell").transition()
	.duration(100)
	   .style("fill", function(d, j) { return sedColors(topo.slice(sl,sl+1)[0][j]) })
	   .style("stroke", function(d, j) { return sedColors(topo.slice(sl,sl+1)[0][j]) });

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
    document.getElementById("plant").disabled = true;
    
}

function pause() { 

    clearTimeout(tv);
    tv=0;
    document.getElementById("playvideo").disabled = false;
    document.getElementById("stopvideo").disabled = true;
    document.getElementById("slower").disabled = true;
    document.getElementById("faster").disabled = true;
    
}


function slower() { vid_dt = vid_dt + 20; }
function faster() { vid_dt = d3.max([vid_dt - 20,0]); }

