// From: https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createBuffer

function TestBuffer(seconds, volume) {
    var audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create an empty three-second stereo buffer at the sample rate of the AudioContext
    var myArrayBuffer = audioCtx.createBuffer(2, audioCtx.sampleRate * seconds, audioCtx.sampleRate);

    // Fill the buffer with white noise;
    // just random values between -1.0 and 1.0
    for (var channel = 0; channel < myArrayBuffer.numberOfChannels; channel++) {
        // This gives us the actual ArrayBuffer that contains the data
        var nowBuffering = myArrayBuffer.getChannelData(channel);
        for (var i = 0; i < myArrayBuffer.length; i++) {
            // Math.random() is in [0; 1.0]
            // audio needs to be in [-1.0; 1.0]
            //nowBuffering[i] = Math.random() * 2 - 1;
            nowBuffering[i] = (Math.sin(i/8) * 2 - 1) * (Math.sin(i/1500) * volume);
        }
    }
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