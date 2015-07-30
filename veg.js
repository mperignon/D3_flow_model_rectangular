var c2 =[];
function previewLocation(c1) {

  if (vegEdge) vegEdge.classed("vegEdge", false);
  
  c2 =[rightCell(c1),leftCell(c1),topCell(c1),bottomCell(c1),
  topLeftCell(c1),topRightCell(c1),bottomLeftCell(c1),bottomRightCell(c1)];
  
  c2.forEach(function(d) {
	   if (d.isWall) { vegEdge = null; }
	   else { vegEdge = d.elnt; }
  if (vegEdge) {
  vegEdge.classed("vegEdge", true) //function(d) { return !d.isWall; });
  }
  
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
    previewLocation(c1);
    
    svg.selectAll(".vegEdge")
    .attr('fill', function(d,i) {colors[i] = greens(d.veg+1); return colors[i]; });
    
    svg.selectAll(".vegCenter")
    .attr('fill', function(d,i) {colors[i] = greens(d.veg+2); return colors[i]; });
    
  })
  
  .on("mouseout", function() {
    svg.selectAll(".vegEdge").classed("vegEdge", false)
    .attr('fill', function(d,i) {
    if (d.veg == 0) {colors[i] = browns(d.z);}
    else {colors[i] = greens(d.veg)} return colors[i]; })
   svg.selectAll(".vegCenter").classed("vegCenter", false)
    .attr('fill', function(d,i) {
    if (d.veg == 0) {colors[i] = browns(d.z);}
    else {colors[i] = greens(d.veg)} return colors[i]; })
  })
  
  	.on("mousedown", function(c1) {

    svg.selectAll(".vegCenter").each(function(d) { return d.veg = d.veg + 2;}).classed("vegged", true).classed("vegCenter", false);
    svg.selectAll(".vegEdge").each(function(d) { return d.veg = d.veg + 1;}).classed("vegged", true).classed("vegEdge", false);
    svg.selectAll(".vegged")
    .attr('fill', function(d,i) { colors[i] = greens(d.veg); return colors[i]; });
  })
  
  
};


var resetVeg = function() {

	if (verbose) { console.log('resetVeg'); }

	svg.selectAll(".vegged").classed("vegged", false).each(function(d) { d.veg = 0;})
	.attr('fill', function(d,i) { colors[i]=browns(d.z); return colors[i]});

	document.getElementById("plant").value = "Click to plant vegetation";
	document.getElementById("plant").onclick = function() {vegetate();};
	document.getElementById("noplant").disabled = true;
	document.getElementById("plant").disabled = false;

}