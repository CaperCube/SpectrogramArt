// Helpful info: https://stackoverflow.com/questions/39540244/how-can-i-convert-an-image-to-audio-using-javascript

const loadWaveform = async (url) => {
    // Fetch waveform
    //const resp = await fetch(waveformUrl);
    const resp = await fetch('src/beep.wav');
    // Convert fetch to array buffer
    const waveDataBuffer = await resp.arrayBuffer();
    return waveDataBuffer;
    // Convert array buffer to audio buffer
    //const audioBuffer = await audioCtx.decodeAudioData(waveDataBuffer);
    //return audioBuffer;
}

console.log(loadWaveform(''));


function createBuffer() {
    const audioCtx = new AudioContext();
    //createBuffer(channels, length: seconds * sampleRate, sampleRate: in samples per second, typically 44100);
    const buffer = audioCtx.createBuffer(2, 22050, 44100);
    return buffer;
}