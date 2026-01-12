/**
 * Loon Plugin
 * 功能：将 User-Agent 中的 youtube/低版本 替换为 youtube/21.02.3
 */

const TARGET_VERSION = "youtube/21.02.3";

// 获取请求头
let headers = $request.headers;

if (headers) {
  // User-Agent 在不同系统中可能大小写不同
  let ua = headers["User-Agent"] || headers["user-agent"];

  if (ua) {
    // 匹配 youtube/数字.数字.数字（如 16.1.1、17.39.4 等）
    let newUA = ua.replace(/youtube\/\d+(\.\d+)+/gi, TARGET_VERSION);

    if (newUA !== ua) {
      headers["User-Agent"] = newUA;
      headers["user-agent"] = newUA;

      console.log("YouTube UA Modified:");
      console.log("Old UA: " + ua);
      console.log("New UA: " + newUA);
    }
  }
}

// 返回修改后的请求
$done({ headers });
