function speak(text) {
  if (!window.speechSynthesis) {
    console.log("Browser doesn't support speech synthesis");
    return;
  }

  console.log("Will speak: " + text);
  var sp = new SpeechSynthesisUtterance(text);
  var volume = parseFloat(g_params["volume"]);
  if (!isNaN(volume)) {
    console.log("setting custom volume: " + volume);
    sp.volume = volume;
  }
  sp.onerror = (e) => { console.log("Speak error: " + e); } ;

  if (g_params["repeat"] == 1) {
    console.log("Repeating mode enabled");
    sp.onend = function(e) {
      console.log("Speak again");
      window.speechSynthesis.speak(sp);
    };
  }
  console.log("Start speaking")
  window.speechSynthesis.speak(sp);
  }