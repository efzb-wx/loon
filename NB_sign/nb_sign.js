/**
 * nb_sign.js
 * 每天10点自动发送签到包
 */

let data = $persistentStore.read("NB_DATA");
let cookie = $persistentStore.read("NB_COOKIE");

if (!data || !cookie) {
  console.log("❌ 未找到 data 或 cookie，无法签到");
  $done();
}

let options = {
  url: "http://nbtool8.com:9527/nb/app",
  method: "POST",
  headers: {
    "Host": "nbtool8.com:9527",
    "Accept": "*/*",
    "Content-Type": "application/x-www-form-urlencoded",
    "Cookie": cookie,
    "Accept-Language": "zh-CN,zh-Hans;q=0.9",
    "Accept-Encoding": "gzip, deflate",
    "User-Agent": "XNZS/1 CFNetwork/1410.0.3 Darwin/22.6.0",
    "Connection": "Keep-Alive"
  },
  body: data
};

$httpClient.post(options, function (error, response, body) {
  if (error) {
    console.log("❌ 签到请求失败:", error);
  } else {
    console.log("✅ 签到请求已发送");
    console.log("返回内容:", body);
  }
  $done();
});
