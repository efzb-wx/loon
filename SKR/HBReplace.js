const url = $request.url;

// 仅保险判断一次
if (url.startsWith("https://api.hb174.top:8081/skrman/servlet/UserSignV2")) {

  const body = {
    "ret": 200,
    "data": {
      "code": 0,
      "msg": "0",
      "info": [
        {
          "is_see": 0,
          "type": "0",
          "type_val": "0",
          "type_msg": "0",
          "live_type": "0",
          "live_sdk": "0"
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
