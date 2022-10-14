var audioCtx;

const AudioContextAPI = window.AudioContext || window.webkitAudioContext;
if (!AudioContextAPI) {
  console.log("Webaudio not supported!");
} else {
  audioCtx = new AudioContextAPI();
}

function playNoise(durationSec) {
  if (!audioCtx) {
    console.log("Web audio not supported");
    return;
  }
  // Stereo
  let channels = 2;
  // Create an empty two second stereo buffer at the
  // sample rate of the AudioContext
  let duration = 2.0;
  if (!isNaN(durationSec)) {
    duration = durationSec;
  }
  console.log("Generating noise with duration: " + duration + "[sec]");
  const frameCount = audioCtx.sampleRate * duration;

  var buffer = audioCtx.createBuffer(channels, frameCount, audioCtx.sampleRate);

  for (let channel = 0; channel < channels; channel++) {
    const nowBuffering = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      nowBuffering[i] = Math.random() - 0.5;
    }
  }

  var source = audioCtx.createBufferSource();
  source.buffer = buffer;
  var gainNode = audioCtx.createGain();
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  let gain = parseFloat(g_params["gain"]);
  if (isNaN(gain)) {
    gain = 0.2;
  }
  console.log("Setting gain: " + gain);
  gainNode.gain.value = gain;

  source.start();

  source.onended = () => {
    console.log("White noise finished.");
  };
}

function playFromUrlParam() {
  var url = g_params["url"];
  if (url == null) {
    url = "mov_bbb.wav";
  }
  playFromFile(url);
}

function playFromFile(url) {
  console.log("Will play url: " + url);

  var request = new XMLHttpRequest();
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';
  request.onloadend = function() {
    console.log("Got audio file");
    if (request.status != 200 || request.response.length <= 0) {
      console.log("Got empty response");
      return;
	}
	
    console.log("Start decoding");
    audioCtx.decodeAudioData(request.response, function(buffer) {
	  console.log("Audio data decoded: " + buffer);
      var source = audioCtx.createBufferSource();
      source.buffer = buffer;

      var gainNode = audioCtx.createGain();
      source.connect(gainNode);
      gainNode.connect(audioCtx.destination);
     
      gainNode.gain.value = 0.7;
      let gain = parseFloat(g_params["gain"]);
      if (!isNaN(gain)) {
        console.log("Setting custom gain: " + gain);
        gainNode.gain.value = gain;
      }
      console.log("Starting playback");
	  source.start();
	}, function(e) { // Error callback
	  console.log("Failed to decoe audio data: " + e);
	});

  };
  console.log("Sending XHR request for " + url);
  request.send();
}
