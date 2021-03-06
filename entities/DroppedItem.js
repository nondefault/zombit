var DROPTIMEOUT = 500;
DroppedItem = Entity.extend(function(x,y,item){
	this.x = x;
	this.y = y;
	this.item = item;
	this.type = DROPPEDITEM;
	this.timestamp = Date.now();
	this.friction = 0.1;

	this.disposable = true;//this.item.disposable;
	entityManager.makeDisposable(this);

	//console.log("Dropped a(n) "+item.name);
})
.methods({
	step: function(dlt) {
		this.supr(dlt);
		if (Date.now()-this.timestamp>DROPTIMEOUT) {
			var ent = player;
			if (Math.abs(ent.x-this.x)+Math.abs(ent.y-this.y)<tileWidth) {
				if (ent.inv.push(this.item)!=false) {
					this.destroy();
				}
			}
		}
	},
	render: function(x,y) {
		if (entityShadows) {
			ctx.globalAlpha = 0.4;
			ctx.drawImage(imgShadow,x-tileWidth/2,y+tileHeight/4,tileWidth,tileHeight/2);

			ctx.globalAlpha = 1;
		}
		if (this.item.icon) {ctx.drawImage(this.item.icon,x-tileWidth/2,y-tileHeight/2,tileWidth,tileHeight);}
	},
	collideEntity: function(entity) {
		this.supr(entity);
		if (entity instanceof Car && this.item instanceof MoonDust) {
			gameCash += this.item.value;
			this.destroy();
		}
	},
	damage: function() {
	},
});
