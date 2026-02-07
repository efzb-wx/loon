/**
 * 麦斯威尔福利社 (Loon 版)
 * 原作者: Mist
 * Loon 改版: 去 require/axios/process.env，改为 $httpClient + 内置 md5
 *
 * 配置:
 * Loon -> Persistent Store
 * key: mswefls
 * value: 一行一个账号，例如：
 *   openid1
 *   openid2
 * 或者：
 *   openid1#openid2
 *
 * 也兼容每行携带额外字段（只取第一个字段为 openId）：
 *   openid1&222&333
 *   openid2&bbb&www
 */

const $ = new Env("vx麦斯威尔福利社");
const env_name = "mswefls"; // 持久化 key
const Notify = 1; // 1通知, 0不通知
const debug = 0;  // 1调试, 0不调试
let scriptVersionNow = "1.0.0";
let msg = "";

// 读取 mswefls：Loon 用持久化，Node 用 process.env（这里仍保留兼容）
const env = $.isNode() ? (process.env[env_name] || "") : ($.getdata(env_name) || "");

!(async () => {
  await main();
  await SendMsg(msg);
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

async function main() {
  if (!env) {
    console.log(`没有填写变量,请查看脚本说明: ${env_name}`);
    return;
  }

  // 支持：换行 或 # 分隔
  let user_ck = env.split(/\n|#/).map(s => (s || "").trim()).filter(Boolean);
  DoubleLog(`\n========== 共找到 ${user_ck.length} 个账号 ==========`);

  let index = 1;
  for (let ck of user_ck) {
    if (!ck) continue; // 跳过空行
    let ck_info = ck.split("&");
    let openId = (ck_info[0] || "").trim();

    if (!openId) {
      DoubleLog(`账号[${index}] openId 为空，跳过`);
      index++;
      continue;
    }

    let user = { index, openId };
    index++;

    await userTask(user);

    // 每个账号之间等 1~5 秒随机时间
    let rnd_time = Math.floor(Math.random() * 4000) + 1000;
    console.log(`账号[${user.index}]随机等待${rnd_time / 1000}秒...`);
    await $.wait(rnd_time);
  }
}

async function userTask(user) {
  console.log(`\n============= 账号[${user.index}]开始任务 =============`);

  await wait(1);
  await SignInDailyScore(user);

  await wait(1);
  await ShareDailyScore(user);

  await wait(1);
  await UserSign(user);

  await wait(1);
  await UserShare(user);

  await wait(1);

  user.leftwater = 0;
  user.msg = null;

  try {
    await Watering(user); // 第一次浇水
  } catch (error) {
    DoubleLog(`账号[${user.index}]首次浇水失败: ${error && error.message ? error.message : error}`);
    await GetUserPoint(user);
    return;
  }

  await wait(1);

  // 继续浇水直到剩余水滴少于等于 20
  while (user.leftwater > 20) {
    try {
      await Watering(user);
      await wait(1);
    } catch (error) {
      console.log(`账号[${user.index}]浇水过程出错，停止执行: ${error && error.message ? error.message : error}`);
      break;
    }
  }

  await GetUserPoint(user);
}

// ======================= 任务接口 =======================

// 签到
async function SignInDailyScore(user) {
  try {
    let timestamp = getTimestamp();
    let sign = md5(`timestamp=${timestamp}&openid=${user.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();

    let urlObject = {
      method: "post",
      url: "https://jde.mtbcpt.com/api/JDEMaxwellApi/SignInDailyScore",
      headers: baseHeaders(),
      body: JSON.stringify({ openId: user.openId, timestamp, sign }),
    };

    let result = await httpRequest(urlObject);
    if (result?.state === true) {
      DoubleLog(`账号[${user.index}]${result.msg}`);
    } else {
      DoubleLog(`账号[${user.index}]签到-失败:${result?.msg || "未知错误"}❌`);
    }
  } catch (e) {
    console.log("SignInDailyScore 报错：", e);
  }
}

// 分享加积分
async function ShareDailyScore(user) {
  try {
    let timestamp = getTimestamp();
    let sign = md5(`timestamp=${timestamp}&openid=${user.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();

    let urlObject = {
      method: "post",
      url: "https://jde.mtbcpt.com/api/JDEMaxwellApi/ShareDailyScore",
      headers: baseHeaders(),
      body: JSON.stringify({ through: true, openId: user.openId, timestamp, sign }),
    };

    let result = await httpRequest(urlObject);
    if (result?.state === true) {
      DoubleLog(`账号[${user.index}]${result.msg}`);
    } else {
      DoubleLog(`账号[${user.index}]分享-失败:${result?.msg || "未知错误"}❌`);
    }
  } catch (e) {
    console.log("ShareDailyScore 报错：", e);
  }
}

// 浇水签到
async function UserSign(user) {
  try {
    let timestamp = getTimestamp();
    let sign = md5(`timestamp=${timestamp}&openid=${user.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();

    let urlObject = {
      method: "post",
      url: "https://jde.mtbcpt.com/api/JDEMaxwellApi/UserSign",
      headers: baseHeaders(),
      body: JSON.stringify({ openId: user.openId, timestamp, sign }),
    };

    let result = await httpRequest(urlObject);
    if (result?.state === true) {
      DoubleLog(`账号[${user.index}]水滴签到-领取成功${result.msg}`);
    } else {
      DoubleLog(`账号[${user.index}]水滴签到-失败:${result?.msg || "未知错误"}❌`);
    }
  } catch (e) {
    console.log("UserSign 报错：", e);
  }
}

// 分享领水滴
async function UserShare(user) {
  try {
    let timestamp = getTimestamp();
    let sign = md5(`timestamp=${timestamp}&openid=${user.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();

    let urlObject = {
      method: "post",
      url: "https://jde.mtbcpt.com/api/JDEMaxwellApi/UserShare",
      headers: baseHeaders(),
      body: JSON.stringify({ openId: user.openId, timestamp, sign }),
    };

    let result = await httpRequest(urlObject);
    if (result?.state === true) {
      DoubleLog(`账号[${user.index}]任务分享领水滴-领取成功${result.msg}`);
    } else {
      DoubleLog(`账号[${user.index}]任务分享领水滴-失败:${result?.msg || "未知错误"}❌`);
    }
  } catch (e) {
    console.log("UserShare 报错：", e);
  }
}

// 浇水
async function Watering(user) {
  let timestamp = getTimestamp();
  let sign = md5(`timestamp=${timestamp}&openid=${user.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();

  let urlObject = {
    method: "post",
    url: "https://jde.mtbcpt.com/api/JDEMaxwellApi/UserWatering",
    headers: baseHeaders(),
    body: JSON.stringify({ openId: user.openId, timestamp, sign }),
  };

  let result = await httpRequest(urlObject);
  if (result?.state === true) {
    DoubleLog(`账号[${user.index}]浇水-成功 剩余水滴${result.data1?.canUseWaters}`);
    user.leftwater = Number(result.data1?.canUseWaters || 0);
  } else {
    DoubleLog(`账号[${user.index}]浇水-失败:${result?.msg || "未知错误"}❌`);
    user.msg = result?.msg || "浇水失败";
    throw new Error(user.msg);
  }
}

// 积分查询
async function GetUserPoint(user) {
  try {
    let timestamp = getTimestamp();
    let sign = md5(`timestamp=${timestamp}&openid=${user.openId}&key=JDEMaxwellminiapp#2021!`).toUpperCase();

    let urlObject = {
      method: "post",
      url: "https://jde.mtbcpt.com/api/JDEMWMall/GetUserPoint",
      headers: baseHeaders(),
      body: JSON.stringify({ openId: user.openId, timestamp, sign }),
    };

    let result = await httpRequest(urlObject);
    if (result?.state === true) {
      DoubleLog(`账号[${user.index}]${result.msg}为[${result.data}]`);
    } else {
      DoubleLog(`账号[${user.index}]积分查询失败:${result?.msg || "未知错误"}❌`);
    }
  } catch (e) {
    console.log("GetUserPoint 报错：", e);
  }
}

// ======================= 工具函数 =======================

function baseHeaders() {
  return {
    Host: "jde.mtbcpt.com",
    "content-type": "application/json",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090b11) XWEB/9129",
  };
}

/** 发送消息 */
async function SendMsg(message) {
  if (!message) return;
  if (Notify > 0) {
    if ($.isNode()) {
      // Node 下需要 sendNotify，这里只是保留兼容；你在 Loon 下不会走到这里
      try {
        var notify = require("./sendNotify");
        await notify.sendNotify($.name, message);
      } catch (e) {
        console.log("sendNotify 不可用：", e);
      }
    } else {
      $.msg($.name, "", message);
    }
  } else {
    console.log(message);
  }
}

/** 双平台 log 输出 */
function DoubleLog(data) {
  if (data) {
    console.log(`${data}`);
    msg += `\n${data}`;
  }
}

/** 等待 n 秒 */
function wait(n) {
  return new Promise((resolve) => setTimeout(resolve, n * 1000));
}

/** 13位时间戳 */
function getTimestamp() {
  return new Date().getTime();
}

/**
 * 网络请求：Loon/Surge/Shadowrocket 走 $httpClient
 * 返回自动尝试 JSON.parse
 */
function httpRequest(options, timeout = 1000) {
  const method = (options.method || (options.body ? "post" : "get")).toLowerCase();

  return new Promise((resolve) => {
    setTimeout(() => {
      $[method](options, (err, resp, data) => {
        try {
          if (err) {
            console.log(JSON.stringify(err));
            $.logErr(err);
            return resolve(null);
          }
          try {
            data = JSON.parse(data);
          } catch (_) {}
          resolve(data);
        } catch (e) {
          $.logErr(e, resp);
          resolve(null);
        }
      });
    }, timeout);
  });
}

function debugLog(...args) {
  if (debug) console.log(...args);
}

/** 纯 JS MD5（常见实现，够用） */
function md5(string) {
  function RotateLeft(lValue, iShiftBits) { return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits)); }
  function AddUnsigned(lX, lY) {
    let lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000); lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000); lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      else return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
    } else return (lResult ^ lX8 ^ lY8);
  }
  function F(x, y, z) { return (x & y) | ((~x) & z); }
  function G(x, y, z) { return (x & z) | (y & (~z)); }
  function H(x, y, z) { return (x ^ y ^ z); }
  function I(x, y, z) { return (y ^ (x | (~z))); }
  function FF(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function GG(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function HH(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }
  function II(a, b, c, d, x, s, ac) { a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac)); return AddUnsigned(RotateLeft(a, s), b); }

  function ConvertToWordArray(str) {
    let lWordCount;
    let lMessageLength = str.length;
    let lNumberOfWords_temp1 = lMessageLength + 8;
    let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    let lWordArray = Array(lNumberOfWords - 1);
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (str.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue) {
    let WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = "0" + lByte.toString(16);
      WordToHexValue += WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  function Utf8Encode(str) {
    str = str.replace(/\r\n/g, "\n");
    let utftext = "";
    for (let n = 0; n < str.length; n++) {
      let c = str.charCodeAt(n);
      if (c < 128) utftext += String.fromCharCode(c);
      else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  let x = [];
  let k, AA, BB, CC, DD, a, b, c, d;
  let S11 = 7, S12 = 12, S13 = 17, S14 = 22;
  let S21 = 5, S22 = 9, S23 = 14, S24 = 20;
  let S31 = 4, S32 = 11, S33 = 16, S34 = 23;
  let S41 = 6, S42 = 10, S43 = 15, S44 = 21;

  string = Utf8Encode(string);
  x = ConvertToWordArray(string);

  a = 0x67452301; b = 0xEFCDAB89; c = 0x98BADCFE; d = 0x10325476;

  for (k = 0; k < x.length; k += 16) {
    AA = a; BB = b; CC = c; DD = d;

    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x02441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x04881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

    a = AddUnsigned(a, AA); b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC); d = AddUnsigned(d, DD);
  }

  return (WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d)).toLowerCase();
}

// ======================= Env（原脚本保留） =======================
function Env(t, e) {
  class s {
    constructor(t) { this.env = t; }
    send(t, e = "GET") {
      t = "string" == typeof t ? { url: t } : t;
      let s = this.get;
      return ("POST" === e && (s = this.post),
        new Promise((e, a) => { s.call(this, t, (t, s) => { t ? a(t) : e(s); }); }));
    }
    get(t) { return this.send.call(this.env, t); }
    post(t) { return this.send.call(this.env, t, "POST"); }
  }
  return new (class {
    constructor(t, e) {
      this.name = t;
      this.http = new s(this);
      this.data = null;
      this.dataFile = "box.dat";
      this.logs = [];
      this.isMute = !1;
      this.isNeedRewrite = !1;
      this.logSeparator = "\n";
      this.encoding = "utf-8";
      this.startTime = new Date().getTime();
      Object.assign(this, e);
      this.log("", `${this.name},开始!`);
    }
    getEnv() {
      return "undefined" != typeof $environment && $environment["surge-version"] ? "Surge"
        : "undefined" != typeof $environment && $environment["stash-version"] ? "Stash"
          : "undefined" != typeof module && module.exports ? "Node.js"
            : "undefined" != typeof $task ? "Quantumult X"
              : "undefined" != typeof $loon ? "Loon"
                : "undefined" != typeof $rocket ? "Shadowrocket"
                  : void 0;
    }
    isNode() { return "Node.js" === this.getEnv(); }
    isQuanX() { return "Quantumult X" === this.getEnv(); }
    isSurge() { return "Surge" === this.getEnv(); }
    isLoon() { return "Loon" === this.getEnv(); }
    isShadowrocket() { return "Shadowrocket" === this.getEnv(); }
    isStash() { return "Stash" === this.getEnv(); }

    toObj(t, e = null) { try { return JSON.parse(t); } catch { return e; } }
    toStr(t, e = null) { try { return JSON.stringify(t); } catch { return e; } }

    getdata(t) { return this.getval(t); }
    setdata(t, e) { return this.setval(t, e); }

    getval(t) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
          return $persistentStore.read(t);
        case "Quantumult X":
          return $prefs.valueForKey(t);
        case "Node.js":
          return (this.data = this.loaddata()), this.data[t];
        default:
          return (this.data && this.data[t]) || null;
      }
    }
    setval(t, e) {
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
          return $persistentStore.write(t, e);
        case "Quantumult X":
          return $prefs.setValueForKey(t, e);
        case "Node.js":
          return ((this.data = this.loaddata()), (this.data[e] = t), this.writedata(), !0);
        default:
          return (this.data && this.data[e]) || null;
      }
    }

    loaddata() {
      if (!this.isNode()) return {};
      this.fs = this.fs ? this.fs : require("fs");
      this.path = this.path ? this.path : require("path");
      const t = this.path.resolve(this.dataFile);
      const e = this.path.resolve(process.cwd(), this.dataFile);
      const s = this.fs.existsSync(t);
      const a = !s && this.fs.existsSync(e);
      if (!s && !a) return {};
      const r = s ? t : e;
      try { return JSON.parse(this.fs.readFileSync(r)); } catch { return {}; }
    }
    writedata() {
      if (!this.isNode()) return;
      this.fs = this.fs ? this.fs : require("fs");
      this.path = this.path ? this.path : require("path");
      const t = this.path.resolve(this.dataFile);
      const e = this.path.resolve(process.cwd(), this.dataFile);
      const s = this.fs.existsSync(t);
      const a = !s && this.fs.existsSync(e);
      const r = JSON.stringify(this.data);
      s ? this.fs.writeFileSync(t, r) : a ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r);
    }

    get(t, e = () => { }) {
      t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"], delete t.headers["content-type"], delete t.headers["content-length"]);
      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          $httpClient.get(t, (t, s, a) => {
            !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode));
            e(t, s, a);
          });
          break;
        case "Quantumult X":
          $task.fetch(t).then((t) => {
            const { statusCode: s, headers: a, body: r, bodyBytes: i } = t;
            e(null, { status: s, statusCode: s, headers: a, body: r, bodyBytes: i }, r, i);
          }, (t) => e((t && t.error) || "UndefinedError"));
          break;
        case "Node.js":
          // Node 分支此处省略（Loon 不会走到）
          e("Node.js not supported in this Loon-only build");
      }
    }

    post(t, e = () => { }) {
      const s = t.method ? t.method.toLocaleLowerCase() : "post";
      t.body && t.headers && !t.headers["Content-Type"] && !t.headers["content-type"] && (t.headers["content-type"] = "application/x-www-form-urlencoded");
      t.headers && (delete t.headers["Content-Length"], delete t.headers["content-length"]);

      switch (this.getEnv()) {
        case "Surge":
        case "Loon":
        case "Stash":
        case "Shadowrocket":
        default:
          $httpClient[s](t, (t, s, a) => {
            !t && s && ((s.body = a), (s.statusCode = s.status ? s.status : s.statusCode), (s.status = s.statusCode));
            e(t, s, a);
          });
          break;
        case "Quantumult X":
          t.method = s;
          $task.fetch(t).then((t) => {
            const { statusCode: s, headers: a, body: r, bodyBytes: i } = t;
            e(null, { status: s, statusCode: s, headers: a, body: r, bodyBytes: i }, r, i);
          }, (t) => e((t && t.error) || "UndefinedError"));
          break;
        case "Node.js":
          e("Node.js not supported in this Loon-only build");
      }
    }

    msg(e = this.name, s = "", a = "", r) {
      if (this.isMute) return;
      $notification.post(e, s, a, r);
      if (!this.isMuteLog) {
        let t = ["", "==============系统通知=============="];
        t.push(e); s && t.push(s); a && t.push(a);
        console.log(t.join("\n"));
        this.logs = this.logs.concat(t);
      }
    }

    log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)); }
    logErr(t) { this.log("", `❗️${this.name},错误!`, t); }
    wait(t) { return new Promise((e) => setTimeout(e, t)); }
    done(t = {}) {
      const e = new Date().getTime(), s = (e - this.startTime) / 1e3;
      this.log("", `${this.name},结束!${s}秒`), this.log();
      $done(t);
    }
  })(t, e);
}
