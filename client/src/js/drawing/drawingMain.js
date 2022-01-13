////////////////////////////////////////////////////////
// Canvas and draw variables
////////////////////////////////////////////////////////
var canvas = $("#draw_canvas");

var desiredCanvasSize = {x: 400, y: 400};
var cWidth = canvas.width = desiredCanvasSize.x;
var cHeight = canvas.height = desiredCanvasSize.y;

var ctx = canvas.getContext("2d");
var bgColor = "#ffffff";
var hbDebug = false;

function resizeCanvas(w,h) {
    cWidth = canvas.width = $("#draw_canvas").style.width = w;
    cHeight = canvas.height = $("#draw_canvas").style.height = h;
    // change css
}

// Mouse vars
var mouseX = 0, mouseY = 0;
var selDeltaX = 0, selDeltaY = 0;
var lmbDown = false;

// Game vars
var roundTime = 0;
var roundTimer;
var allowDrawing = false;
var drawingSubmitted = false;

// Drawing vars
paintMode = true;
eraseMode = false;

// Layer vars
var defaultImage = new Image(desiredCanvasSize.x, desiredCanvasSize.y);
defaultImage.src = "";
var layer = [ new Obj(defaultImage, "myLayer", 0, 0) ];
layer[0].imageSize.X = desiredCanvasSize.x;
layer[0].imageSize.Y = desiredCanvasSize.y;

////////////////////////////////////////////////////////
// Brush functions
////////////////////////////////////////////////////////
function setBrushUI() {
    // if (paintMode) {
    //     toggleClass("#paint_button", "selected", true);
    //     toggleClass("#erase_button", "selected", false);        
    // }
    // else {
    //     toggleClass("#erase_button", "selected", true);
    //     toggleClass("#paint_button", "selected", false);
    // }

    // switch(brushSize) {
    //     case 20:
    //         setBrushSizeUI("#s6");
    //         break;
    //     case 16:
    //         setBrushSizeUI("#s5");
    //         break;
    //     case 12:
    //         setBrushSizeUI("#s4");
    //         break;
    //     case 8:
    //         setBrushSizeUI("#s3");
    //         break;
    //     case 4:
    //         setBrushSizeUI("#s2");
    //         break;
    //     case 2:
    //         setBrushSizeUI("#s1");
    //         break;
    // }

    // switch(paintColor) {
    //     case "#000000":
    //         setBrushColorUI("#colorBlack_button");
    //         break;
    //     case "#AAAAAA":
    //         setBrushColorUI("#colorWhite_button");
    //         break;
    //     case "#FF0000":
    //         setBrushColorUI("#colorRed_button");
    //         break;
    //     case "#FF8800":
    //         setBrushColorUI("#colorOrange_button");
    //         break;
    //     case "#FFFF00":
    //         setBrushColorUI("#colorYellow_button");
    //         break;
    //     case "#00FF00":
    //         setBrushColorUI("#colorGreen_button");
    //         break;
    //     case "#00FFFF":
    //         setBrushColorUI("#colorBlue_button");
    //         break;
    //     case "#0000FF":
    //         setBrushColorUI("#colorIndego_button");
    //         break;
    //     case "#FF00FF":
    //         setBrushColorUI("#colorViolet_button");
    //         break;
    // }
}

function setBrushSizeUI(o) {
    toggleClass("#s6", "selected", false);
    toggleClass("#s5", "selected", false);
    toggleClass("#s4", "selected", false);
    toggleClass("#s3", "selected", false);
    toggleClass("#s2", "selected", false);
    toggleClass("#s1", "selected", false);
    toggleClass(o, "selected", true);
}

function setBrushColorUI(o) {
    toggleClass("#colorBlack_button", "selected", false);
    toggleClass("#colorWhite_button", "selected", false);
    toggleClass("#colorRed_button", "selected", false);
    toggleClass("#colorOrange_button", "selected", false);
    toggleClass("#colorYellow_button", "selected", false);
    toggleClass("#colorGreen_button", "selected", false);
    toggleClass("#colorBlue_button", "selected", false);
    toggleClass("#colorIndego_button", "selected", false);
    toggleClass("#colorViolet_button", "selected", false);
    toggleClass(o, "selected", true);
}

function toggleClass(o, cn, addOrRemove) {
    if ( addOrRemove ) {
        $(o).classList.add(cn);
      } else {
        $(o).classList.remove( cn );
      }
}

function paintToggle() {
    paintMode = true;
    eraseMode = false;

    setBrushUI();
}

function eraseToggle() {
    paintMode = false;
    eraseMode = true;

    setBrushUI();
}

function changeBrushSize(s) {
    brushSize = s;
    setBrushUI();
}

function changeBrushColor(col) {
    paintColor = col;
    setBrushUI();
}

function toggleDebug() {
    hbDebug = !hbDebug;
}

function undoDrawing() {
    // Restore undo-state
    console.log("Undo");

    var tempPaint = layer[0].dryPaint;
    layer[0].dryPaint = layer[0].pastPaint[1];
    layer[0].pastPaint[1] = tempPaint;
}

function clearCanvas() {
    layer[0].dryPaint = new Image(desiredCanvasSize.x, desiredCanvasSize.y);
    layer[0].pastPaint[1] = new Image(desiredCanvasSize.x, desiredCanvasSize.y);
}

//////////////////////////////////////////////////////
// Keyboard Events
//////////////////////////////////////////////////////
var ctrlDown = false;

window.addEventListener("keydown", function(e) {
    if (allowDrawing) {
        // 17 = control
        if (e.keyCode === 17) {
            ctrlDown = true;
            console.log(ctrlDown);
        }
        // 90 = z
        if (e.keyCode === 90) {
            if (ctrlDown) {
                // undo
                undoDrawing();
            }
            //console.log(layer[slider].obImg.src);
        }
        // 219 = [
        if (e.keyCode === 219) {
            //if (brushSize > 1) {
                //brushSize -= 1;
                //changeBrushSize(s);
            //}
        }
        
        // 221 = ]
        if (e.keyCode === 221) {
            //if (brushSize < 100) {
                //brushSize += 1;
                //changeBrushSize(s);
            //}
        }

        // 66 = b
        if (e.keyCode === 66) paintToggle();
        
        // 69 = e
        if (e.keyCode === 69) eraseToggle();
    }

});
window.addEventListener("keyup", function(e) {
    if (allowDrawing) {
        // 17 = control
        if (e.keyCode === 17) {
            ctrlDown = false;
        }
    }
})

//////////////////////////////////////////////////////
// Mouse & Touch Events
//////////////////////////////////////////////////////
window.addEventListener("mousemove", mouseMove);
function mouseMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    
    // Paint mode
    placePaint(layer[0], mouseX, mouseY);
    
    // Erase mode
    erasePixels(layer[0], mouseX, mouseY);
}

function mouseInCanvas() {
    var check = false;
    if (mouseX > 0 &&
       mouseX < cWidth &&
       mouseY > 0 &&
       mouseY < cHeight) {
        check = true;
        //console.log("mouse is in canvas");
    }
    return check;
}

window.addEventListener("mousedown", mouseDown);
function mouseDown(e) {
    lmbDown = true;
    
    //if (mouseCollide != null) {
    if (mouseInCanvas() && allowDrawing) {
        
        layer[0].pastPaint[1] = layer[0].dryPaint;

        // Paint mode
        startPaint(layer[0], mouseX, mouseY);
        
        // Erase mode
        startErase(layer[0], mouseX, mouseY);        
        //if (eraseMode) isErasing = true;
    }
}

window.addEventListener("mouseup", mouseUp);
function mouseUp(e) {
    lmbDown = false;
    
    // Paint mode
    dryPaint(layer[0]);
    
    // Erase mode
    clearEraserLines(layer[0]);
}

//////////////////////////////////////////////////////
// Pen Events
//////////////////////////////////////////////////////

window.addEventListener('pointerup', mouseUp, false);
window.addEventListener('pointermove', pointerMove, false);
window.addEventListener('pointerup', mouseUp, false);

function pointerMove (_e, _el) {  
    var rect = canvas.getBoundingClientRect();
    
    if (typeof _e.offsetX === 'undefined') { // ff hack
        mouseX = _e.pageX - $(_el).offset().left - rect.left; 
        mouseY = _e.pageY - $(_el).offset().top - rect.top;
    }
    else {
        mouseX = _e.offsetX;
        mouseY = _e.offsetY;
    }
    return { x: mouseX, y: mouseY };
}

////////////////////////////////////////////////////////
// Init function
////////////////////////////////////////////////////////
function initDrawing(rt) {
    // Start timer
    roundTime = rt || 30;
    allowDrawing = true;
    drawingSubmitted = false;

    // Start timer
    roundTimer = setInterval(function() {
        roundTime--;
        $("#DOM_gameTimerDraw").innerHTML = roundTime;

        // When the round is over
        if (roundTime <= 0) {
            // End round and tell player the round is over
            lmbDown = false;
            // Paint mode
            dryPaint(layer[0]);
            // Erase mode
            clearEraserLines(layer[0]);
            allowDrawing = false;

            $("#DOM_gameTimerDraw").innerHTML = "Round Over!";

            // Auto send drawing to server
            if (!drawingSubmitted) submitDrawing();

            // Stop timer
            clearTimeout(roundTimer);
        }
    }, 1000);
    
    clearCanvas();
    render();
}

////////////////////////////////////////////////////////
// Render
////////////////////////////////////////////////////////
function render() {
    /////////////////////////////////////////////////////////
    // Clear & Draw
    /////////////////////////////////////////////////////////
    ctx.clearRect(0, 0, cWidth, cHeight);
    //ctx.fillStyle = bgColor;
    //ctx.fillRect(0,0,cWidth,cHeight);

    // Draw layer (with paint)
    if (layer[0] != null) draw(layer[0]);

    // Erase paint
    drawEraserPaint();

    /////////////////////////////////////////////////////////
    // Debug
    /////////////////////////////////////////////////////////
    if (hbDebug) {
        // Mouse Debug
        ctx.font = "10px Arial";
        ctx.fillStyle = "#99bbdd";
        
        ctx.fillText("X: " + Math.floor(mouseX), 5, cHeight - 25);
        ctx.fillText("Y: " + Math.floor(mouseY), 5, cHeight - 15);
        ctx.fillText("lmbDown: " + lmbDown, 5, cHeight - 5);

        // Canvas Center
        ctx.strokeStyle = "#bbb";
        ctx.lineWidth = 1;
        ctx.lineJoin = "miter";
        ctx.beginPath();
        ctx.moveTo(0, cHeight/2);
        ctx.lineTo(cWidth, cHeight/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cWidth/2, 0);
        ctx.lineTo(cWidth/2, cHeight);
        ctx.stroke();
    }

    // Loop render
    requestAnimationFrame( render );

    // Give me that beautiful canvas data <3
    return ctx;
}

setBrushUI();
resizeCanvas(desiredCanvasSize.x, desiredCanvasSize.y);