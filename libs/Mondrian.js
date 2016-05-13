var Mondrian = function( mw, mh, tw, th, map ){
	this.mapWidth = mw || 10;
	this.mapHeight = mh || 10;
	this.tileWidth = tw || 25;
	this.tileHeight = th || 25;
	this.map = map || [];
	this.hero = { x: 10, y: 5, speed: 0.2, startX : 1, startY: 1, invicible: false, bag: [], hp: 100, maxHp: 100, respiteDuration: 500 };
	this.enemies = [];
	this.items = [];
	this.doors = [];
	this.gameEvents = {
	  collisions: new signals.Signal(),
	  item: new signals.Signal(),
	  door: new signals.Signal(),
	  heroHitted: new signals.Signal(),
	  heroDead: new signals.Signal()
	};

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
	this.gameEvents.collisions.add(this.onCollision); 
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

Mondrian.prototype.render = function(){
	this.moveEnemies();

	// Checking collision hero <--> items
	for( var i = 0; i < this.items.length; i++ ){
		var item = this.items[i];
		if( Math.round(this.hero.x) == item.x && Math.round(this.hero.y) == item.y ){
			this.pickUpItem(i);
			this.gameEvents.collisions.dispatch(this, item); 
		}
	}

	// Checking collision hero <--> enemies
	for( var i = 0; i < this.enemies.length; i++ ){
		var enemy = this.enemies[i];
		if( Math.round(this.hero.x) == Math.round(enemy.x) && Math.round(this.hero.y) == Math.round(enemy.y) ){
			this.gameEvents.collisions.dispatch(this, enemy); 
		}
	}

	// Checking collision hero <--> doors
	for( var i = 0; i < this.doors.length; i++ ){
		var door = this.doors[i];
		if( Math.round(this.hero.x) == door.x && Math.round(this.hero.y) == door.y ){
			this.gameEvents.collisions.dispatch(this, door); 
		}
	}
}


Mondrian.prototype.onCollision = function(ctx, collidedItem){
	var self = ctx;

	if( collidedItem.type == 'door' ){
		self.gameEvents.door.dispatch(collidedItem);
	}
	else if( collidedItem.type == 'enemy' ){
		if( !self.hero.invicible ){
			// Reduice hero life
			self.hero.hp -= collidedItem.atk;

			if( self.hero.hp <= 0 ){
				self.gameEvents.heroDead.dispatch(self.hero);
			}
			else{
				self.gameEvents.heroHitted.dispatch(self.hero);
				// Set hero invicible for a while
				self.hero.invicible = true;
				setTimeout(function(){
					self.hero.invicible = false;
				}, self.hero.respiteDuration);
			}
			
			//mondrian.resetHeroPos();
		}
	}
	else if( collidedItem.type == 'item' ){
		self.gameEvents.item.dispatch(collidedItem);
	}
}

Mondrian.prototype.moveHero = function( dirX, dirY, modifier ){
	var heroSpeedRatio = 1;

	if( modifier == 'walk' ){
		heroSpeedRatio = 0.25
	}


	if( dirX < 0 && this.map[Math.round(this.hero.y)][Math.ceil(this.hero.x) - 1] != 0 ){
		this.hero.x += dirX * this.hero.speed * heroSpeedRatio;
	}
	if( dirX > 0 && this.map[Math.round(this.hero.y)][Math.floor(this.hero.x) + 1] != 0 ){
		this.hero.x += dirX * this.hero.speed * heroSpeedRatio;
	}
	if( dirY < 0 && this.map[Math.ceil(this.hero.y) - 1][Math.round(this.hero.x)] != 0 ){
		this.hero.y += dirY * this.hero.speed * heroSpeedRatio;
	}
	if( dirY > 0 && this.map[Math.floor(this.hero.y) + 1][Math.round(this.hero.x)] != 0 ){
		this.hero.y += dirY * this.hero.speed * heroSpeedRatio;
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
	this.hero.startX = x;
	this.hero.y = y;
	this.hero.startY = y;
}

Mondrian.prototype.setHeroSize = function( w, h ){
	this.hero.width = w;
	this.hero.height = h;
}

Mondrian.prototype.resetHeroPos = function(){
	this.hero.x = this.hero.startX;
	this.hero.y = this.hero.startY;
}

Mondrian.prototype.addEnemy = function( x, y, speed, atk, hp ){
	this.enemies.push( { x: x, y: y, speed: speed, dir: Math.round( Math.random() * 3 ), type: 'enemy', atk: atk||1, hp: hp||10 } );
}

Mondrian.prototype.addItem = function( x, y, name ){
	this.items.push( { x: x, y: y, name: name, type: 'item', id: this.items.length } );
}

Mondrian.prototype.addDoor = function( x, y, targetLevel ){
	this.doors.push( { x: x, y: y, targetLevel: targetLevel, type: 'door' } );
}

Mondrian.prototype.addWall = function( x, y, length, vertical ){
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

Mondrian.prototype.pickUpItem = function( itemIndex ){
	this.hero.bag.push( this.items.splice( itemIndex, 1 )[0] );
}

Mondrian.prototype.isTileWalkable = function( x, y ){
	var walkable = false;
	
	if( this.map[y][x] != 0 ){
		walkable = true;
	}

	return walkable;
}