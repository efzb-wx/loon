/**
 * Loon Script: Replace response body based on URL prefix.
 */

const url = $request.url;

const REPLACE_KUAISHOU_PREFIX = "https://open.e.kuaishou.com/";
const REPLACE_ZHANGYU_PREFIX = "http://sdk.zhangyuyidong.cn/";

let body = $response.body || "";

if (url.startsWith(REPLACE_KUAISHOU_PREFIX)) {
  body = "{}";
  $done({ body });
}

if (url.startsWith(REPLACE_ZHANGYU_PREFIX)) {
  body =
    "SdibT2m/sHAnfzE24ezvl5RmuT6PyE/zhWgVJiMXVItVJ68un1oKq4LjguLRHIYc+oDCDA9MZglVXY4z+ANTWzXdi2wfg2SGkvbP5BL0cKeWlQBWnMCUnPHYouP3T1CwmlnYkWuHWtxWKgy/TdCLvw==";
  $done({ body });
}

$done({});
