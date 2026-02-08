(function () {
  try {
    $notification.post("命中", $request.method + " " + $request.url, "脚本已运行");
    console.log("[TEST] url=" + $request.url);
    console.log("[TEST] headers=" + JSON.stringify($request.headers || {}));
  } catch (e) {
    console.log("[TEST] error=" + e);
  }
  $done({});
})();
