// example_test.js
// Loon http-response script

const url = $request.url;

// 保险校验域名
if (!/https?:\/\/api\.hb174\.top(:\d+)?\//.test(url)) {
  $done({});
}

// 解析端口
let port = null;
try {
  port = new URL(url).port; // 没端口时是 ""
} catch (e) {}

function jsonResponse(obj) {
  return {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(obj)
  };
}

// ---------- 规则判断 ----------

// UserSignV2
if (url.includes("UserSignV2")) {
  $done(jsonResponse({"errcode":0,"result":{"auth":"9e64b5342a26b6d1ef50b3ae3d89d67"}}));
}

// UserCheckV4
if (url.includes("UserCheckV4")) {
  $done(jsonResponse({"errcode":0,"result":"ok"}));
}

// test3 + 端口 8084 //UserInfoGet
//if (port === "8084" && url.includes("test3")) {
if (url.includes("UserInfoGet")) {
  $done(jsonResponse({"errcode":0,"result":{"MobilePhone":"未绑定手机","Vip":"super","VipInfo":"高级会员,2099-12-31到期","ID":666666,"Valid":"2099-12-31","NickName":"新达人6666","Avatar":"https://lazy-1252169987.cos.ap-guangzhou.myqcloud.com/default-avatar.png","Email":"66666666@qq.com"}}));
}

// 不匹配则放行
$done({});
