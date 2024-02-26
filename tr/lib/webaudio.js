function makeAudioContext() {
    const AudioContextAPI = window.AudioContext || window.webkitAudioContext;
    if (AudioContextAPI)
        return new AudioContextAPI();
    return null;
}

function makeNoise(audioContext, durationSeconds, gain = 0.2) {
    if (!audioContext) {
        return;
    }

    let channels = 2;
    let duration = 2.0;
    if (!isNaN(durationSeconds)) {
        duration = durationSeconds;
    }
    console.log("Generating noise with duration: " + duration + "[sec]");

    const frameCount = audioContext.sampleRate * duration;
    var buffer = audioContext.createBuffer(channels, frameCount, audioContext.sampleRate);
    for (let channel = 0; channel < channels; channel++) {
        const nowBuffering = buffer.getChannelData(channel);
        for (let i = 0; i < frameCount; i++) {
            nowBuffering[i] = Math.random() - 0.5;
        }
    }
    var source = audioContext.createBufferSource();
    source.buffer = buffer;
    var gainNode = audioContext.createGain();
    source.connect(gainNode);
    gainNode.connect(audioContext.destination);
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

function makeOscillatorNoise(audioContext, durationSeconds = 5.0, frequencyHertz = 440, gain = 0.2) {
    if (!audioContext) {
        return;
    }

    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequencyHertz, audioContext.currentTime);

    var gainNode = audioContext.createGain();
    gainNode.gain.value = gain;

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    console.log("Starting oscillator noise, type=?, freq=" + frequencyHertz);
    oscillator.start();
    setTimeout(function () {
        oscillator.stop();
    }, durationSeconds * 1000.0);
}

function playFromFile(audioCtx, url) {
    if (!audioCtx)
        return;

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
            console.log("Starting playback");
	    source.start();
	}, function(e) { // Error callback
	    console.log("Failed to decoe audio data: " + e);
	});

    };
    console.log("Sending XHR request for " + url);
    request.send();
}
