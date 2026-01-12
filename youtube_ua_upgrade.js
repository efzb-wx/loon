/**
 * Loon Plugin
 * 功能：升级 YouTube User-Agent 版本号
 * 支持：
 *  - YouTube/17.39.4
 *  - com.google.ios.youtube/17.39.4
 */

const TARGET_VERSION = "21.02.3";

let headers = $request.headers;
if (!headers) {
  $done({});
  return;
}

// 兼容大小写
let uaKey = headers["User-Agent"] ? "User-Agent" : "user-agent";
let ua = headers[uaKey];

if (ua) {
  let newUA = ua
    // 匹配 YouTube/17.39.4
    .replace(/(YouTube\/)(\d+(\.\d+)+)/gi, `$1${TARGET_VERSION}`)
    // 匹配 com.google.ios.youtube/17.39.4
    .replace(/(com\.google\.ios\.youtube\/)(\d+(\.\d+)+)/gi, `$1${TARGET_VERSION}`);

  if (newUA !== ua) {
    headers[uaKey] = newUA;
    console.log("YouTube UA upgraded");
    console.log("OLD: " + ua);
    console.log("NEW: " + newUA);
  }
}

$done({ headers });
