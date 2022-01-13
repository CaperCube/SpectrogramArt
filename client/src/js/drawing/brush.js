// Getting tablets to work in Chrome
// https://support.google.com/chrome/thread/5167714?hl=en


// Color picker
// https://www.w3schools.com/tags/att_input_type_color.asp


// w3 schools Image data
// https://www.w3schools.com/tags/canvas_getimagedata.asp

// ctx.getImageData will grab a section of the canvas and save it as imgae data

// var imgData = ctx.getImageData(0, 0, c.width, c.height);

////////////////////////////////////////
// Steps to save drawing to layer:
////////////////////////////////////////

/*

1. if paintMode, use ctx.lineTo(mousePos) and ctx.stroke() to draw lines on mouse-move

2. on mouse-up,
    * Stop drawing all layers and canvas BG (for one frame)
    * Get min and max coordinates of lines drawn
    * use ctx.getImageData(sx, sy, ex, ey) to get image data of the lines

3. Save image data in the layer object as a seperate image to be draw on top of the layer's main image
*/

////////////////////////////////////////
// Steps to erase drawings:
////////////////////////////////////////

/*

1. Get pixels under the brush
    var gotData = image.getImageData(mouseX - (brushSixe/2), mouseY - (brushSixe/2), brushSize, brushSize)
2. Loop through all pixels in gotData.data[]
3. 

*/

window.addEventListener("pointermove", changePressure);

function changePressure(e) {
    if (e.pointerType == "pen") {
        penPressure = e.pressure * brushSize;
        console.log(penPressure);
        //penPressure ++;
    }
    else penPressure = brushSize;
}

var softBrushMode = false;
var paintMode = false;
var isPainting = false;

var eraseMode = false;
var isErasing = false;
var eraserLine = [];

var penPressure = 10;
var brushSize = 4;
var paintColor = "#000000";

var hiddenCanvas = $("#paintSaver_canvas");
var paintSaver = hiddenCanvas.getContext("2d");

var customBrushImage;
var brushOpacity = 1;
var brushSpacing = 10;

function loadBrush() {
    customBrushImage = new Image(256, 256);
    customBrushImage.src = "img/SoftBrush.png";
    
    customBrushImage.addEventListener('load', (event) => {
        recolorCustomBrush(customBrushImage);
        //console.log("loaded");
        // Image is continually loaded for an unknown reason
    });
    
}

function recolorCustomBrush(brushImage) {
    // Create context
    var tempCanvas = document.createElement("canvas");
    var tempCtx = tempCanvas.getContext("2d");
    tempCanvas.width = brushImage.naturalWidth;
    tempCanvas.height = brushImage.naturalHeight;
    
    // Draw and save data
    //tempCtx.fillRect(0,0,256,256);
    tempCtx.drawImage(brushImage, 0, 0, brushImage.naturalWidth, brushImage.naturalHeight);
    var brushData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    
    tempCtx.putImageData(setImageColor(brushData, paintColor), 0, 0);
    //tempCtx.putImageData(brushData, 0, 0);
    
    customBrushImage.src = tempCanvas.toDataURL("image/png");
}

//loadBrush();

////////////////////////////////////////
// Paint
////////////////////////////////////////

// onMouseDown (in canvas)
function startPaint( l, mx, my ) {
    if (l && !l.locked) {
        if (paintMode && !isPainting) {
            isPainting = true;
            l.wetPaint = [ {X: mx, Y: my, color: paintColor, size: penPressure} ];//brushSize ];
        }
    }
    placePaint( l, mx, my );
}

// onMouseMove
// l = layer[listSelectedLayerID]
function placePaint( l, mx, my ) {
    if (l) {
        if (paintMode && isPainting) {
            // place line points in selected layer's "wetPaint" array
            var p = {X: mx, Y: my, color: paintColor, size: penPressure};//brushSize};
            l.wetPaint.push(p);
        }
    }
}

// onMouseUp
function dryPaint(l) {
    isPainting = false;
    if (l) {
        // Save old version in chace
        //l.pastPaint.push(l.dryPaint);
        //l.pastPaint[1] = l.dryPaint;
        
        if (paintMode) {
            // Get bounding size of all wet paint
//            var left = l.wetPaint[0].X;
//            var right = l.wetPaint[0].X;
//            var top = l.wetPaint[0].Y;
//            var bottom = l.wetPaint[0].Y;
//
//            for (var i = 0; i < l.wetPaint.length; i++) {
//                if (left > i.x) left = i.x
//                if (right < i.x) right = i.x
//                if (top > i.y) top = i.y
//                if (bottom < i.y) bottom = i.y
//            }
//
//            left -= (brushSize/2);
//            right += (brushSize/2);
//            top -= (brushSize/2);
//            bottom += (brushSize/2);

            // Get size of dry paint
//            if (l.dryPaint != null) {
//                if (left > dryPaint.width) left = dryPaint.left;
//                if (right < dryPaint.right) right = dryPaint.right;
//                if (top > dryPaint.top) top = dryPaint.top;
//                if (bottom < dryPaint.bottom) bottom = dryPaint.bottom;
//            }

            // Dry paint
            ctx.clearRect(0, 0, cWidth, cHeight);
            //l.renderPaint();
            renderPaint(l);
            //l.renderPaint(l.rotation);
            
            //hiddenCanvas.width = cWidth;
            //hiddenCanvas.height = cHeight;
            hiddenCanvas.width = l.imageSize.X;
            hiddenCanvas.height = l.imageSize.Y;
            paintSaver.drawImage(canvas, l.position.X, l.position.Y, l.imageSize.X, l.imageSize.Y, 0, 0, l.imageSize.X, l.imageSize.Y);
            /*
            drawImageCenter(
                canvas,
                l.position.X + l.imageSize.X/2,
                l.position.Y + l.imageSize.Y/2,
                l.imageSize.X/2,
                l.imageSize.Y/2,
                1 / l.scale.X,
                1 / l.scale.Y,
                l.rotation * (-1),
                paintSaver
            );
            */
            
            var dryPaint = hiddenCanvas.toDataURL("image/png");
            var img = new Image(l.imageSize.X, l.imageSize.Y);
            img.src = dryPaint;
            
            // Add to old image somehow
            l.paintPos = l.position;
            l.dryPaint = img;
            l.wetPaint = null;
            
            ctx.clearRect(0, 0, cWidth, cHeight);
            
            //console.log(l.dryPaint);
        }
        
        // Save last step
        l.pastPaint[0] = l.dryPaint;
    }
}

////////////////////////////////////////
// Erase
////////////////////////////////////////

function erasePixels( l, mx, my ) {
    if (l) {
        if (eraseMode && isErasing) {
            //1. Paint lines the same color as BG
            //2. Use the inverse of the eraserLines alpha channel on the paint image
            
            // Put lines in eraserLines
            var p = { X: mx, Y: my };
            if (eraserLine.length < 1) eraserLine[0] = p;
            else eraserLine.push(p);
            
            drawEraserPaint();
        }
    }
}

function eraseHard(d) {
    // loop through data and set to 0
    for (var i = 0; i < d.data.length; i += 4) {
        d.data[i + 3] = 0; // alpha
    }
    
    //img.putImageData(eraseHard(gotData.data));
    return d;
};

function eraseWithData(de, di) {
    // loop through data and set to 0
    for (var i = 0; i < di.data.length; i += 4) {
        if ((di.data[i + 3] > 0) && (de.data[i + 3] > 0))
            di.data[i + 3] = (255 - de.data[i + 3]); // alpha
    }
    
    //img.putImageData(eraseHard(gotData.data));
    return di;
}

// onMouseDown (in canvas)
function startErase( l, mx, my ) {
    if (l && !l.locked) {
        if (eraseMode && !isErasing) {
            isErasing = true;
            eraserLine = [ { X: mx, Y: my } ];
            //l.wetPaint = [ {X: mx, Y: my, color: paintColor, size: brushSize} ];
        }
    }
    //placePaint( l, mx, my );
    erasePixels( l, mx, my );
}

// On mouseUp
function clearEraserLines(l) {
    if (l && eraseMode) {
        // Save old version in chace
        //l.pastPaint.push(l.dryPaint);
        l.pastPaint[1] = l.dryPaint;
        
        //var s = getEraserPaintSize();

        // Get image data
        ctx.clearRect(0, 0, cWidth, cHeight);
        //l.renderPaint();
        renderPaint(l);
        
        //var imgD = ctx.getImageData(s.left, s.top, s.right, s.bottom);
        var imgD = ctx.getImageData(l.position.X, l.position.Y, l.imageSize.X, l.imageSize.Y);

        // Get eraser data
        ctx.clearRect(0, 0, cWidth, cHeight);
        drawEraserPaint();

        //var eraseD = ctx.getImageData(s.left, s.top, s.right, s.bottom);
        var eraseD = ctx.getImageData(l.position.X, l.position.Y, l.imageSize.X, l.imageSize.Y);



        // draw to hidden canvas for saving
        //ctx.putImageData(eraseWithData(eraseD, imgD), s.left, s.top);
        ctx.putImageData(eraseWithData(eraseD, imgD), l.position.X, l.position.Y);



        // Grab data from hidden canvas and save
        hiddenCanvas.width = cWidth;
        hiddenCanvas.height = cHeight;
        paintSaver.drawImage(canvas, l.position.X, l.position.Y, l.imageSize.X, l.imageSize.Y, 0, 0, l.imageSize.X, l.imageSize.Y);
        /*
        drawImageCenter(
            canvas,
            l.position.X + l.imageSize.X/2,
            l.position.Y + l.imageSize.Y/2,
            l.imageSize.X/2,
            l.imageSize.Y/2,
            1 / l.scale.X,
            1 / l.scale.Y,
            l.rotation * (-1),
            paintSaver
        );
        */

        var dryPaint = hiddenCanvas.toDataURL("image/png");
        var img = new Image();
        img.src = dryPaint;

        // Add to old image somehow
        l.paintPos = l.position;
        l.dryPaint = img;
        //l.wetPaint = null;

        //l.renderPaint();

        // End
        
        // Save last step
        l.pastPaint[0] = l.dryPaint;
    }
    isErasing = false;
    //console.log("Erasing: " + isErasing);
    eraserLine = [];
    //console.log(eraserLine.length);
}

// On render
function drawEraserPaint() {
    //eraserLine;
    //bgColor
    if (eraseMode && eraserLine.length > 0) {
        
        //console.log("drawing eraser");
        
        ctx.beginPath();
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = bgColor;
        ctx.lineWidth = brushSize;
        ctx.moveTo(eraserLine[0].X, eraserLine[0].Y);

        for (var i = 1; i < eraserLine.length; i++) {
            ctx.lineTo(eraserLine[i].X, eraserLine[i].Y);
        }
        ctx.stroke();
    }
}

function getEraserPaintSize() {
    // Get bounding size of all wet paint
    var box;
    if (eraserLine.length > 0) {
    box = {
        left: eraserLine[0].X,
        right: eraserLine[0].X,
        top: eraserLine[0].Y,
        bottom: eraserLine[0].Y
    };

    for (var i = 0; i < eraserLine.length; i++) {
        if (box.left > i.x) box.left = i.x
        if (box.right < i.x) box.right = i.x
        if (box.top > i.y) box.top = i.y
        if (box.bottom < i.y) box.bottom = i.y
    }
    
    box.left -= (brushSize/2);
    box.right += (brushSize/2);
    box.top -= (brushSize/2);
    box.bottom += (brushSize/2);
        
    }
    return box;
}

////////////////////////////////////////
// Other
////////////////////////////////////////
/*
function eraseHard(d) {
    // loop through data and set to 0
    for (var i = 0; i < d.data.length; i += 4) {
        d.data[i + 3] = 0; // alpha
    }
    
    //img.putImageData(eraseHard(gotData.data));
    return d;
};
*/

function invert(d) {
    for (var i = 0; i < d.data.length; i += 4) {
        d.data[i]     = 255 - d.data[i];     // red
        d.data[i + 1] = 255 - d.data[i + 1]; // green
        d.data[i + 2] = 255 - d.data[i + 2]; // blue
        d.data[i + 3] = 255 - d.data[i + 3]; // alpha
    }
    //ctx.putImageData(imageData, 0, 0);
    return d;
};

function setImageColor(d, hex) {
    
    var rgbColor = HextoRGB(hex);
    
    for (var i = 0; i < d.data.length; i += 4) {
        d.data[i]     = rgbColor.Red;     // red
        d.data[i + 1] = rgbColor.Green; // green
        d.data[i + 2] = rgbColor.Blue; // blue
        //d.data[i + 3] = d.data[i + 3]; // alpha
    }
    //ctx.putImageData(imageData, 0, 0);
    return d;
};

function sampleColor() {
    
    var pick = "#000000";
    
    // Stop drawing brush preview
    //
    
    // get image data from mouse position
    var sample = ctx.getImageData(mouseX, mouseY, 1, 1);
    var s = {
        Red: sample.data[0],
        Green: sample.data[1],
        Blue: sample.data[2]
    };
    
    pick = RGBtoHex(s);
    
    console.log("Red: " + s.Red + "\nGreen: " + s.Green + "\nBlue: " + s.Blue);
    console.log(pick);
    
    return pick;
    //paintColor = pick;
    //$("#color_pick").value = pick;
}