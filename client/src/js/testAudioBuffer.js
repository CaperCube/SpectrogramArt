// From: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBuffer
// Freq analyser question: https://stackoverflow.com/questions/43867902/web-audio-analyze-entire-buffer

// Drawing a spectrogram: https://www.youtube.com/watch?v=hYNJGPnmwls
// Codepen from the video: https://codepen.io/jakealbaugh/pen/jvQweW/

// Init canvas
const specCanvas = $("#spectrogram");
const specCtx = specCanvas.getContext("2d");
specCanvas.width = 500;
specCanvas.height = 400;
specCanvas.style.width = `500px`;
specCanvas.style.height = `400px`;

// Init audio context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
audioCtx.fftSize = 256; //512, 256, 2048, 4096; data resolution
//const analyser = audioCtx.createAnalyser(); // This will be used to analyse the frequencies
//const scp = audioCtx.createScriptProcessor(256, 0, 1);

//Heatmap gradient
var heatmapGradient = [
    [
        0,
        [0,0,0]
    ],
    [
        25,
        [0,0,255]
    ],
    [
        50,
        [255,0,0]
    ],
    [
        75,
        [255,255,0]
    ],
    [
        100,
        [255,255,255]
    ]
];

// Picks a hex color somewhere between two values
function pickHex(color1, color2, weight) {
    var p = weight;
    var w = p * 2 - 1;
    var w1 = (w/1+1) / 2;
    var w2 = 1 - w1;
    var rgb = [Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)];
    return rgb;
}

function sampleGradient(grad, sample) {
    let colorRange = []
    for (let i = 0; i < grad.length - 1; i++) {
        if (sample >= grad[i][0] && sample < grad[i+1][0]) {
            colorRange = [i, i+1];
            break;
        }
        else {
            colorRange = [0, grad.length-1];
        }
    }
        
    //Get the two closest colors
    let firstcolor = grad[colorRange[0]][1];
    let secondcolor = grad[colorRange[1]][1];
    
    //Calculate ratio between the two closest colors
    let firstcolor_x = (grad[colorRange[0]][0]);
    let secondcolor_x = (grad[colorRange[1]][0]) - firstcolor_x;
    let slider_x = sample - firstcolor_x;
    let ratio = slider_x/secondcolor_x;
    
    //Get the color with pickHex(thx, less.js's mix function!)
    return pickHex( secondcolor, firstcolor, ratio );
}

function normalize(val, max, min) { return (val - min) / (max - min); }
const clampNumber = (num, a, b) => Math.max(Math.min(num, Math.max(a, b)), Math.min(a, b));

function TestBuffer(seconds, volume) {
    // var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    var myArrayBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * seconds, audioCtx.sampleRate);

    // Fill the buffer with white noise;
    // just random values between -1.0 and 1.0
    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
        // This gives us the actual ArrayBuffer that contains the data
        var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < myArrayBuffer.length; i++) {
            // Math.random() is in [0; 1.0]
            // audio needs to be in [-1.0; 1.0]
            //nowBuffering[i] = Math.random() * 2 - 1;
            //const freq = Math.random() * 2 - 1;
            //const freq = clampNumber(Math.sin(i/(80 - (i/500))), -1, 1);
            const f = 50 - (Math.tan(i/2000) * 0.5);

            //const f = 20 - (Math.sin(i/1000) * 0.5);
            //const freq = clampNumber( Math.sin(i/(40-(i/1000))), -1, 1);//(f));
            const freq = Math.sin(i/(f));
            //const freq = clampNumber(Math.sin(i/(20)), -1, 1);

            //const freq = Math.sin(i/(30));
            const val = (freq) * volume;
            nowBuffering[i] = val;   
        }
    }

    //DrawColorWaveFromBuffer(nowBuffering, volume);
    DrawSpectrogramFromBuffer(myArrayBuffer, volume);

    // Get an AudioBufferSourceNode.
    // This is the AudioNode to use when we want to play an AudioBuffer
    var source = audioCtx.createBufferSource();
    // set the buffer in the AudioBufferSourceNode
    source.buffer = myArrayBuffer;
    // connect the AudioBufferSourceNode to the
    // destination so we can hear the sound
    source.connect(audioCtx.destination);
    // start the source playing
    source.start();
}

function DrawColorWaveFromBuffer(buffer, vol) {
    // Init canvas size
    specCanvas.width = buffer.length;//audioCtx.sampleRate * seconds;

    for (var i = 0; i < buffer.length; i++) {
        // Draw audio values
        //const normalVal = (normalize(val, 1, -1)) * 100 * volume;
        //const heatColor = sampleGradient(heatmapGradient, normalVal);
        const normalVal = (normalize(buffer[i], 1, -1)) * 100 * vol;
        const heatColor = sampleGradient(heatmapGradient, normalVal);
        specCtx.fillStyle = `rgb(${heatColor[0]}, ${heatColor[1]}, ${heatColor[2]})`;
        specCtx.fillRect(i, 0, 1, specCanvas.height);
    }
}

function DrawSpectrogramFromBuffer(buff, vol) {
    // Init stream & analyser
    //const source = audioCtx.createMediaStreamSource(buffer);
    //const source = audioCtx.createBufferSource(buffer);
    //source.buffer = buffer;

    //analyser.connect(source);

    // Reset canvas width
    //chunk.length
    specCanvas.height = 1024;
    specCanvas.width = buff.length / (256);
    // specCanvas.style.height = `${specCanvas.height}px`;
    specCanvas.style.height = `${400}px`;
    specCanvas.style.width = `${specCanvas.width}px`;

    specCtx.fillStyle = 'hsl(280, 100%, 10%)';
    specCtx.fillRect(0, 0, specCanvas.width, specCanvas.height);
    canvasChunkNum = 0;

    // Create a new offline audio context (use this for non-realtime things)
    const offline = new OfflineAudioContext(1, buff.length, audioCtx.sampleRate);
    let bufferSource = offline.createBufferSource();
    bufferSource.buffer = buff;

    // Create a new analyser based on the offline context
    const analyser = offline.createAnalyser();
    //const scp = offline.createScriptProcessor(256, 0, 1);
    const scp = offline.createScriptProcessor(256, 0, 1);

    // Connect the bufferSource to the analyser
    bufferSource.connect(analyser);
    scp.connect(offline.destination);

    // get frequency data
    const freqData = new Uint8Array(analyser.frequencyBinCount);
    scp.onaudioprocess = function() {
        analyser.getByteFrequencyData(freqData);
        console.log(freqData);
        
        // Draw data here
        drawFreqDataChunk(freqData);
    }

    bufferSource.start(0);
    offline.oncomplete = function(e){
        console.log("analysed");
    }

    offline.startRendering();
}

let canvasChunkNum = 0;

function drawFreqDataChunk(chunk) {
    // Init canvas size
    //specCanvas.width += chunk.length;//audioCtx.sampleRate * seconds;
    //specCtx.fillStyle = 'hsl(280, 100%, 10%)';
    //specCtx.fillRect(x, 0, specCanvas.width, specCanvas.height);
    const lineSize = 1;
    canvasChunkNum += lineSize;
    //specCanvas.width = canvasChunkNum;

    for (var i = 0; i < chunk.length; i++) {
        // Set data
        const ratio = clampNumber((chunk[i] / 255), 0, 1);
        const hue = Math.round((ratio * 120) + 280 % 360);
        const sat = `100%`;
        const lit = `${10 + (70 * ratio)}%`;
        const h = (specCanvas.height / chunk.length);
        const x = canvasChunkNum; //specCanvas.width - 1;

        //specCtx.fillStyle = 'hsl(280, 100%, 10%)';
        //specCtx.fillRect(0, 0, specCanvas.width, specCanvas.height);

        // Set line style
        specCtx.lineWidth = lineSize;
        //specCtx.strokeStyle = `hsl(${hue}, ${sat}, ${lit})`;
        // Draw values
        //specCtx.beginPath();
        //specCtx.moveTo(x, specCanvas.height - (i * h));
        //specCtx.lineTo(x, specCanvas.height - ((i * h) + h));
        //specCtx.stroke();
        //specCtx.closePath();
        specCtx.fillStyle = `hsl(${hue}, ${sat}, ${lit})`;
        specCtx.fillRect(x, specCanvas.height - (i * h), h, h);
    }
}