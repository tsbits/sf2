var Villani = function(){}

Villani.degreeToRadian = function( degree ){
	return degree * Math.PI / 180;
}

Villani.radianToDegree = function( radian ){
	return radian * 180 / Math.PI;
}

Villani.average = function( valuesArray ){
    var average = 0;
    for( var i = 0; i < valuesArray.length; i++ ){
        average += valuesArray[i];
    }
    average = average / valuesArray.length;
    return average;
}

Villani.range = function( min, max ){
	return ( Math.random() * ( max - min )  ) + min;
}

Villani.distanceBetween = function( p1, p2 ){
    var xs = 0;
    var ys = 0;

    xs = p2.x - p1.x;
    xs = xs * xs;

    ys = p2.y - p1.y;
    ys = ys * ys;

    return Math.sqrt( xs + ys );
}

Villani.pointInCircle = function( point, circleCenter, circleRadius ){
    var inCircle = false;

    if( Math.abs( this.distanceBetween( point, circleCenter ) ) <= circleRadius ){
        inCircle = true;
    }

    return inCircle;
}

Villani.collisionCicleRect = function( circle, rect ){
	var distX = Math.abs(circle.x - rect.x);
    var distY = Math.abs(circle.y - rect.y);

    if (distX > (rect.width/2 + circle.radius)) { return false; }
    if (distY > (rect.height/2 + circle.radius)) { return false; }

    if (distX <= (rect.width/2)) { return true; } 
    if (distY <= (rect.height/2)) { return true; }

    var dx=distX;
    var dy=distY;
    return (dx*dx+dy*dy<=(circle.radius*circle.radius));
}

Villani.smoothPath = function( ptsa, tension, isClosed, numOfSegments ){
    tension = (typeof tension != 'undefined') ? tension : 0.5;
    isClosed = isClosed ? isClosed : false;
    numOfSegments = numOfSegments ? numOfSegments : 16;

    var _pts = [], res = [], x, y, t1x, t2x, t1y, t2y, c1, c2, c3, c4, st, t, i;

    _pts = ptsa.slice(0);

    if (isClosed) {
        _pts.unshift(_pts[_pts.length - 1]);
        _pts.unshift(_pts[_pts.length - 2]);
        _pts.unshift(_pts[_pts.length - 1]);
        _pts.unshift(_pts[_pts.length - 2]);
        _pts.push(_pts[0]);
        _pts.push(_pts[1]);
    }
    else {
        _pts.unshift(_pts[1]);
        _pts.unshift(_pts[0]);
        _pts.push(_pts[_pts.length - 2]);
        _pts.push(_pts[_pts.length - 1]);
    }

    for (i=2; i < (_pts.length - 4); i+=2) {
        for (t=0; t <= numOfSegments; t++) {

            // calc tension vectors
            t1x = (_pts[i+2] - _pts[i-2]) * tension;
            t2x = (_pts[i+4] - _pts[i]) * tension;

            t1y = (_pts[i+3] - _pts[i-1]) * tension;
            t2y = (_pts[i+5] - _pts[i+1]) * tension;

            // calc step
            st = t / numOfSegments;

            // calc cardinals
            c1 =   2 * Math.pow(st, 3)  - 3 * Math.pow(st, 2) + 1; 
            c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2); 
            c3 =       Math.pow(st, 3)  - 2 * Math.pow(st, 2) + st; 
            c4 =       Math.pow(st, 3)  -     Math.pow(st, 2);

            // calc x and y cords with common control vectors
            x = c1 * _pts[i]    + c2 * _pts[i+2] + c3 * t1x + c4 * t2x;
            y = c1 * _pts[i+1]  + c2 * _pts[i+3] + c3 * t1y + c4 * t2y;

            //store points in array
            res.push(x);
            res.push(y);

        }
    }

    return res;
}

// http://jsfromhell.com/math/is-point-in-poly
Villani.pointInPolygon = function( poly, pt ){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i)
        ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y))
        && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x)
        && (c = !c);
    return c;
}

// From Coding Math youtube channel
Villani.normalise = function( val, min, max ){
    return ( value - min ) / ( max - min );
}