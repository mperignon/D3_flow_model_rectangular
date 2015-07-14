// gridding

// var update = function() {
// 
// 	if (verbose) {
// 		console.log('update')
// 	}
// 
// 	var src, trg, dir, Q, Qs;
// 
// 	for (var i=0; i<node_links.length; i++) {
// 
// 		src = node_links[i].source.k;
// 		trg = node_links[i].target.k;
// 
// 		Q = link_geometry[i].discharge;
// 
// 		if (Q  > 0) {
// 			if (Q*dt < pts[src].volume) {
// 				pts[src].volume = pts[src].volume - Q*dt;
// 				pts[trg].volume = pts[trg].volume + Q*dt;
// 				
// 			} else {
// 				pts[src].volume = 0;
// 				pts[trg].volume = pts[trg].volume + pts[src].volume;
// 			}
// 		}
// 		
// 		if (Q < 0) {
// 			if (Math.abs(Q*dt) < pts[trg].volume) {
// 				pts[src].volume = pts[src].volume + Math.abs(Q*dt);
// 				pts[trg].volume = pts[trg].volume - Math.abs(Q*dt);
// 			} else {
// 				pts[src].volume = pts[src].volume + pts[trg].volume;
// 				pts[trg].volume = 0;
// 			}
// 		}
// 
// 	}
// 	
// 	edges();
// 
// 	for (var i=0; i<pts.length; i++) {
// 
// 		pts[i].depth = pts[i].volume / cell_area;
// 
// 		if (pts[i].x < 50) {
// 			pts[i].depth = d3.max([pts[i].z, maxH]) - pts[i].z;
// 		}
// 		
// 		pts[i].volume = pts[i].depth * cell_area;
// 		
// // 		}
// 	}
// 
// 	recolor();
// 	geometry();
// 	t = t + dt;
// 
// }
// 
// 
// var edges = function() {
// // edges are within one dx of the boundaries
// 
// 	// outflow boundaries
// 	for (var i=0; i<edge_right.length; i++) {
// 		var k = edge_right[i];
// 		pts[k].volume = pts[k-1].volume;
// 	}
// 	
// 	for (var i=0; i<edge_top.length; i++) {
// 		var k = edge_top[i];
// 		pts[k].volume = pts[k+MapColumns].volume;
// 	}
// 	
// 	for (var i=0; i<edge_bottom.length; i++) {
// 		var k = edge_bottom[i];
// 		pts[k].volume = pts[k-MapColumns-1].volume;
// 		
// 	}
// 	
// 	// fixed stage
// 	for (var i=0; i<edge_left.length; i++) {
// 		var k = edge_left[i];
// 		stage = d3.max([pts[k].z, maxH]);
// 		pts[k].volume = stage * cell_area;
// 	}
// 
// 
// }

var update_fvm = function() {

	geometry_fvm();

	if (verbose) {
		console.log('update_fvm')
	}


	for (var i=0; i<pts.length; i++) {
	
		pts[i].depth = pts[i].depth + pts[i].dh;
		pts[i].hu = pts[i].hu + pts[i].duh;
		pts[i].hv = pts[i].hv + pts[i].dvh;
		
		if (pts[i].depth <= 0) {
			pts[i].depth = 0.0001;
			pts[i].hu = 0;
			pts[i].hv = 0;
		
		}
		

	}
	for (var i=0; i<edge_top.length; i++) {
		var i_ = edge_top[i];
		pts[i_].depth = pts[i_+MapColumns].depth*0.1;
		pts[i_].hv = pts[i_+MapColumns].depth*0.5;
		pts[i_].hu = 0;
	}
		for (var i=0; i<edge_bottom.length; i++) {
		var i_ = edge_bottom[i];
		pts[i_].depth = pts[i_-MapColumns].depth*0.1;
		pts[i_].hv = pts[i_-MapColumns].depth*0.5;
		pts[i_].hu = 0;
	}
		for (var i=0; i<edge_right.length; i++) {
		var i_ = edge_right[i];
		pts[i_].depth = pts[i_-1].depth*0.9;
		pts[i_].hu = pts[i_].depth*0.5;
		pts[i_].hv = pts[i_-1].hv;
	}
	for (var i=0; i<edge_left.length; i++) {
		var i_ = edge_left[i];
		var stage = d3.max([pts[i_].z+0.0001, maxH]);
		pts[i_].depth = d3.max([stage - pts[i_].z, pts[i_+1].depth]);
		pts[i_].hu = pts[i_+1].hu;
		pts[i_].hv = pts[i_+1].hv;
	}
	
	recolor();
	t = t + dt;
}














