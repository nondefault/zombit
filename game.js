var targetFPS = 60;
var fps = targetFPS;
var lt = new Date().getTime();
var gameLevel = null;

var tileWidth = 16;
var tileHeight = 16;

var entities = new Array();
var items = new Array();

var gameScore = 0;

//settings
var enableShaders = false;

//fps monitoring
var filterStrength = 20;
var frameTime = 0, lastLoop = new Date, thisLoop;
var fps = targetFPS;

function init() {
	//create container to center canvas
	canvContainer = document.createElement("center");
	document.getElementById("cc").appendChild(canvContainer);

	//create canvas element
	canvas = document.createElement("canvas");
	canvas.width = screenWidth;
	canvas.height = screenHeight;
	canvas.style.cursor = "none";
	canvContainer.appendChild(canvas);
	sctx = canvas.getContext("2d"); //screen context, shouldn't be draw onto usually

	//create invisible "buffer" canvas
	buffer = document.createElement("canvas");
	buffer.width = viewWidth;
	buffer.height = viewHeight;
	ctx = buffer.getContext("2d"); //buffer context

	//suggest to browsers not to antialias
	ctx.webkitImageSmoothingEnabled = false;
	ctx.mozImageSmoothingEnabled = false;
	ctx.imageSmoothingEnabled = false;	
	sctx.webkitImageSmoothingEnabled = false;
	sctx.mozImageSmoothingEnabled = false;
	sctx.imageSmoothingEnabled = false;	

	//clear buffer to black
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,viewWidth,viewHeight);

	//initialize advanced shader data
	oid = ctx.createImageData(viewWidth,viewHeight);
	dout = oid.data;
	for (var i=3; i<dout.length; i+=4) {dout[i] = 255;} //set to opaque

	loadResources();
	loadAudio();
	addListeners();
	startGame();
}

var imgOverlay, imgEntityGeneric, imgPlayer, aniImages=0;
function loadResources() {
	//deprecated
	for(var ii = 0; ii < aniImages.length; ii++) {
		console.log("loading animation: "+aniImages[ii]);
		var jj = new Image();
		jj.src = "res/animation/"+aniImages[ii];
		aniImages[ii] = jj;
	}
}

function tileImage(id) {
	return images[id];
}

function startGame() {
	//generate gameLevel
	gameLevel = generateRectRooms(120,120,16);
	//gameLevel = generateNoise(120,120,[WALL,FLOOR]);
	gameLevel = generatePlants(gameLevel,0.1);
	gameLevel = punchOutWalls(gameLevel,0.1);

	//create player
	player = new Player(50,50,"Player");
	player.inv.push(new Pistol());
	player.inv.push(new AssaultRifle());
	player.inv.push(new Typhoon());
	player.inv.push(new Gauss());
	player.inv.push(new WoodenBat());
	player.inv.push(new NyanGun());
	
	//spawn some zombies
	for (var i=0; i<15; i++) {
		var tx,ty,ta;
		do {
			tx = Math.round(Math.random()*(gameLevel.getWidth()-2))+1;
			ty = Math.round(Math.random()*(gameLevel.getHeight()-2))+1;
			ta = tileAt(tx,ty);
			if (ta!=null && ta.id==FLOOR) {break;}
		} while (true);
		new Zombie(tx*tileWidth+tileWidth/2, ty*tileHeight+tileHeight/2, 80);
	}

	//tell zombies to spawn continuously
	setInterval(function(){
		if (entities.length<50) {
		for (var i=0; i<1; i++) {
			var tx,ty,ta;
			do {
				tx = Math.round(Math.random()*(gameLevel.getWidth()-2))+1;
				ty = Math.round(Math.random()*(gameLevel.getHeight()-2))+1;
				ta = tileAt(tx,ty);
				if (ta!=null && ta.id==FLOOR) {break;}
			} while (true);
			new Zombie(tx*tileWidth+tileWidth/2, ty*tileHeight+tileHeight/2, 80);
		}}
	},500);

	//start music
	setTimeout(startPlaylist,4900);

	setTimeout(function(){dmode=GAME;},5000);

	//set interval for processing
	timer = setInterval(step,1000/targetFPS);
}

//delta function.  use to make fps scalable
function d(s) {
	return s;
	//return (60/fps)*s;
}

function step() {
	//store time
	time = new Date().getTime();

	//monitor fps
	var thisFrameTime = (thisLoop=time) - lastLoop;
	frameTime+= (thisFrameTime - frameTime) / filterStrength;
	lastLoop = thisLoop;
	fps = (1000/frameTime).toFixed(1);

	//process entities
	for (var ec = 0; ec<entities.length; ec++) {
    	var ent = entities[ec];
		if (ent instanceof Entity) {ent.step();}
	}

	//process particles
	for (var ec = 0; ec<particles.length; ec++) {
    	var prt = particles[ec];
		if (prt instanceof Particle) {prt.step();}
	}

	if (mouseLeft) {
		var item = player.inv.getSelected();
		if (item instanceof Weapon) {
			item.fire();
		}
	}

	//inv selection keys
	for (var nk=49; nk<58; nk++) {
		if (keys[nk]) {player.inv.select(nk-49);}
	}

	//reload
	if (keys[VK_R]) {if (player.inv.getSelected() instanceof Gun) {player.inv.getSelected().reload();}}

	//process items (gun timers, etc)
	for (var ic = 0; ic<items.length; ic++) {
    	ite = items[ic];
		if (ite instanceof Item) {ite.step();}
	}

	// Switch sprites on key events (for player)
	/*if (keys[VK_LEFT]) {viewX-=3;}
	if (keys[VK_RIGHT]) {viewX+=3;}
	if (keys[VK_UP]) {viewY-=3;}
	if (keys[VK_DOWN]) {viewY+=3;}*/

	//clip viewport position
	if (viewX<0) {viewX = 0;}
	if (viewX>gameLevel.getWidth()*tileWidth-viewWidth) {viewX = gameLevel.getWidth()*tileWidth-viewWidth;}
	if (viewY<0) {viewY = 0;}
	if (viewY>gameLevel.getHeight()*tileHeight-viewHeight) {viewY = gameLevel.getHeight()*tileHeight-viewHeight;}


	render();
}