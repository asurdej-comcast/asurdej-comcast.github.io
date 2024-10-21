//const audioUrl = 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_a64k/bbb_a64k_$Number$.m4a'
//const videoUrl = 'https://dash.akamaized.net/akamai/bbb_30fps/bbb_30fps_1280x720_4000k/bbb_30fps_1280x720_4000k_$Number$.m4v'

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

async function asyncPrepareMediaSource(mediaElement, duration=null, log=console.log) {
    return new Promise(async (resolve) => {
        var mediaSource = new MediaSource;
        log("MediaSource created, readyState: " + mediaSource.readyState);
        mediaElement.src = URL.createObjectURL(mediaSource);
        log("MediaSource attached, readyState: " + mediaSource.readyState);
        log("waiting for MediaSource 'sourceopen' event...");
        await new Promise((internalResolve) => { mediaSource.onsourceopen = () => { internalResolve(); } });
        log("MediaSource readyState: " + mediaSource.readyState);
        if (duration != null) {
            mediaSource.duration = duration;
            log("MediaSource duration was set manually to: " + duration + ", and it's " + mediaSource.duration + " now");
        }
        resolve(mediaSource);
    });
}

async function asyncPrepareSourceBuffer(mediaSource, mimeType, data=null, log=console.log) {
    return new Promise(async (resolve) => {
        log("MediaSource creating SourceBuffer for '" + mimeType + "' (supported: " + MediaSource.isTypeSupported(mimeType) + ")");
        sourceBuffer = mediaSource.addSourceBuffer(mimeType);
        log("MediaSource added SourceBuffer, readyState: " + mediaSource.readyState);
        if (data != null) {
            log("Appending " + data.byteLength + " bytes of data to the SourceBuffer");
            sourceBuffer.appendBuffer(data);
            sourceBuffer.onupdatestart = () => {
                log("received SourceBuffer 'updatestart' event");
                sourceBuffer.onupdatestart = null;
            }
            log("waiting for SourceBuffer 'updateend' event...");
            await new Promise((internalResolve) => { sourceBuffer.onupdateend = () => { internalResolve(); } });
            logMediaSourceStats(mediaSource, log);
            logSourceBufferStats(sourceBuffer, log);
        }
        resolve(sourceBuffer);
    });
}

async function asyncAppendDataToSourceBuffer(mediaSource, sourceBuffer, data, log=console.log) {
    return new Promise(async (resolve) => {
        log("Appending " + data.byteLength + " bytes of data to the SourceBuffer");
        sourceBuffer.appendBuffer(data);
        sourceBuffer.onupdatestart = () => {
            log("received SourceBuffer 'updatestart' event");
            sourceBuffer.onupdatestart = null;
        }
        log("waiting for SourceBuffer 'updateend' event...");
        await new Promise((internalResolve) => { sourceBuffer.onupdateend = () => { internalResolve(); } });
        logMediaSourceStats(mediaSource, log);
        logSourceBufferStats(sourceBuffer, log);
        resolve();
    });
}

async function asyncRemoveDataRangeFromSourceBuffer(mediaSource, sourceBuffer, begin, end, log=console.log) {
    return new Promise(async (resolve) => {
        log("Removing [" + begin + ", " + end + "] range from SourceBuffer");
        sourceBuffer.remove(begin, end);
        sourceBuffer.onupdatestart = () => {
            log("received SourceBuffer 'updatestart' event");
            sourceBuffer.onupdatestart = null;
        }
        log("waiting for SourceBuffer 'updateend' event...");
        await new Promise((internalResolve) => { sourceBuffer.onupdateend = () => { internalResolve(); } });
        logMediaSourceStats(mediaSource, log);
        logSourceBufferStats(sourceBuffer, log);
        resolve();
    });
}

function logMediaSourceStats(mediaSource, log=console.log) {
    log("MediaSource duration: " + mediaSource.duration);
}

function logSourceBufferStats(sourceBuffer, log=console.log) {
    var msg = "SourceBuffer ranges: " + sourceBuffer.buffered.length + " (";
    for (var i = 0; i < sourceBuffer.buffered.length; i++) {
        msg += "#" + i + ": [" + sourceBuffer.buffered.start(i) + ", " + sourceBuffer.buffered.end(i) + "], ";
    }
    msg += ")";
    log(msg);
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

async function asyncFetchAB(url, log=console.log) {
    return new Promise((resolve) => {
        log("fetching '" + url + "' using XHR...");
        var xhr = new XMLHttpRequest;
        xhr.open('get', url);
        xhr.responseType = 'arraybuffer';
        xhr.onload = function () {
            log("fetching '" + url + "' done - received buffer of size: " + xhr.response.byteLength + " bytes");
            resolve(xhr.response);
        };
        xhr.send();
    });
}

async function asyncFetchAndAppend(ms, sourceBuffer, url) {
    return new Promise(async (resolve) => {
      let data = await asyncFetchAB(url);
      await asyncAppendDataToSourceBuffer(ms, sourceBuffer, data);
      resolve();
    });
  }