var g_fields = location.search.substring(1).split('&');
var g_params = {};
for (var i = 0; i < g_fields.length; ++i) {
  var kv = g_fields[i].split('=');
  g_params[kv[0]] = kv.slice(1).join('=');
  console.log("g_params[" + kv[0] + "] := '" + g_params[kv[0]] + "'");
}
