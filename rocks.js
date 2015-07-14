var placeRocks = function() {
	
	if (verbose) { console.log('place rocks'); }

	document.getElementById("rock").disabled = true;
	document.getElementById("norock").disabled = false;

	var nearby = [];

	svg.selectAll("path")
	.on("mouseover", function(d, i) {
  
		nearby = []
		svg.selectAll(".detectable").each(function () {
			nearby.push(i);
		})
				
		for (var j = 0; j<nearby.length; j++){
			svg.select('path#path-'+nearby[j])
			.style('fill', function(d,i) {return "#404040"});
		}})  

		 
	.on("mousedown", function(d,i) {

		for (var j = 0; j<nearby.length; j++){
			colors[nearby[j]] = "#808080"
			pts[i].rocks = 1;
			console.log(pts[nearby[j]])
		}
		console.log('------------')
		path.style("fill", function(d, i) { return colors[i] });
	})


	.on("mouseout", function(d, i) {
	  path.style("fill", function(d, i) { return colors[i] }); 
	});

        
}


var resetRocks = function() {

	if (verbose) { console.log('resetRocks'); }

	for (var i=0; i<pts.length; i++){ pts[i].rocks = 0; }

	document.getElementById("rock").onclick = function() {placeRocks();};
	document.getElementById("norock").disabled = true;
	document.getElementById("rock").disabled = false;

	svg.selectAll("path").on("click", function(d, i) {})

	draw_initial();

}