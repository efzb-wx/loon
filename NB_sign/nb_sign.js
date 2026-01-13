/**
 * nb_capture.js
 * 截获指定POST请求的data和cookie
 */

const TARGET_DATA =
  "D207CC6B227A23B9C065D48666789C35CD453B35CCBD39AD8112F297F";

let body = $request.body || "";
let headers = $request.headers || {};
let cookie = headers.Cookie || headers.cookie || "";

if (
  $request.method === "POST" &&
  body.includes(TARGET_DATA)
) {
  // 保存完整 data（body）
  $persistentStore.write(body, "NB_DATA");

  // 保存 cookie
  if (cookie) {
    $persistentStore.write(cookie, "NB_COOKIE");
  }

  // 通知提示
  $notification.post(
    "NBTool",
    "",
    "截获成功"
  );

  console.log("✅ 已截获 data 和 cookie");
}

$done({});
