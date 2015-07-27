$.getScript('grid.js', function(){});
$.getScript('veg.js', function(){});

var verbose = true;

var w = 960,
    h = 500,
    sz = 20,
    r = sz / 2,
    sr = r * r,
    ssz = sz * sz,
    t = 5000
    S = 0.001;

// Color schemes
var greens = d3.scale.quantize().domain([1,7])
.range(["#d9f0a3","#addd8e","#78c679","#41ab5d","#238443","#006837","#004529"]);
var alpha = [0, 0.04, 0.1, 0.22, 0.4, 1];

var browns = d3.scale.linear().domain([0,0.5])
.range(["#fee391","#fec44f","#fe9929","#ec7014","#cc4c02","#993404","#662506"]);

var sedColors = d3.scale.linear().domain([-0.005,0.005])
.range(["#ffffd9","#edf8b1","#c7e9b4","#7fcdbb","#41b6c4","#1d91c0","#225ea8","#253494","#081d58"]);

var blues = d3.scale.linear().domain([0,0.1])
.range(["#c6dbef","#9ecae1","#6baed6","#4292c6","#2171b5","#08519c"]);



function retrieve() {

	if (verbose) { console.log('retrieve'); }

    var txtbox = document.getElementById("maxH");
    maxH = Number(txtbox.value);
    
    var txtbox = document.getElementById("maxT");
    max_t = txtbox.value;

    
    document.getElementById("maxH").disabled = true;
    document.getElementById("maxT").disabled = true;
    document.getElementById("submit").disabled = true;
    document.getElementById("startrun").disabled = false;
    
    document.getElementById("running").innerHTML = " <- Click to run the model";
    document.getElementById("values").innerHTML = "";
    
}

