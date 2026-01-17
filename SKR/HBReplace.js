/**
 * Loon http-response script
 * Replace response body for specific URL prefixes
 */

const url = $request.url;

if (url.startsWith("https://api.hb174.top:8081/skrman/servlet/UserSignV2")) {{
  const body = {
 ={"errcode":0,"result":{"auth":"9e64b5342a26b6d1ef50b3ae3d89d67"}};
}} 

else if (url.startsWith("https://api.hb174.top:8081/skrman/servlet/UserCheckV4")) {
  const body = {
 ={"errcode":0,"result":"ok"};
}} 

else if (url.startsWith("https://api.hb174.top:8081/skrman/servlet/UserInfoGet")) {
  const body = {
 = {"errcode":0,"result":{"MobilePhone":"未绑定手机","Vip":"super","VipInfo":"高级会员,2099-12-31到期","ID":666666,"Valid":"2099-12-31","NickName":"新达人6666","Avatar":"https://lazy-1252169987.cos.ap-guangzhou.myqcloud.com/default-avatar.png","Email":"66666666@qq.com"}};
}
}

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
