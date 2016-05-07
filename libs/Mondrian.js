var Mondrian = function( mw, mh, tw, th, map ){
	this.mapWidth = mw || 10;
	this.mapHeight = mh || 10;
	this.tileWidth = tw || 25;
	this.tileHeight = th || 25;
	this.map = map || [];
	this.hero = { x: 10, y: 5, speed: 0.1 };
	this.enemies = [];

	this.buildMap();
} 

Mondrian.prototype.buildMap = function( random ){
	if( this.map.length == 0 ){
		for( var i = 0; i < this.mapHeight; i++ ){
			var row = [];
			for( var j = 0; j < this.mapWidth; j++ ){
				if( random ){
					row.push( Math.round( Math.random() ) );
				}
				else{
					row.push( 1 );	
				}
			}
			this.map.push( row );
		}
	}

	this.makeBorder();
}

Mondrian.prototype.makeBorder = function(){
	for( var i = 0; i < this.mapHeight; i++ ){
		for( var j = 0; j < this.mapWidth; j++ ){
			if( i == 0 || i == this.map.length-1 ){
				this.map[i][j] = 0;
			}
			else if( j == 0 || j == this.map[i].length-1 ){
				this.map[i][j] = 0; 
			}
		}
	}
}

Mondrian.prototype.makeWall = function( x, y, length, vertical ){
	if( vertical ){
		for( var i = 0; i < length; i++ ){
			this.map[y+i][x] = 0;
		}
	}
	else{
		for( var i = 0; i < length; i++ ){
			this.map[y][x+i] = 0;
		}
	}
}

Mondrian.prototype.moveHero = function( dirX, dirY ){
	if( dirX < 0 && this.map[Math.round(this.hero.y)][Math.ceil(this.hero.x) - 1] != 0 ){
		this.hero.x += dirX * this.hero.speed;
	}
	if( dirX > 0 && this.map[Math.round(this.hero.y)][Math.floor(this.hero.x) + 1] != 0 ){
		this.hero.x += dirX * this.hero.speed;
	}
	if( dirY < 0 && this.map[Math.ceil(this.hero.y) - 1][Math.round(this.hero.x)] != 0 ){
		this.hero.y += dirY * this.hero.speed;
	}
	if( dirY > 0 && this.map[Math.floor(this.hero.y) + 1][Math.round(this.hero.x)] != 0 ){
		this.hero.y += dirY * this.hero.speed;
	}
}

Mondrian.prototype.moveEnemies = function(){
	for( var i = 0; i < this.enemies.length; i++ ){
		var e = this.enemies[i];

		if( e.dir == 0 && this.map[Math.round(e.y)][Math.ceil(e.x) - 1] != 0 ){
			e.x -= e.speed;
		}
		else if( e.dir == 2 && this.map[Math.round(e.y)][Math.floor(e.x) + 1] != 0 ){
			e.x += e.speed;
		}
		else if( e.dir == 1 && this.map[Math.ceil(e.y) - 1][Math.round(e.x)] != 0 ){
			e.y -= e.speed;
		}
		else if( e.dir == 3 && this.map[Math.floor(e.y) + 1][Math.round(e.x)] != 0 ){
			e.y += e.speed;
		}
		else{
			e.dir = Math.round( Math.random() * 3 );
			return;
		}

		// Random dir change
		if( Math.random() > 0.99 ){
			e.dir = Math.round( Math.random() * 3 );
		}
	}
}

Mondrian.prototype.setHeroStart = function( x, y ){
	this.hero.x = x;
	this.hero.y = y;
}

Mondrian.prototype.setHeroSize = function( w, h ){
	this.hero.width = w;
	this.hero.height = h;
}

Mondrian.prototype.addEnemy = function( x, y, speed ){
	this.enemies.push( { x: x, y: y, speed: speed, dir: Math.round( Math.random() * 3 ) } );
}

Mondrian.prototype.isTileWalkable = function( x, y ){
	var walkable = false;
	
	if( this.map[y][x] != 0 ){
		walkable = true;
	}

	return walkable;
}