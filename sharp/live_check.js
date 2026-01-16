/*
 * Live.checkLive 返回值替换
 */

const url = $request.url;

// 仅保险判断一次
if (url.startsWith("https://sohg82.55ffsgi.xyz/appapi//?service=Live.checkLive")) {

  const body = {
    "ret": 200,
    "data": {
      "code": 1,
      "msg": "1",
      "info": [
        {
          "is_see": 1,
          "type": "1",
          "type_val": "1",
          "type_msg": "1",
          "live_type": "1",
          "live_sdk": "1"
        }
      ]
    },
    "msg": ""
  };

  $done({
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    },
    body: JSON.stringify(body)
  });

} else {
  $done({});
}
