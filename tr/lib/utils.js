var _params_str = location.search.substring(1).split('&');
var _params = {};
while(_params_str.length > 0) {
  var key, val;
  [key, val] = _params_str.shift().split('='), 2;
  if (key != "") {
    _params[key] = val;
    console.log("_params[" + key + "] = " + val);
  }
}

const _useTestingAPIs = false;
// helper methods to play with additional JS testing APIs
// It can be modified locally to run test cases without those apis
function checkTestCaseAPI() {
  if (_useTestingAPIs && !window.testCase) {
    console.log("window.testCase object not present. Ensure testCase extension loaded");
    window.close();
    return false;
  }
  return true;
}

function reportResult(success, msg) {
  if (!checkTestCaseAPI()) {
    return;
  }
  console.log("TEST " + (success ? "PASSED" : "FAILED") + " : " + msg);
  if (_useTestingAPIs) {
    window.testCase.reportResult(success, msg); 
  }
}

function reportPass(msg) {
  reportResult(true, msg);
}

function reportFail(msg) {
  reportResult(false, msg);
}

var _fail_timeout;
function failTimeout(t_sec, msg) {
  console.log("failTimeout sec ", t_sec);
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
  console.log("resetFailTimeout");
  if (!_fail_timeout) {
    console.log("WARNING! Fail timeout not set");
    return;
  }
  clearTimeout(_fail_timeout);
  _fail_timeout = null;
}
