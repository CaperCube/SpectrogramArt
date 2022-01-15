//
//
// WavAudioEncoder Buffer encoder
//
//


// sampleRate is in Hz... NOT kHz
// 44.1 kHz = 44100 Hz
// 48 kHz = 48000 Hz
//var sampleRate = 48000
var numChannels = 1//2;
var encoder

// function ChangeSampleRate() {
//     sampleRate = $("#samplerate_select").value;
// }

function EncodeAndReturn(b) {
    encoder = new WavAudioEncoder(sampleRate, numChannels);
    encoder.encode(b);
    return encoder.finish();
}

//
//
// Encode and save the buffer to a WAV file
//
//


function SaveWAV(buff) {
    console.log(buff)
    //Encode Buffer
    //var tempBuffs = [buff.get().getChannelData(0), buff.get().getChannelData(1)];
    var tempBuffs = [buff.getChannelData(0)]//, buff.getChannelData(1)];
    
    //Get Song name
    var fName = "CoolSoundBro";
    
    //Return Blob
    var saveSound = EncodeAndReturn(tempBuffs);
    downloadFile(saveSound, (fName + ".wav"));
}

function downloadFile(blobObject, fileName) {
  // Create an invisible A element
  const a = document.createElement("a");
  a.style.display = "none";
  document.body.appendChild(a);

  // Set the HREF to a Blob representation of the data to be downloaded
  a.href = window.URL.createObjectURL(blobObject);

  // Use download attribute to set set desired file name
  a.setAttribute("download", fileName);

  // Trigger the download by simulating click
  a.click();

  // Cleanup
  window.URL.revokeObjectURL(a.href);
  document.body.removeChild(a);
}