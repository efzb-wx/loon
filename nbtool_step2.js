/**
 * Loon Script: Replace response body based on URL prefix.
 */

const url = $request.url;

const REPLACE_KUAISHOU_PREFIX = "https://open.e.kuaishou.com/";
const REPLACE_ziben_PREFIX = "https://api-dsp.8ziben.com/";
const REPLACE_ZHANGYU_PREFIX = "http://sdk.zhangyuyidong.cn/";

let body = $response.body || "";

if (url.startsWith(REPLACE_KUAISHOU_PREFIX)) {
  body = "{}";
  $done({ body });
}

if (url.startsWith(REPLACE_ziben_PREFIX)) {
  body = "{}";
  $done({ body });
}

if (url.startsWith(REPLACE_ZHANGYU_PREFIX)) {
  body =
    " ";
  $done({ body });
}

$done({});
