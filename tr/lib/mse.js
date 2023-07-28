function prepareMSE(video_element, media_url, on_update_end) {
    console.log("prepare mse with url: " + media_url);    
    var mediaSource = new MediaSource;
    video_element.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', () => {
        console.log("souceopen");
        const sourceBuffer = mediaSource.addSourceBuffer("video/mp4");
        fetchAB(media_url, (buf) => {
          sourceBuffer.addEventListener("updateend", () => {
            console.log("updateend");
            mediaSource.endOfStream();
            if (on_update_end) {
                on_update_end();
            }
          });
          console.log("append video data");
          sourceBuffer.appendBuffer(buf);
        });
      });
}

function fetchAB(url, cb) {
    console.log(url);
    const xhr = new XMLHttpRequest();
    xhr.open("get", url);
    xhr.responseType = "arraybuffer";
    xhr.onload = () => {
      cb(xhr.response);
    };
    xhr.send();
}