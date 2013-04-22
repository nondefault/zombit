//viewport settings
viewWidth = 320;
viewHeight = 240;
viewX = 0;
viewY = 0;

//output settings
screenWidth = 640;
screenHeight = 480;

function render() {
  //clear screen
  ctx.fillStyle = "black";
  ctx.fillRect(0,0,viewWidth,viewHeight);

  //TEST DRAWING, REMOVE
  ctx.strokeStyle = "white";
  strokeEllipse(ctx,viewWidth/4,viewHeight/4,viewWidth/2,viewHeight/2);

  //apply shaders
  //shader(srand);
  shader(sblur);

  //draw fps
  ctx.fillStyle = "black";
  ctx.fillRect(2,10,60,14);
  ctx.fillStyle = "white";
  ctx.fillText("FPS: "+(~~fps),4,20);
  
	//copy buffer to screen at proper scale
	sctx.drawImage(buffer,0,0,screenWidth,screenHeight);
}

//shader function, pass function(data,xPixel,yPixel,RedVal,BlueVal,GreenVal) that returns [r,g,b]
function shader(func) {
  var id = ctx.getImageData(0,0,viewWidth,viewHeight);
  var dat = id.data;
  //var d2 = dat.clone();
  for (var x=0; x<viewWidth; x++) {
    for (var y=0; y<viewHeight; y++) {
      var r = dat[ri(x,y)];
      var g = dat[bi(x,y)];
      var b = dat[gi(x,y)];
      var result = func(dat,x,y,r,g,b);

      dat[ri(x,y)]=result[0];
      dat[gi(x,y)]=result[1];
      dat[bi(x,y)]=result[2];
    }
  }
  ctx.putImageData(id,0,0);
}

//color indexes
function ri(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y*viewHeight))*4+0;}
function gi(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y*viewHeight))*4+1;}
function bi(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y*viewHeight))*4+2;}
function ai(x,y) {return ((x<0?0:x>viewWidth?viewWidth:x)+(y*viewHeight))*4+3;}

function sthresh(d,x,y,r,g,b) { //threshold
  var res = [0,0,0];
  res[0] = r>127?255:0;
  res[1] = g>127?255:0;
  res[2] = b>127?255:0;
  return res;
}

function srand(d,x,y,r,g,b) { //noise
  var res = [0,0,0];
  var ra = frand()*255;
  res[0] = ra;
  res[1] = ra;
  res[2] = ra;
  return res;
}

function sblur(d,x,y,r,g,b) { //red channel blur + threshold
  var res = [0,0,0];
  res[0] = (d[ri(x-1,y)]+d[ri(x+1,y)])/2;
  res[1] = g>127?255:0;
  res[2] = b>127?255:0;
  return res;
}

function strokeEllipse(ctx, x, y, w, h) {
  var kappa = .5522848,
      ox = (w / 2) * kappa, // control point offset horizontal
      oy = (h / 2) * kappa, // control point offset vertical
      xe = x + w,           // x-end
      ye = y + h,           // y-end
      xm = x + w / 2,       // x-middle
      ym = y + h / 2;       // y-middle

  ctx.beginPath();
  ctx.moveTo(x, ym);
  ctx.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
  ctx.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
  ctx.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
  ctx.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  ctx.closePath();
  ctx.stroke();
}