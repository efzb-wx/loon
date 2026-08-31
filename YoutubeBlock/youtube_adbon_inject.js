/*
 * YouTube AdBon - Loon HTML Injector
 *
 * 原 Userscript:
 * https://greasyfork.org/scripts/523405
 *
 * 用途：
 * 将原 Userscript 的 @require + 主脚本
 * 注入 YouTube 网页。
 */

const REQUIRE_URL =
  "https://cdn.jsdelivr.net/gh/yt-poor/yt-poor-min@422f12c44f75ed295d0f5dc7d624e728d799c582d/yt-poor-min-require.js";

// 修正：原脚本实际 @require 版本
const ADBON_REQUIRE_URL =
  "https://cdn.jsdelivr.net/gh/yt-poor/yt-poor-min@422f12c44f75ed295d0f5cf3c7e08956e04435de/yt-poor-min-require.js";

const url = $request.url || "";

/*
 * 对应原 Userscript 的 @exclude
 */
if (
  /^https:\/\/www\.youtube\.com\/live_chat/i.test(url) ||
  /^https:\/\/studio\.youtube\.com\/live_chat/i.test(url) ||
  /^https:\/\/www\.youtube\.com\/persist_identity/i.test(url) ||
  /^https:\/\/studio\.youtube\.com\/persist_identity/i.test(url)
) {
  console.log("[YouTube AdBon] Excluded: " + url);
  $done({});
  return;
}

let body = $response.body;

if (typeof body !== "string" || !body) {
  console.log("[YouTube AdBon] Response is not HTML.");
  $done({});
  return;
}

let headers = Object.assign({}, $response.headers || {});

/*
 * 删除 Header，大小写不敏感。
 */
function deleteHeader(name) {
  const target = name.toLowerCase();

  Object.keys(headers).forEach(function (key) {
    if (key.toLowerCase() === target) {
      delete headers[key];
    }
  });
}

/*
 * 修改 Body 后不能继续使用原来的 Content-Length。
 */
deleteHeader("content-length");

/*
 * 优先寻找 YouTube 自己生成的 CSP nonce。
 *
 * 如果能找到 nonce，就直接复用，
 * 不需要关闭整个 CSP。
 */
let nonce = "";

const nonceMatch = body.match(
  /<script\b[^>]*\bnonce\s*=\s*["']([^"']+)["'][^>]*>/i
);

if (nonceMatch && nonceMatch[1]) {
  nonce = nonceMatch[1];
}

let nonceAttr = "";

if (nonce) {
  nonceAttr =
    ' nonce="' +
    nonce
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;") +
    '"';

  console.log("[YouTube AdBon] CSP nonce found.");
} else {
  /*
   * 如果页面不存在 nonce，则只能去掉 CSP，
   * 否则浏览器可能阻止注入脚本。
   */
  deleteHeader("content-security-policy");
  deleteHeader("content-security-policy-report-only");

  /*
   * 同时处理 HTML 中可能存在的 CSP meta。
   */
  body = body.replace(
    /<meta\b[^>]*http-equiv\s*=\s*["']Content-Security-Policy["'][^>]*>/gi,
    ""
  );

  console.log("[YouTube AdBon] CSP nonce not found, CSP removed.");
}


/*
 * 原 Userscript 主体。
 *
 * 原代码使用 document，因此这里必须让代码进入
 * YouTube 网页 JS 环境，而不是在 Loon JS 环境执行。
 */
const mainScript = `
(function () {

  function warning(x, d, b) {

    d = d || 9;
    b = b || "#ff4141";

    setTimeout(function () {

      console.log(
        "%c" + x,
        "color:#ff0000;" +
        "font-size:" + d + "pt;" +
        "text-shadow:" +
        "0 0 0.7px " + b + "," +
        "0 0 0.7px " + b + "," +
        "0 0 0.7px " + b + "," +
        "0 0 0.7px " + b + ";"
      );

    }, 0);
  }


  var showLang = "zh-TW";

  try {

    if (
      document &&
      document.documentElement &&
      document.documentElement.lang
    ) {
      showLang = document.documentElement.lang;
    }

  } catch (e) {}


  while (true) {

    switch (showLang) {

      case "zh-TW":

        warning(
          "YouTube 禁止使用廣告攔截器",
          12
        );

        warning(
          "你似乎使用了廣告攔截器。"
        );

        warning(
          "有了廣告，YouTube 才能為全球數十億名使用者提供服務。"
        );

        warning(
          "如果你想觀看無廣告內容，可以訂閲 YouTube Premium，這樣創作者還是能賺取訂閱收益。"
        );

        return;


      case "zh-CN":

        warning(
          "YouTube 不允许使用广告拦截器",
          12
        );

        warning(
          "你似乎在使用广告拦截器。"
        );

        warning(
          "广告让全球数十亿名用户能够使用 YouTube。"
        );

        warning(
          "你可以订阅 YouTube Premium，畅享无广告打扰的体验，而创作者通过你的订阅仍然可以赚取收入。"
        );

        return;


      case "ja":
      case "ja-JP":

        warning(
          "広告ブロッカーの利用は、YouTube の利用規約で認められていません",
          12
        );

        warning(
          "広告ブロッカーを使用されているようです。YouTubeを許可リスト（アローリスト）に登録するか、広告ブロッカー自体を無効にしない場合、動画の再生がブロックされることがあります。"
        );

        warning(
          "世界で数十億人に上るユーザーが YouTube を使えるのは、広告のおかげです。"
        );

        warning(
          "YouTube Premium に加入すると広告なしでもクリエイターがあなたの視聴によって収益を得ることをサポートできます"
        );

        return;


      case "en":

        warning(
          "Ad blockers are not allowed on YouTube",
          12
        );

        warning(
          "It looks like you may be using an ad blocker."
        );

        warning(
          "Ads allow YouTube to stay free for billions of users worldwide."
        );

        warning(
          "You can go ad-free with YouTube Premium, and creators can still get paid from your subscription."
        );

        return;


      default:

        showLang = "en";
    }
  }

})();
`;


/*
 * 模拟：
 *
 * @require xxxx.js
 * @run-at document-start
 * @inject-into page
 *
 * 使用两个连续的 script：
 *
 * ① 先加载 @require
 * ② 再运行 Userscript 主体
 *
 * 普通 parser-inserted 外部 script 会阻塞解析，
 * 因此第二段会等待第一段执行完成。
 */
const injection =
  '<script' +
  nonceAttr +
  ' src="' +
  ADBON_REQUIRE_URL +
  '"></script>' +

  '<script' +
  nonceAttr +
  '>' +
  mainScript +
  '<\\/script>';


/*
 * 尽量放到 <head> 后的最前面。
 *
 * 这样比插入 </head> 前更接近：
 *
 * @run-at document-start
 */
if (/<head(?:\\s[^>]*)?>/i.test(body)) {

  body = body.replace(
    /<head(?:\\s[^>]*)?>/i,
    function (match) {
      return match + injection;
    }
  );

} else if (/<html(?:\\s[^>]*)?>/i.test(body)) {

  body = body.replace(
    /<html(?:\\s[^>]*)?>/i,
    function (match) {
      return match + injection;
    }
  );

} else {

  body = injection + body;
}


console.log(
  "[YouTube AdBon] Injected into: " + url
);


$done({
  headers: headers,
  body: body
});
