////////////////////////////////
// CONSTRUCTOR & DISPLAY LIST //
////////////////////////////////

var Degas = function( canvas ){
	this.canvas = canvas;
	this.ctx = this.canvas.getContext('2d');
	this.fullClear = true;
	this.clearColor = "rgba(0,0,0,0.25)";
	this.children = [];
	this.totalChildren = 0;
	this.mouseEvent = false;
	this.mouseStyle = true;
	this.mouse = { 'x': undefined, 'y': undefined }
	this.scaleRatio = 1;
	this.currentFrame = 0; 
}

Degas.prototype.enableMouse = function(){
	var self = this
	this.mouseEvent = true;

	this.canvas.addEventListener('mousemove', function(e){
        self.mouse.x = e.offsetX;
      	self.mouse.y = e.offsetY; 
	}, false);

	this.canvas.addEventListener('click', function(e){
		for( var i = 0; i < self.children.length; i++ ){
			if( self.children[i].events.click.callback != undefined ){
				if( self[ 'mouseover' + self.children[i].type ](self.children[i]) ){
					var e = { 'target': self.children[i], 'type': 'click' }
					self.children[i].events.click.callback( e );
				}
			}
		}
	}, false);
}

Degas.prototype.disableMouse = function(){
	this.mouseEvent = false;

	this.canvas.removeEventListener('mousemove', function(e){
		var rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
      	this.mouse.y = e.clientY - rect.top
	}, false);
}

Degas.prototype.enableMouseStyle = function(){
	this.mouseStyle = true;
}

Degas.prototype.disableMouseStyle = function(){
	this.mouseStyle = false;
}

Degas.prototype.resize = function( width, height ){
	if (window.devicePixelRatio > 1) {
	    var canvasWidth = this.canvas.width;
	    var canvasHeight = this.canvas.height;

	    this.canvas.width = canvasWidth * window.devicePixelRatio;
	    this.canvas.height = canvasHeight * window.devicePixelRatio;
	    this.canvas.style.width = canvasWidth;
	    this.canvas.style.height = canvasHeight;

	    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
	}

	this.canvas.width = width;
	this.canvas.height = height;
}

Degas.prototype.addChild = function( child ){
	this.totalChildren++;
	child.uid = this.totalChildren;
	this.children.push( child );
}

Degas.prototype.removeChild = function( child ){
	for( var i = 0; i < this.children.length; i++ ){
		if( this.children[i]['uid'] == child.uid ){
			this.children.splice( i, 1 );
			break;
		}
	}
}

Degas.prototype.getChildIndex = function( child ){
	var childIndex = undefined;

	for( var i = 0; i < this.children.length; i++ ){
		if( this.children[i]['uid'] == child.uid ){
			childIndex = i;
			break;
		}
	}

	return childIndex;
}

Degas.prototype.bringToFront = function( child ){
	while( this.getChildIndex( child ) < this.children.length-1 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )+1 );
	}
}

Degas.prototype.bringForward = function( child ){
	if( this.getChildIndex( child ) < this.children.length-1 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )+1 );
	}
}

Degas.prototype.bringBackward = function( child ){
	if( this.getChildIndex( child ) > 0 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )-1 );
	}
}
 
Degas.prototype.sendToBack = function( child ){
	while( this.getChildIndex( child ) > 0 ){
		this.swapChildIndex( this.getChildIndex( child ), this.getChildIndex( child )-1 );
	}
}
 
Degas.prototype.swapChildIndex = function( childIndex, targetChildIndex ){
	this.children.splice( targetChildIndex, 0, this.children.splice( childIndex, 1 )[0] );
	return this;
}

Degas.prototype.getMetName = function( root ){
	console.log( this['drawRectangle'] );
}

Degas.prototype.empty = function(){
	while( this.children.length > 0 ){
		this.children.pop();
	}
}



///////////////
// RENDERING //
///////////////

Degas.prototype.render = function(){
	this.currentFrame++;
	if( this.fullClear ){
		this.ctx.clearRect ( 0 , 0 , window.innerWidth, window.innerHeight );
	}
	else{
		this.ctx.fillStyle = this.clearColor;
		this.ctx.fillRect( 0,0,window.innerWidth, window.innerHeight );
	}

	for( var i = 0; i < this.children.length; i++ ){
		var ci = this.children[i];
		this.ctx.save();	

		if( ci.group != undefined ){
			this.ctx.translate( ci.group.x, ci.group.y );
			this.ctx.rotate( Degas.degreeToRadian( ci.group.rotation ) );
			this.ctx.scale( ci.group.scaleX, ci.group.scaleY );
			this.ctx.globalAlpha = ci.group.opacity;
		}	

		if( ci.mask != undefined ){
			this.ctx.translate( ci.mask.x, ci.mask.y );
			this.ctx.rotate( Degas.degreeToRadian( ci.mask.rotation ) );
			this.ctx.scale( ci.mask.scaleX, ci.mask.scaleY );
			this.ctx.globalAlpha = ci.mask.opacity;
			this[ 'draw'+ci.mask.type ]( ci.mask );

			this.ctx.translate( -ci.mask.x, -ci.mask.y);
			this.ctx.clip();
		}

		this.ctx.translate( ci.x, ci.y );
		this.ctx.rotate( Degas.degreeToRadian( ci.rotation ) );
		this.ctx.scale( ci.scaleX, ci.scaleY );
		this.ctx.globalAlpha = ci.opacity;
		this.ctx.globalCompositeOperation = ci.blendMode;
		this[ 'draw'+ci.type ]( ci );

		if( ci.fill != '' ){
			this.ctx.fillStyle = ci.fill;
			this.ctx.fill();
		}
		if( ci.stroke != '' ){
			this.ctx.strokeStyle = ci.stroke;
			this.ctx.lineWidth = ci.strokeWidth;
			this.ctx.lineCap = ci.lineCap;
			this.ctx.lineJoin = ci.lineJoin;
			this.ctx.stroke();
		}
		this.ctx.translate( -ci.x, -ci.y);
		this.ctx.scale( 1, 1 );
		this.ctx.rotate( Degas.degreeToRadian( ci.rotation ) * -1 );
		this.ctx.restore();
	}

	if( this.mouseEvent ){
		//Detecting mouseover
		for( var i = 0; i < this.children.length; i++ ){
			if( this.children[i].events.mouseover.callback != undefined ){
				if( this[ 'mouseover' + this.children[i].type ](this.children[i]) && !this.children[i].events.mouseover.fired ){
					var e = { 'target': this.children[i], 'type': 'mouseover' }
					this.children[i].events.mouseover.fired = true;
					this.children[i].events.mouseover.callback( e );


					this.children[i].events.mouseout.fired = false;
				}
				if( this.children[i].events.mouseover.fired && !this.children[i].events.mouseout.fired ){
					if( !this[ 'mouseover' + this.children[i].type ](this.children[i]) ){
						this.children[i].events.mouseout.fired = true;
						this.children[i].events.mouseover.fired = false;

						if( this.children[i].events.mouseout.callback != undefined ){
							var e = { 'target': this.children[i], 'type': 'mouseout' }
							this.children[i].events.mouseout.callback(e);
						}
					}
				}
			}
		}

		//Setting the good cursor style
		var hasOver = false;
		for( var i = 0; i < this.children.length; i++ ){
			if( this.children[i].events.mouseover.callback != undefined || this.children[i].events.click.callback != undefined ){
				if( this[ 'mouseover' + this.children[i].type ](this.children[i]) ){
					hasOver = true;
					break;
				}
			}
		}

		if( this.mouseStyle ){
			if( hasOver ){
				this.canvas.style.cursor = "pointer";
			}
			else{
				this.canvas.style.cursor = "default"
			}
		}
	}
}

Degas.prototype.drawCube = function( obj ){
	this.ctx.beginPath();
	this.ctx.rect( -obj.width/2, -obj.height/2, obj.width, obj.height );
	this.ctx.closePath();
}

Degas.prototype.drawRectangle = function( obj ){
	this.ctx.beginPath();
	this.ctx.rect( -obj.width/2, -obj.height/2, obj.width, obj.height );
	this.ctx.closePath();
}

Degas.prototype.drawCircle = function( obj ){
	this.ctx.beginPath();
	this.ctx.arc( 0, 0, obj.radius, 0, 2 * Math.PI, false );
	this.ctx.closePath();
}

Degas.prototype.drawPath = function( obj ){
	this.ctx.beginPath();
	if( !obj.smoothed ){
		this.ctx.moveTo( obj.points[0].x, obj.points[0].y );
		for( var j = 1; j < obj.points.length; j++ ){
			this.ctx.lineTo( obj.points[j].x, obj.points[j].y );
		}
		if( obj.closed ){
			this.ctx.closePath();
		}
	}
	else if( obj.smoothed ){
		obj.smooth();
		if( !obj.closed ){
			this.ctx.moveTo( obj.smoothedPoints[0].x, obj.smoothedPoints[0].y );
			for( var j = 1; j < obj.smoothedPoints.length; j++ ){
				this.ctx.lineTo( obj.smoothedPoints[j].x, obj.smoothedPoints[j].y );
			}
		}
		else if( obj.closed ){
			this.ctx.moveTo( obj.smoothedPoints[ obj.smoothPointsNumber ].x, obj.smoothedPoints[ obj.smoothPointsNumber ].y );
			for( var j = obj.smoothPointsNumber+1; j < obj.smoothedPoints.length - obj.smoothPointsNumber; j++ ){
				this.ctx.lineTo( obj.smoothedPoints[j].x, obj.smoothedPoints[j].y );
			}
		}
	}
}

Degas.prototype.drawRegularPolygon = function( obj ){
	this.drawPath( obj.path );
}

Degas.prototype.drawArc = function( obj ){
	this.ctx.beginPath();
	this.ctx.arc( 0, 0, obj.radius, Degas.degreeToRadian( obj.startAngle ),  Degas.degreeToRadian( obj.endAngle ), obj.antiClockwise );
	this.ctx.closePath();
}

Degas.prototype.drawImage = function( obj ){
	this.ctx.drawImage( obj.img, -obj.width / 2, -obj.height / 2 );
}

Degas.prototype.drawSprite = function( obj ){
	this.ctx.drawImage( obj.img, obj.width * obj.currentFrame, 0, obj.width, obj.height,  -obj.width/2,  -obj.height/2, obj.width, obj.height );
}

Degas.prototype.drawText = function( obj ){
	this.ctx.fillStyle = obj.fill;
	this.ctx.font = obj.fontStyle + ' ' + obj.fontSize + ' ' + obj.fontFamily;
	this.ctx.textAlign = obj.textAlign;
	this.ctx.fillText( obj.txt, 0, 0 );
}



///////////////
// COLLISION //
///////////////

Degas.prototype.mouseoverCircle = function( obj ){
	if( Degas.distanceBetween( obj, this.mouse ) < obj.radius ){
		return true;
	}
	else{
		return false;
	}
}

Degas.prototype.mouseoverCube = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true;
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}

Degas.prototype.mouseoverRectangle = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true;
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}

Degas.prototype.mouseoverRegularPolygon = function( obj ){
	//Substract polygon pos because poly point pos ar relative to polygon x and y
	var normalizedMousePos = { 'x': this.mouse.x - obj.x, 'y': this.mouse.y - obj.y }
	return Degas.pointInPolygon( obj.path.points, normalizedMousePos );
}

Degas.prototype.mouseoverImage = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true;
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}

Degas.prototype.mouseoverSprite = function( obj ){
	if( this.mouse.x > obj.x - obj.width/2 && this.mouse.x < obj.x + obj.width/2 ){
		if( this.mouse.y > obj.y - obj.height/2 && this.mouse.y < obj.y + obj.height/2 ){
			return true; 
		}
		else{
			return false;
		}
	}
	else{
		return false;
	}
}



////////////////////
// SHAPES & IMAGE //
////////////////////

//Base
Degas.BaseShape = function(){
	this.uid = 0;
	this.x = 0;
	this.y = 0; 
	this.blendMode = 'source-over';
	this.rotation = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.opacity = 1;
	this.fill = '';
	this.stroke = '';
	this.strokeWidth = 1;
	this.lineCap = 'butt';
	this.lineJoin = 'miter';
	this.mask;
	this.group;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.BaseShape.prototype.addEventListener = function( event, callback ){
	if( this.events[event] != undefined ){
		this.events[event]['fired'] = false;
		this.events[event]['callback'] = callback;
	}
}

//Cube
Degas.Cube = function( size ){
	this.type = 'Cube';
	this.width = size || 50;
	this.height = size || 50;
	this.size = size || 50;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Cube.prototype = new Degas.BaseShape();
Degas.Cube.prototype.setSize = function( size ){
	if( size != undefined && size != null && !isNaN( parseFloat( size ) ) ){
		this.width = size;
		this.height = size;
		this.size = size;
	}
}

//Rectangle
Degas.Rectangle = function( width, height ){
	this.type = 'Rectangle';
	this.width = width||150;
	this.height = height||100;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Rectangle.prototype = new Degas.BaseShape();

//Circle
Degas.Circle = function( radius ){
	this.type = 'Circle';
	this.radius = radius || 50;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Circle.prototype = new Degas.BaseShape();

//Regular Polygon
Degas.RegularPolygon = function( radius, nPoints ){
	this.type = 'RegularPolygon';
	this.radius = radius || 50;

	var nPts = nPoints || 5;

	var points = [];
	var angle = Math.PI * 2 / nPts;
	for( var i = 0; i < nPts; i++ ){
		points.push( new Degas.Point( this.radius * Math.sin( angle * i ), this.radius * Math.cos( angle * i ) ) );
	}

	this.path = new Degas.Path( points );
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.RegularPolygon.prototype = new Degas.BaseShape();

//Image
Degas.Image = function( src, callback ){
	var self = this;
	this.type = 'Image';
	this.src = src || '';
	this.loaded = false;
	this.img = new Image();

	this.img.onload = function(){
		self.loaded = true;
		self.width = self.img.width;
		self.height = self.img.height;

		if( callback != undefined ){
			callback( self );
		}
	}

	if( this.src != '' ){
		this.img.src = this.src;
	}
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Image.prototype = new Degas.BaseShape();

//Sprite
Degas.Sprite = function( src, width, height, frames, fps, loop, callback ){
	var self = this;
	this.type = 'Sprite';
	this.src = src || '';
	this.loaded = false;
	this.img = new Image();
	this.frames = frames;
	this.loop = loop || false;
	this.width = width;
	this.height = height;
	this.pWidth;
	this.pHeight;
	this.currentFrame = 0;
	this.reverse = false;
	this.fps = fps || 30;
	this.interval;

	this.img.onload = function(){
		self.loaded = true;
		self.pWidth = self.img.width;
		self.pHeight = self.img.height;

		if( callback != undefined ){
			callback( self );
		}
	}

	if( this.src != '' ){
		this.img.src = this.src;
	}
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Sprite.prototype = new Degas.BaseShape();
Degas.Sprite.prototype.nextFrame = function(){
	if( this.currentFrame < this.frames-1 ){
		this.currentFrame++;
	}
	else if( this.loop ){
		this.currentFrame = 0;
	}
	else{
		this.stop();
	}
}
Degas.Sprite.prototype.prevFrame = function(){
	if( this.currentFrame > 0 ){
		this.currentFrame--;
	}
	else if( this.loop ){
		this.currentFrame = this.frames-1;
	}
	else{
		this.stop();
	}
}
Degas.Sprite.prototype.render = function(){
	if( !this.reverse ){
		this.nextFrame();
	}
	else{
		this.prevFrame();
	}
}
Degas.Sprite.prototype.play = function(){
	var self = this;
	if( this.interval == undefined ){
		this.interval = setInterval(function(){
			self.render();
		}, 1000/this.fps);
	}
}
Degas.Sprite.prototype.stop = function(){
	var self = this;
	clearInterval( self.interval );
	self.interval = undefined;
}
Degas.Sprite.prototype.gotoAndPlay = function( frame ){
	if( frame > -1 && frame < this.frames-1 ){
		this.currentFrame = frame;
		this.loop = false;
		this.play();
	}
}
Degas.Sprite.prototype.gotoAndStop = function( frame ){
	if( frame > -1 && frame < this.frames-1 ){
		this.currentFrame = frame;
		this.loop = false;
		this.stop();
	}
}

//Text
Degas.Text = function( text, styles ){
	var self = this;
	this.type = 'Text';
	this.txt = text;
	this.fontFamily = styles.fontFamily || 'Arial' ;
	this.fontSize = styles.fontSize || '16px' ;
	this.fontStyle = styles.fontStyle || 'normal' ;
	this.textAlign = styles.textAlign || 'center' ;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Text.prototype = new Degas.BaseShape();



///////////////////
// POINTS'N'PATH //
///////////////////

//Path
Degas.Path = function( points ){
	this.type = 'Path';
	this.points = points;
	this.smoothedPoints;
	this.smoothed = false;
	this.closed = false;
	this.tension = 0.5;
	this.smoothPointsNumber = 16;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Path.prototype = new Degas.BaseShape();
Degas.Path.prototype.smooth = function(){
	var tempPoints = [];
	if( this.closed ){
		tempPoints.push( this.points[ this.points.length-1 ].x );
		tempPoints.push( this.points[ this.points.length-1 ].y );
	}

	for( var i = 0; i < this.points.length; i++ ){
		tempPoints.push( this.points[i].x );
		tempPoints.push( this.points[i].y );
	}

	if( this.closed ){
		tempPoints.push( this.points[0].x );
		tempPoints.push( this.points[0].y );
		tempPoints.push( this.points[1].x );
		tempPoints.push( this.points[1].y );
	}

	var smoothedPoints = Degas.smoothPath( tempPoints, this.tension, false, this.smoothPointsNumber );
	this.smoothedPoints = [];

	for( var i = 0; i < smoothedPoints.length; i+=2 ){
		this.smoothedPoints.push( new Degas.Point( smoothedPoints[i], smoothedPoints[i+1] ) );
	}
	this.smoothed = true;
}
Degas.Path.prototype.unSmooth = function(){
	this.smoothed = false;
}
Degas.Path.prototype.add = function( point ){
	this.points.push( point );
}
Degas.Path.prototype.shuffle = function( radius ){
	for( var i = 0; i < this.points.length; i++ ){
		this.points[i].moveRandom( radius );
	}
}

//Arc
Degas.Arc = function( startAngle, endAngle, radius, antiClockwise ){
	this.type = 'Arc';
	this.startAngle = startAngle || 0;
	this.endAngle = endAngle || 45;
	this.radius = radius || 50;
	this.antiClockwise = antiClockwise || false;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}
Degas.Arc.prototype = new Degas.BaseShape();

//Point
Degas.Point = function( x, y ){
	this.type = 'Point';
	this.x = x || 0;
	this.y = y || 0;
}
Degas.Point.prototype.moveRandom = function( radius ){
	this.x += Math.round( Math.random() * ( radius * 2 ) ) - radius;
	this.y += Math.round( Math.random() * ( radius * 2 ) ) - radius;
}



///////////
// GROUP //
///////////

//Base
Degas.Group = function(){
	this.uid = 0;
	this.x = 0;
	this.y = 0;
	this.rotation = 0;
	this.scaleX = 1;
	this.scaleY = 1;
	this.opacity = 1;
	this.events = {
		'mouseover' : { 'fired': false, 'callback' : undefined },
		'mouseout' : { 'fired': false, 'callback' : undefined },
		'click' : { 'fired': false, 'callback' : undefined }
	}
}

Degas.Group.prototype.add = function( item ){
	item.group = this;
}

Degas.Group.prototype.remove = function( item ){
	item.group = undefined;
}


//////////
// MATH //
//////////

// K3N cardinal curve - http://stackoverflow.com/questions/7054272/how-to-draw-smooth-curve-through-n-points-using-javascript-html5-canvas
Degas.smoothPath = function( ptsa, tension, isClosed, numOfSegments ){
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

Degas.degreeToRadian = function( degree ){
	return degree * Math.PI / 180;
}

Degas.radianToDegree = function( radian ){
	return radian * 180 / Math.PI;
}

Degas.distanceBetween = function( p1, p2 ){
    var xs = 0;
    var ys = 0;

    xs = p2.x - p1.x;
    xs = xs * xs;

    ys = p2.y - p1.y;
    ys = ys * ys;

    return Math.sqrt( xs + ys );
}

Degas.pointInPolygon = function( poly, pt ){
    for(var c = false, i = -1, l = poly.length, j = l - 1; ++i < l; j = i) ((poly[i].y <= pt.y && pt.y < poly[j].y) || (poly[j].y <= pt.y && pt.y < poly[i].y)) && (pt.x < (poly[j].x - poly[i].x) * (pt.y - poly[i].y) / (poly[j].y - poly[i].y) + poly[i].x) && (c = !c); return c;
}