var vegetate = function() {
	
	if (verbose) { console.log('vegetate'); }

	document.getElementById("plant").value = "Stop planting";
	document.getElementById("plant").onclick = function() {stopVeg();};
	document.getElementById("noplant").disabled = false;

	var nearby = [];

	svg.selectAll("path")
	.on("mouseover", function(d, i) {
  
		nearby = []
		svg.selectAll(".detectable").each(function () {
			if (neighboring(i, this.id) | neighboring(this.id,i)){
				nearby.push(this.id);
			}
		})
				
		for (var j = 0; j<nearby.length; j++){
			svg.select('path#path-'+nearby[j])
			.style('fill', function(d,i) {return greens(pts[nearby[j]].veg+1)});
		}})  

		 
	.on("mousedown", function(d,i) {

		for (var j = 0; j<nearby.length; j++){
			pts[nearby[j]].veg++;
			colors[nearby[j]] = greens(pts[nearby[j]].veg)
			
			console.log(pts[nearby[j]])
		}
		console.log('------------')
		path.style("fill", function(d, i) { return colors[i] });
	})


	.on("mouseout", function(d, i) {
	  path.style("fill", function(d, i) { return colors[i] }); 
	});


	var linkedByIndex = {};
	
	for (i = 0; i < pts.length; i++) { linkedByIndex[i + "," + i] = 1; }
	
	d3_geom_voronoi.links(pts).forEach(function (d) {
		linkedByIndex[d.source.k + "," + d.target.k] = 1;
	});


	function neighboring(a, b) { return linkedByIndex[a + "," + b]; }
        
}



var stopVeg = function() {
	
	if (verbose) { console.log('stopVeg'); }
	
	document.getElementById("plant").value = "Click to plant more vegetation";
	document.getElementById("plant").onclick = function() {vegetate();};

	svg.selectAll("path")
	.on("click", function(d, i) {if (pts[i].veg>3) { pts[i].veg = 3;}})

}


var resetVeg = function() {

	if (verbose) { console.log('resetVeg'); }

	for (var i=0; i<pts.length; i++){ pts[i].veg = 0; }

	document.getElementById("plant").value = "Click to plant vegetation";
	document.getElementById("plant").onclick = function() {vegetate();};
	document.getElementById("noplant").disabled = true;

	svg.selectAll("path").on("click", function(d, i) {})

	draw_initial();

}