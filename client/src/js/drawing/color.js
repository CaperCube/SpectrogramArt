////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////
// Color Functions
////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////

function RandomRGB() {
    var col = {
        Red: 0,
        Green: 0,
        Blue: 0
    }

    col.Red = Math.floor( Math.random() * 255 );
    col.Green = Math.floor( Math.random() * 255 );
    col.Blue = Math.floor( Math.random() * 255 );

    return col;
}

function HextoRGB(hex) {
    var rgbColor = {
        Red: 0,
        Green: 0,
        Blue: 0
    };
    var hexColor = hex.substring(1);

    rgbColor.Red = parseInt(hexColor.substring(0,2), 16);
    rgbColor.Green = parseInt(hexColor.substring(2,4), 16);
    rgbColor.Blue = parseInt(hexColor.substring(4), 16);

    return rgbColor;
}

function RGBtoHex(rgb) {
    var rgbColor = rgb;

    // Cap value between 0 - 255
    if (rgbColor.Red >= 255) rgbColor.Red = 255;
    else if (rgbColor.Red <= 0) rgbColor.Red = 0;
    if (rgbColor.Green >= 255) rgbColor.Green = 255;
    else if (rgbColor.Green <= 0) rgbColor.Green = 0;
    if (rgbColor.Blue >= 255) rgbColor.Blue = 255;
    else if (rgbColor.Blue <= 0) rgbColor.Blue = 0;

    var hexColor = "#";
    
    var hexRed = Number(rgbColor.Red).toString(16);
    var hexGreen = Number(rgbColor.Green).toString(16);
    var hexBlue = Number(rgbColor.Blue).toString(16);
    
    if (hexRed.length < 2) hexRed = "0" + hexRed;
    if (hexGreen.length < 2) hexGreen = "0" + hexGreen;
    if (hexBlue.length < 2) hexBlue = "0" + hexBlue;
    
    hexColor += hexRed;
    hexColor += hexGreen;
    hexColor += hexBlue;

    return hexColor;
}


function rgbToHexSingle(rgb) {
    var hex = Number(rgb).toString(16);
}