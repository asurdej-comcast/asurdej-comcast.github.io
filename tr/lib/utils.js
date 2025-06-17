// Parse URL parameters and store them in _params object
var _params_str = location.search.substring(1).split('&');
var _params = {};
while (_params_str.length > 0) {
  var key, val;
  [key, val] = _params_str.shift().split('=');
  if (key !== "") {
    _params[key] = decodeURIComponent(val || ""); // Ensure proper decoding
    console.log("_params[" + key + "] = " + val);
  }
}

function _getStringParam(name, defValue = "") {
    const param = _params[name];
    return param !== undefined ? String(param) : defValue;
}

function _getIntParam(name, defValue = 0) {
    const param = _params[name];
    const parsed = parseInt(param, 10);
    return !isNaN(parsed) ? parsed : defValue;
}

var _fail_timeout;

function reportResult(success, msg) {
  if (_fail_timeout) {
    resetFailTimeout();
  }
  document.body.style.backgroundColor = success ? "green" : "red";
  console.log("TEST " + (success ? "PASSED" : "FAILED") + " : " + msg);

  if (window.testCase) {
    window.testCase.reportResult(success, msg);
  } else if (window.opener) {
    window.opener.postMessage({success : success, msg : msg}, "*");
  }
}

function reportPass(msg) {
  reportResult(true, msg);
}

function reportFail(msg) {
  reportResult(false, msg);
}

function failTimeout(t_sec, msg) {
  let t = t_sec * 1000;
  if (_fail_timeout) {
    console.log("WARNING! Fail timeout set already");
    return;
  }
  _fail_timeout = setTimeout(()=>{
    reportFail(msg);
  }, t);
}

function resetFailTimeout() {
  if (!_fail_timeout) {
    console.log("WARNING! Fail timeout not set");
    return;
  }
  clearTimeout(_fail_timeout);
  _fail_timeout = null;
}

function startTest(url) {
  if (window.testRunner) {
    return window.testRunner.runTestCase(url);
  } else if (window.open) {
    let testCase = {
      addEventListener(name, handler) {
        this.endedHandler = handler;
      },
      destroy() {
        window.onmessage = null;
        if (this.window) {
          this.window.close();
        }
      },
      window : null,
      endedHandler : null
    };

    window.onmessage = (e) => {
      window.onmessage = null;
      testCase.endedHandler({success : e.data.success, message: e.data.msg});
    };

    testCase.window = window.open(url, "_blank");
    if (!testCase.window) {
      testCase.destroy();
      return null;
    }
    return testCase;
  } else {
    console.log("No API to start test");
    return null;
  }
}

function isURLAvailable(url) {
  var xhr = new XMLHttpRequest();
  xhr.open('HEAD', url, false);
  xhr.send();
  return xhr.status != 404;
}
