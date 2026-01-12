/**
 * Compatible with Loon 2.2.0
 * Request Header Modify
 */

var headers = $request.headers || {};
var ua = headers["User-Agent"];

if (ua) {
  // 替换 YouTube/xx.xx.xx
  ua = ua.replace(/YouTube\/\d+(\.\d+)+/i, "YouTube/21.02.3");

  // 替换 com.google.ios.youtube/xx.xx.xx
  ua = ua.replace(/com\.google\.ios\.youtube\/\d+(\.\d+)+/i, "com.google.ios.youtube/21.02.3");

  headers["User-Agent"] = ua;
}

$done({ headers: headers });
