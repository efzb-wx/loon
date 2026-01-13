/**
 * nb_sign.js
 * NBTool 自动签到脚本
 * - 读取插件设置【每日签到】
 * - 使用捕获的 data + cookie 发包
 * - 根据返回 body 长度判断签到结果
 */

 /************** 读取插件设置 **************/
let enable = $argument["每日签到"];

if (enable !== "true") {
  console.log("⏸ NB助手：每日签到已关闭");
  $done();
}

/************** 读取存储数据 **************/
let data = $persistentStore.read("NB_DATA");
let cookie = $persistentStore.read("NB_COOKIE");

if (!data || !cookie) {
  console.log("❌ NB助手：缺少 data 或 cookie");
  $notification.post(
    "NB助手",
    "",
    "未截获数据，请先打开APP一次"
  );
  $done();
}

/************** 构造请求 **************/
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

/************** 发送签到请求 **************/
$httpClient.post(options, function (error, response, body) {
  if (error) {
    console.log("❌ NB助手：请求失败", error);
    $notification.post(
      "NB助手",
      "",
      "签到请求失败"
    );
    $done();
    return;
  }

  let len = body ? body.length : 0;
  let msg = "未知错误";

  if (len >= 40 && len <= 50) {
    msg = "签到成功,VIP+3天";
  } else if (len >= 100 && len <= 110) {
    msg = "72小时内已签到过";
  }

  console.log("📦 返回长度:", len);
  console.log("📄 返回内容:", body);

  $notification.post(
    "NB助手 签到结果",
    "",
    msg
  );

  $done();
});
