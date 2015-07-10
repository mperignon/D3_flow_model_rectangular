// gridding

var update = function() {

	if (verbose) {
		console.log('update')
	}

	var src, trg, dir, Q, Qs;

	for (var i=0; i<node_links.length; i++) {

		src = node_links[i].source.k;
		trg = node_links[i].target.k;

		Q = link_geometry[i].discharge;
// 		Qs = link_sed[i].Qs;

		if (Q  > 0) {
			if (Q*dt < pts[src].volume) {
				pts[src].volume = pts[src].volume - Q*dt;
				pts[trg].volume = pts[trg].volume + Q*dt;
// 				pts[src].Qs = pts[src].Qs - Qs*dt;
// 				pts[trg].Qs = pts[trg].Qs + Qs*dt;
				
			} else {
				pts[src].volume = 0;
				pts[trg].volume = pts[trg].volume + pts[src].volume;
// 				pts[src].Qs = 0;
// 				pts[trg].Qs = pts[trg].Qs + pts[src].volume * link_sed[i].C;
			}
		}
		
		if (Q < 0) {
			if (Math.abs(Q*dt) < pts[trg].volume) {
				pts[src].volume = pts[src].volume + Math.abs(Q*dt);
				pts[trg].volume = pts[trg].volume - Math.abs(Q*dt);
// 				pts[src].Qs = pts[src].Qs + Math.abs(Qs*dt);
// 				pts[trg].Qs = pts[trg].Qs - Math.abs(Qs*dt);
			} else {
				pts[src].volume = pts[src].volume + pts[trg].volume;
				pts[trg].volume = 0;
// 				pts[src].Qs = pts[src].Qs + pts[trg].volume * link_sed[i].C;
// 				pts[trg].Qs = 0;
			}
		}

	}

	for (var i=0; i<pts.length; i++) {

		pts[i].depth = pts[i].volume / cell_area;
		if (pts[i].depth < 0.001) { pts[i].depth = 0; }

		if (pts[i].x < 50) {
			pts[i].depth = d3.max([pts[i].z, maxH]) - pts[i].z;
			if (pts[i].depth > 0) {
				pts[i].C = 0.1;
				pts[i].Qs = pts[i].C * pts[i].volume;
			}
		}
		
		pts[i].volume = pts[i].depth * cell_area;
		
// 		if (isNaN(pts[i].Qs) | isNaN(pts[i].C)){
// 			pts[i].C = 0;
// 			pts[i].Qs = 0;
// 		}
// 		
// 		if (pts[i].Qs <=0) {
// 		
// 			pts[i].C = 0;
// 			pts[i].Qs = 0;
// 		}
// 		
// 		if (pts[i].volume > 0 & pts[i].Qs > 0) {
// 		
// 			pts[i].C = pts[i].Qs / pts[i].volume;
// // 			console.log(pts[i].Qs, pts[i].C)
// 		
// 		}
	}

	recolor();
	geometry();
	t = t + dt;

}