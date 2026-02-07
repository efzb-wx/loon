/**
 * htmwg - Loon 可跑版
 * 原作者: Mist（改造：Loon 兼容）
 * 说明：
 * 1) 抓域名 cmallapi.haday.cn 下 Authorization & uuid
 * 2) Loon 脚本参数：htmwg=Authorization&uuid
 * 3) 多账号：用 # 或 \n 分隔，例如：
 *    htmwg=auth1&uuid1#auth2&uuid2
 */

const SCRIPT_NAME = "vx海天美味馆(Loon)";
const env_name = "htmwg";
const Notify = 1;
const debug = 0;
let scriptVersionNow = "1.0.4";
let msg = "";

(async () => {
  try {
    await getNotice();
    await getVersion("yang7758258/ohhh154@main/htmwg.js");
    await main();
    await SendMsg(msg);
  } catch (e) {
    logErr(e);
  } finally {
    $done({});
  }
})();

// ============================= main =============================
async function main() {
  const env = getEnv(env_name);
  if (!env) {
    log(`没有填写变量, 请在 Loon 脚本参数或持久化中设置: ${env_name}`);
    return;
  }

  const user_ck = splitAccounts(env);
  let index = 1;

  for (const ck of user_ck) {
    if (!ck) continue;

    const ck_info = ck.split("&");
    const Authorization = (ck_info[0] || "").trim();
    const uuid = (ck_info[1] || "").trim();

    if (!Authorization || !uuid) {
      DoubleLog(`🌸账号[${index}] CK 格式不正确，应为 Authorization&uuid ❌`);
      index++;
      continue;
    }

    const user = { index, Authorization, uuid };
    index++;

    await userTask(user);

    const rnd_time = Math.floor(Math.random() * 4000) + 1000;
    log(`账号[${user.index}]随机等待${(rnd_time / 1000).toFixed(1)}秒...`);
    await waitMs(rnd_time);
  }
}

// ============================= tasks =============================
async function userTask(user) {
  log(`\n============= 账号[${user.index}]开始任务 =============`);
  await SignTask(user);
  await wait(2);
  await jifenduijihui(user);
  await wait(2);
  await jifenduijihui(user);
  await wait(2);
  await lingjihuijihui(user);
  await wait(2);
  await drawTask(user);
  await wait(2);
  await drawTask(user);
  await wait(2);
  await drawTask(user);
  await wait(2);
  await jifen(user);
}

// 用户签到
async function SignTask(user) {
  try {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");

    const urlObject = {
      method: "POST",
      url: "https://cmallapi.haday.cn/buyer-api/sign/activity/sign",
      headers: {
        Host: "cmallapi.haday.cn",
        "Content-Type": "application/json",
        Authorization: user.Authorization,
        Referer: "https://servicewechat.com/wx7a890ea13f50d7b6/608/page-frame.html",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129",
      },
      body: JSON.stringify({
        activity_code: `${year}${month}`,
        fill_date: "",
      }),
    };

    const r = await httpRequest(urlObject, "签到");
    if (!r) return;

    // 这里按你原逻辑保留：成功/已签/失败分支
    if (r.activity_code == 2024 || r.code == 200 || r.success === true) {
      // 有些接口不返回 sign_day_num，所以做个兜底
      const days = r.sign_day_num ?? r.data?.sign_day_num ?? "未知";
      const memberId = r.member_id ?? r.data?.member_id ?? "未知";
      DoubleLog(`🌸账号[${user.index}]🕊当前用户[${memberId}] 签到成功,已签到[${days}]天🎉`);
    } else if (r.code == 1019) {
      DoubleLog(`🌸账号[${user.index}]签到失败:[${r.message || "未知"}]❌`);
    } else {
      DoubleLog(`🌸账号[${user.index}]签到失败,可能已经签到❌`);
    }
  } catch (e) {
    logErr(e);
  }
}

// 每日抽奖
async function drawTask(user) {
  try {
    const urlObject = {
      method: "GET",
      url: "https://cmallapi.haday.cn/buyer-api/lucky/activity/extract?activityCode=jfcj0627",
      headers: {
        Authorization: user.Authorization,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129",
      },
    };

    const result = await httpRequest(urlObject, "抽奖");
    if (!result) return;

    if (result && result.lucky_record_vo) {
      DoubleLog(`🌸账号[${user.index}]🕊抽奖获得:[${result.lucky_record_vo.prize_name}]🎉`);
    } else if (result.code == "1007") {
      DoubleLog(`🌸账号[${user.index}]🕊抽奖失败:[${result.message || "未知"}]❌`);
    } else {
      DoubleLog(`🌸账号[${user.index}]🕊抽奖失败❌`);
    }
  } catch (e) {
    logErr(e);
  }
}

// 积分兑机会
async function jifenduijihui(user) {
  try {
    const urlObject = {
      method: "GET",
      url: "https://cmallapi.haday.cn/buyer-api/lucky/activity/redeem?activityCode=jfcj0627",
      headers: {
        Authorization: user.Authorization,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129",
      },
    };

    const result = await httpRequest(urlObject, "兑换");
    if (!result) return;

    if (result.member_id) {
      DoubleLog(`🌸账号[${user.index}]积分兑抽奖🕊任务成功，当前机会:[${result.opportunity_num}]🎉`);
    } else if (result.code == "E300") {
      DoubleLog(`🌸账号[${user.index}]🕊积分兑抽奖 兑换失败:[${result.message || "未知"}]❌`);
    } else {
      DoubleLog(`🌸账号[${user.index}]🕊积分兑抽奖 兑换失败❌`);
    }
  } catch (e) {
    logErr(e);
  }
}

// 每日领机会（原脚本 PUT；这里做 Loon 兼容）
async function lingjihuijihui(user) {
  try {
    const urlObject = {
      method: "PUT",
      url: "https://cmallapi.haday.cn/buyer-api/lucky/task/getLoginOpporturnity/jfcj0627",
      headers: {
        Authorization: user.Authorization,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129",
        // 兼容：用 POST 模拟 PUT（若后端支持）
        "X-HTTP-Method-Override": "PUT",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "", // 空 body
    };

    const result = await httpRequest(urlObject, "每日领机会");
    if (!result) return;

    // 原脚本：只要有 result 就认为成功；这里保留但加上失败码判断
    if (result.code == "700") {
      DoubleLog(`🌸账号[${user.index}]🕊每日领机会 失败:[${result.message || "未知"}]❌`);
    } else {
      DoubleLog(`🌸账号[${user.index}]🕊每日领机会 领取成功🎉`);
    }
  } catch (e) {
    logErr(e);
  }
}

// 积分查询
async function jifen(user) {
  try {
    const urlObject = {
      method: "GET",
      url: "https://cmallapi.haday.cn/buyer-api/members/points/current",
      headers: {
        uuid: user.uuid,
        Authorization: user.Authorization,
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129",
      },
    };

    const result = await httpRequest(urlObject, "积分查询");
    if (!result) return;

    // 你原逻辑这里判断 grade_point == "0" 才成功，有点奇怪（可能字段是字符串）
    // 我这里更稳：有 consum_point 就展示
    const points = result.consum_point ?? result.data?.consum_point;
    if (points !== undefined) {
      DoubleLog(`🌸账号[${user.index}]当前总积分💰:[${points}]🎉`);
    } else {
      DoubleLog(`🌸账号[${user.index}]积分查询失败❌`);
    }
  } catch (e) {
    logErr(e);
  }
}

// ============================= notify/log =============================
async function SendMsg(message) {
  if (!message) return;
  if (Notify > 0) {
    $notification.post(SCRIPT_NAME, "", message);
  } else {
    log(message);
  }
}

function DoubleLog(data) {
  if (data) {
    log(data);
    msg += `\n${data}`;
  }
}

function log(s) {
  console.log(`[${SCRIPT_NAME}] ${s}`);
}

function logErr(e) {
  console.log(`[${SCRIPT_NAME}] ${String(e && e.stack ? e.stack : e)}`);
}

function wait(n) {
  return new Promise((resolve) => setTimeout(resolve, n * 1000));
}
function waitMs(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============================= HTTP for Loon =============================
function httpRequest(options, tip) {
  return new Promise((resolve) => {
    const method = (options.method || (options.body ? "POST" : "GET")).toUpperCase();

    if (debug) {
      log(`【debug】${tip || "request"} => ${method} ${options.url}`);
      if (options.headers) log(`【debug】headers: ${JSON.stringify(options.headers)}`);
      if (options.body) log(`【debug】body: ${options.body}`);
    }

    const req = {
      url: options.url,
      headers: options.headers || {},
      body: options.body,
      timeout: options.timeout || 20000,
    };

    const cb = (err, resp, data) => {
      if (err) {
        log(`❌ ${tip || "请求"} 失败: ${err}`);
        return resolve(null);
      }
      if (debug) {
        log(`【debug】${tip || "response"} status=${resp && (resp.status || resp.statusCode)}`);
        log(`【debug】raw: ${data}`);
      }
      let json = null;
      try {
        json = JSON.parse(data);
      } catch (_) {
        // 有些接口可能返回空/文本
        json = data;
      }
      resolve(json);
    };

    // Loon 只有 get/post；PUT 用 post + override（上面已加 header）
    if (method === "POST" || method === "PUT") {
      $httpClient.post(req, cb);
    } else {
      $httpClient.get(req, cb);
    }
  });
}

// ============================= remote notice/version =============================
async function getNotice() {
  try {
    const urls = ["https://gitee.com/ohhhooh/jd_haoyangmao/raw/master/Notice.json"];
    for (const url of urls) {
      const r = await httpRequest({ method: "GET", url, headers: { "User-Agent": "" } }, "远程通知");
      if (r && r.notice) {
        const notice = String(r.notice).replace(/\\n/g, "\n");
        if (notice) DoubleLog(notice);
        break;
      }
    }
  } catch (e) {
    // 忽略通知失败
  }
}

async function getVersion(scriptUrl) {
  try {
    const url = `https://fastly.jsdelivr.net/gh/${scriptUrl}`;
    const data = await httpRequest({ method: "GET", url }, "版本检测(文本)");
    // httpRequest 对文本会返回字符串，这里兼容
    const text = typeof data === "string" ? data : JSON.stringify(data);

    const regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
    const match = text.match(regex);
    const scriptVersionLatest = match ? match[2] : "";
    log(`====== 当前版本：${scriptVersionNow} 📌 最新版本：${scriptVersionLatest} ======`);
  } catch (e) {
    // 忽略版本检测失败
  }
}

// ============================= env read =============================
function getEnv(key) {
  // 1) Loon 脚本参数：key=xxx
  const arg = typeof $argument !== "undefined" ? $argument : "";
  if (arg) {
    const v = getArgValue(arg, key);
    if (v) return v;
  }
  // 2) 持久化读取
  return ($persistentStore.read(key) || "").trim();
}

function getArgValue(arg, key) {
  // 支持 & 或换行做参数分隔
  const re = new RegExp(`(?:^|[&\\n])${escapeReg(key)}=([^&\\n]*)`);
  const m = arg.match(re);
  if (!m) return "";
  return decodeURIComponent(m[1]).trim();
}

function splitAccounts(env) {
  // 支持换行 / # 分隔
  return env
    .split("\n")
    .join("#")
    .split("#")
    .map((s) => s.trim())
    .filter(Boolean);
}

function escapeReg(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
