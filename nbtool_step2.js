/**
 * Loon Script: Replace response body based on URL prefix.
 */

const url = $request.url;

const REPLACE_KUAISHOU_PREFIX = "https://open.e.kuaishou.com/";
const REPLACE_ziben_PREFIX = "https://api-dsp.8ziben.com/";
const REPLACE_ZHANGYU_PREFIX = "http://sdk.zhangyuyidong.cn/";

let body = $response.body || "";

if (url.startsWith(REPLACE_KUAISHOU_PREFIX)) {
  body = "{"llsid":2005558867033981106,"result":1,"errorMsg":"OK","egid":"DFPD438CA58BF2C9E5C960E50A0559513755257A0C0391A694DC6471207D21C1","gidExpireTimeMs":1771795595000,"cookie":"kssig=","hasMore":false,"impAdInfo":"","extra":"fdMVfAA4Uaxc5Q3Kwh4kUezys0iWE+zahAGJ7FYCuI5Pin8zSOO10CxyB4qUS5xV","adGlobalConfigInfo":"3fgceb6ysD3IMl76g1lJltLBGm+9EnbSsFGu3b1DrPfJWJxa/08Cl4Y8u14nwKoiHOMtGSA+OsFM0Xgvt3p4/edBqKqTDs77ttVuWuEZC1H3Vztn8fsEDDkFoJGf6yHBQeUVFlAt6Sfyp+trBTCOiqZuKt1XwncMC5/c447cyDQ=","hasAd":false}";
  $done({ body });
}

if (url.startsWith(REPLACE_ziben_PREFIX)) {
  body = "{}";
  $done({ body });
}

if (url.startsWith(REPLACE_ZHANGYU_PREFIX)) {
  body =
    "SdibT2m/sHAnfzE24ezvl5RmuT6PyE/zhWgVJiMXVItVJ68un1oKq4LjguLRHIYc+oDCDA9MZglVXY4z+ANTWzXdi2wfg2SGkvbP5BL0cKeWlQBWnMCUnPHYouP3T1CwmlnYkWuHWtxWKgy/TdCLvw==";
  $done({ body });
}

$done({});
