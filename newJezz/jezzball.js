// d3.selection.prototype.size = function() {
//     var n = 0;
//     this.each(function() { ++n; });
//     return n;
//   };

var w = 960,
    h = 500,
    sz = 20,
    r = sz / 2,
    sr = r * r,
    ssz = sz * sz,
    t = 5000
    S = 0.001;

var browns = d3.scale.linear().domain([0,0.5])
.range(["#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);
var greens = d3.scale.quantize().domain([1,3]).range(["#addd8e","#41ab5d","#006837"])
var alpha = [0, 0.04, 0.4, 1];

var rows = Math.ceil(h / sz);
var cols = Math.ceil(w / sz);

var pts = d3.range(0, rows * cols).map(function (d) {
  var col = d % cols;
  var row = (d - col) / cols;
  
  var x_ = col * sz + r;
  var y_ = row * sz + r;
  var z_ = (w - x_) * S + (y_ - rows/2 * sz)*(y_ - rows/2 * sz) / 20000 - w*S;
  
  return {
    r: row,
    c: col,
    x: x_,
    y: y_,
    z: z_,
    veg: 0
  };
});

var colors = pts.map( function (d) { return browns(d.z) });



var svg = d3.select("body").append("svg")
    .attr("width", w)
    .attr("height", h);


var rectx = function(d) { return d.x - r; };
var recty = function(d) { return d.y - r; };

var tailx = function(d) { return d.dx > 0 ? d.sx - r : rectx(d) - d.dx * sz; };
var taily = function(d) { return d.dy > 0 ? d.sy - r : recty(d) - d.dy * sz; };
var tailw = function(d) { return d.dx == 0 ? sz : d.sz = (d.x - d.sx) * d.dx; };
var tailh = function(d) { return d.dy == 0 ? sz : d.sz = (d.y - d.sy) * d.dy; };

var topCell = function(c) { return pts[Math.max(0, c.r - 1) * cols + c.c]; };
var leftCell = function(c) { return pts[c.r * cols + Math.max(0, c.c - 1)]; };
var bottomCell = function(c) { return pts[Math.min(rows - 1, c.r + 1) * cols + c.c]; };
var rightCell = function(c) { return pts[c.r * cols + Math.min(cols - 1, c.c + 1)]; };

var topLeftCell = function(c) { return pts[Math.max(0, c.r - 1) * cols + Math.max(0, c.c - 1)]; };
var bottomLeftCell = function(c) { return pts[Math.min(rows - 1, c.r + 1) * cols + Math.max(0, c.c - 1)]; };
var bottomRightCell = function(c) { return pts[Math.min(rows - 1, c.r + 1) * cols + Math.min(cols - 1, c.c + 1)]; };
var topRightCell = function(c) { return pts[Math.max(0, c.r - 1) * cols + Math.min(cols - 1, c.c + 1)]; };

var cell = svg.selectAll(".cell")
  .data(pts)
  .enter().append("rect")
  .attr("class", function(d) { 
  return "cell " + ((d.isWall = d.c == 0 || d.c == cols - 1 || d.r == 0 || d.r == rows - 1) ? "wall" : "field");
  })
  .attr("x", rectx)
  .attr("y", recty)
  .attr("width", sz)
  .attr("height", sz)
  .attr("fill", function(d,i) { return colors[i]; })
  .attr("stroke", function(d,i) { return colors[i]; })
  .each(function(d) {
    d.elnt = d3.select(this);
  });


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
svg.selectAll(".field")
  .on("mouseover", function(c1) {
    d3.select(this).classed("vegCenter", true);
    var p = d3.mouse(this);
    previewLocation(c1, p);
    
    
  }).on("mouseout", function() {
    d3.selectAll(".vegEdge").classed("vegEdge", false)
    .attr('fill', function(d,i) { colors[i] = browns(d.z); return colors[i]; })
    d3.selectAll(".vegCenter").classed("vegCenter", false)
    .attr('fill', function(d,i) { colors[i] = browns(d.z); return colors[i]; })
  });














