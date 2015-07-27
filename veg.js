var c2 =[];
function previewLocation(c1, p) {

  if (vegEdge) vegEdge.classed("vegEdge", false);
  
  c2 =[rightCell(c1),leftCell(c1),topCell(c1),bottomCell(c1),
  topLeftCell(c1),topRightCell(c1),bottomLeftCell(c1),bottomRightCell(c1)];
  
  c2.forEach(function(d) {
	   if (d.isWall) { vegEdge = null; }
	   else { vegEdge = d.elnt; }
  if (vegEdge) vegEdge.classed("vegEdge", function(d) { return !d.isWall; });
  })
}


var vegEdge;

var vegetate = function() {
	
	if (verbose) { console.log('vegetate'); }

	document.getElementById("plant").disabled = true;
	document.getElementById("noplant").disabled = false;

svg.selectAll(".field")
  .on("mouseover", function(c1) {
    d3.select(this).classed("vegCenter", true);
    var p = d3.mouse(this);
    previewLocation(c1, p);
    
    d3.selectAll(".vegEdge")
    .attr('fill', function(d,i) {colors[i] = greens(d.veg+1); return colors[i]; });
    
    d3.selectAll(".vegCenter")
    .attr('fill', function(d,i) {colors[i] = greens(d.veg+2); return colors[i]; });
    
  })
  
  .on("mouseout", function() {
    d3.selectAll(".vegEdge").classed("vegEdge", false)
    .attr('fill', function(d,i) {
    if (d.veg == 0) {colors[i] = browns(d.z);}
    else {colors[i] = greens(d.veg)} return colors[i]; })
    d3.selectAll(".vegCenter").classed("vegCenter", false)
    .attr('fill', function(d,i) {
    if (d.veg == 0) {colors[i] = browns(d.z);}
    else {colors[i] = greens(d.veg)} return colors[i]; })
  })
  
  	.on("mousedown", function(c1) {

    d3.selectAll(".vegCenter").classed("vegged", true).classed("vegCenter", false).each(function(d) { d.veg = d.veg + 2;});
    d3.selectAll(".vegEdge").classed("vegged", true).classed("vegEdge", false).each(function(d) { d.veg++;});
    d3.selectAll(".vegged")
    .attr('fill', function(d,i) { colors[i] = greens(d.veg); return colors[i]; });
  })
  
  
};
// 
// 
// 
// var vegetate = function() {
// 	
// 	if (verbose) { console.log('vegetate'); }
// 
// 	document.getElementById("plant").disabled = true;
// 	document.getElementById("noplant").disabled = false;
// 
// 	var nearby = [];
// 
// 	svg.selectAll("path")
// 	.on("mouseover", function(d, i) {
//   
// 		nearby = []
// 		svg.selectAll(".detectable").each(function () {
// 			if (neighboring(i, this.id) | neighboring(this.id,i)){
// 				nearby.push(this.id);
// 			}
// 		})
// 				
// 		for (var j = 0; j<nearby.length; j++){
// 			svg.select('path#path-'+nearby[j])
// 			.style('fill', function(d,i) {return greens(pts[nearby[j]].veg+1)});
// 		}})  
// 
// 		 
// 	.on("mousedown", function(d,i) {
// 	
// 		for (var j = 0; j<nearby.length; j++){
// 			pts[nearby[j]].veg++;
// 			colors[nearby[j]] = greens(pts[nearby[j]].veg)
// 		}
// 		path.style("fill", function(d, i) { return colors[i] });
// 	})
// 
// 
// 	.on("mouseout", function(d, i) {
// 	  path.style("fill", function(d, i) { return colors[i] }); 
// 	});
// 
// 
// 	var linkedByIndex = {};
// 	
// 	for (i = 0; i < pts.length; i++) { linkedByIndex[i + "," + i] = 1; }
// 	
// 	d3_geom_voronoi.links(pts).forEach(function (d) {
// 		linkedByIndex[d.source.k + "," + d.target.k] = 1;
// 		
// 	});
// 
// 
// 	function neighboring(a, b) { return linkedByIndex[a + "," + b]; }
//         
// }
// 
// 
// 
// // var stopVeg = function() {
// // 	
// // 	if (verbose) { console.log('stopVeg'); }
// // 	
// // 	document.getElementById("plant").value = "Click to plant more vegetation";
// // 	document.getElementById("plant").onclick = function() {vegetate();};
// // 
// // 	svg.selectAll("path")
// // 	.on("click", function(d, i) {if (pts[i].veg>3) { pts[i].veg = 3;}})
// // 
// // }
// // 
// 
// var resetVeg = function() {
// 
// 	if (verbose) { console.log('resetVeg'); }
// 
// 	for (var i=0; i<pts.length; i++){ pts[i].veg = 0; }
// 
// 	document.getElementById("plant").value = "Click to plant vegetation";
// 	document.getElementById("plant").onclick = function() {vegetate();};
// 	document.getElementById("noplant").disabled = true;
// 	document.getElementById("plant").disabled = false;
// 
// 	svg.selectAll("path").on("click", function(d, i) {})
// 
// 	draw_initial();
// 
// }