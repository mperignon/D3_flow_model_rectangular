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


var resetVeg = function() {

	if (verbose) { console.log('resetVeg'); }

	d3.selectAll(".vegged").classed("vegged", false).each(function(d) { d.veg = 0;})
	.attr('fill', function(d,i) { colors[i]=browns(d.z); return colors[i]});

	document.getElementById("plant").value = "Click to plant vegetation";
	document.getElementById("plant").onclick = function() {vegetate();};
	document.getElementById("noplant").disabled = true;
	document.getElementById("plant").disabled = false;

	svg.selectAll("path").on("click", function(d, i) {})

}