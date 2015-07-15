
var update_fvm = function() {

	geometry_fvm();

	if (verbose) {
		console.log('update_fvm')
	}
	
	
	


	for (var i=0; i<pts.length; i++) {
	
		if (pts[i].veg>0.1) {
		
			var u_ = pts[i].hu / pts[i].depth;
			var v_ = pts[i].hv / pts[i].depth;
		
			var u_veg = 0.5 * Cd * alpha[pts[i].veg] * u_*u_ * dt;
			pts[i].duh = pts[i].duh - u_veg*pts[i].depth;
			
			var v_veg = 0.5 * Cd * alpha[pts[i].veg] * v_*v_ * dt;
			pts[i].dvh = pts[i].dvh - v_veg*pts[i].depth;
		
		}
		
	
		pts[i].depth = pts[i].depth + pts[i].dh;
		pts[i].hu = d3.max([pts[i].hu + pts[i].duh,0]);
		pts[i].hv = d3.max([pts[i].hv + pts[i].dvh,0]);
		
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
		pts[i_].hu = pts[i_+1].hu//pts[i_+1].depth * pts[i_].depth;
		pts[i_].hv = pts[i_+1].hv//pts[i_+1].depth * pts[i_].depth;
	}
	
	
	t = t + dt;
}



// var elev;

var update_sed = function () {

var Edot = [];
var Ddot = [];
var tau_s, edot, ddot;
var tau_b, diff;


	for (var i=0; i<edge_top.length; i++) {
		var i_ = edge_top[i];
		pts[i_].dChx = pts[i_+MapColumns].dChx;
		pts[i_].dChy = pts[i_+MapColumns].dChy;
		if (pts[i_].depth < minh) {
            pts[i_].Ch = 0;
            pts[i_].dChy = 0;
            pts[i_].dChx = 0;
        }
	}
		for (var i=0; i<edge_bottom.length; i++) {
		var i_ = edge_bottom[i];
		pts[i_].dChx = pts[i_-MapColumns].dChx;
		pts[i_].dChy = pts[i_-MapColumns].dChy;
		if (pts[i_].depth < minh) {
            pts[i_].Ch = 0;
            pts[i_].dChy = 0;
            pts[i_].dChx = 0;
        }
	}
		for (var i=0; i<edge_right.length; i++) {
		var i_ = edge_right[i];
		pts[i_].dChx = pts[i_-1].dChx;
		pts[i_].dChy = pts[i_-1].dChy;
		if (pts[i_].depth < minh) {
            pts[i_].Ch = 0;
            pts[i_].dChy = 0;
            pts[i_].dChx = 0;
        }
		
	}
	for (var i=0; i<edge_left.length; i++) {
		var i_ = edge_left[i];
		pts[i_].Ch = Co*pts[i_].depth;
		pts[i_].dChy = 0;
		pts[i_].dChx = pts[i_].hu*Co;

//         pts[i_].dChx = 0.5* (pts[i_].duh + pts[i_+1].duh) *  0.5 * ((pts[i_].Ch/pts[i_].depth) + (pts[i_+1].Ch/pts[i_+1].depth))
//         
        if (pts[i_].depth < minh) {
            pts[i_].Ch = 0;
            pts[i_].dChy = 0;
            pts[i_].dChx = 0;
        }
        
    }


for (var i=0; i<pts.length; i++) {

	// do dCh/dt here, set new C
	// then do dz/dt here

	// erosion and deposition
	var h = pts[i].depth;
	
	if (h>minh) {
	
	var C = pts[i].Ch / h;

	tau_b = rho * g * h * S;
	tau_s = tau_b / ((rho_s - rho) * g * D);
	
	edot = d3.max([Ke * (tau_s - tau_c),0]);
	ddot = C*vs;
	
	diff = ddot - edot;
	
	pts[i].Ch = d3.max([pts[i].Ch + pts[i].dChx + pts[i].dChy - diff*dt,0]);
	
	// dz/dt
	var dz = diff*dt/(1-porosity);
	
	pts[i].z = pts[i].z + dz;
	pts[i].depth = pts[i].depth + dz;
	

	} else {
	
        pts[i].Ch = 0;
        pts[i].dChy = 0;
        pts[i].dChx = 0;
    }
	

}

	for (var i=0; i<edge_left.length; i++) {
		var i_ = edge_left[i];
		pts[i_+1].z = pts[i_+2].z+S*dx;
		pts[i_].z = pts[i_+1].z+S*dx;
// 		pts[i_+1].z = initial_z[i_+1];
// 		pts[i_+1].z = initial_z[i_+1];

	}
	
for (var i=0; i<pts.length; i++) {
elev.push(sedColors(pts[i].z - initial_z[i]));
}


}



