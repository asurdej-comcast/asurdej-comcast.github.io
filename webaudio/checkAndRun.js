function checkAndRun(name, func, ...args) {
  if (g_params[name] == 0)
    return;
  let timeout = g_params[name + "timeout"];
  if (isNaN(timeout)) {
    func(args);
  } else {
    setTimeout(() => { func(args); }, timeout);
  }
}

