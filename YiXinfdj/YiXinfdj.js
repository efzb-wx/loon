/**
 * Loon http-response script
 * 规则：
 * 1) 9100 /report -> A
 * 2) 9100 /gET    -> B
 * 3) 9100 /sBV    -> C
 * 4) 10210 /gIC   -> D
 * 其他情况放行
 */

const urlStr = $request.url;

let u;
try {
  u = new URL(urlStr);
} catch (e) {
  $done({});
}

const host = u.hostname;
const port = u.port ? Number(u.port) : (u.protocol === "https:" ? 443 : 80);
const path = u.pathname;

// 只处理目标 IP
if (host !== "123.207.1.205") {
  $done({});
}

// 返回内容定义
const RESPONSES = {
  "9100:/report":
    "yJyeiQXZsAjOz1mI6IyZctnIzVnIOJXZl1WY6ICXxICXyQzM3ITO2YzM2EDQj5yMc12bcxiIpVnIiwFZiwlODFjRGVzNtUkRFNTO00SREdjRGFULtkDRFNjRGFUOwMUMBZUMsICXlJCXpBHeUVmcl1Wa6ICX2cTMykDO0cTNi0HO==Qf",

  "9100:/getExpireTime":
    "yeyJXZiQjOsAmIz1yZ6InIctmI4VGcylVZpRWbcVjIxozNwcAAAQDNyASf9J",

  "9100:/showBuyVip":
    "yeyJXZiQjOsAmIz1yZ6IXM=1",

  "10210:/getIOSConfig":
    "yeyJXZiQjOsAmIz1yZ6IyewJXYUlXelBjIioTMiICLvJmbpxmbGVWalxGRzlWYsJSZ6IHM91"
};

const key = `${port}:${path}`;

if (RESPONSES[key]) {
  $done({
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    },
    body: RESPONSES[key]
  });
} else {
  // 不匹配任何规则，放行原响应
  $done({});
}
