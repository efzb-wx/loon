/**
 * hqcsh - Loon 可跑版本
 * 原作者: Mist (青龙版)
 * 适配: ChatGPT（去 axios / 去 process.env / 适配 Loon $argument & $persistentStore）
 *
 * 功能：签到、做任务、抽奖、查积分
 * 变量：hqcsh = accountId
 * 多账号：用换行 或 # 分隔
 *
 * Loon 配置建议：
 * 1) 在脚本里传参：hqcsh=xxx#yyy
 * 或
 * 2) 在持久化里写入 key = hqcsh, value = xxx\nyyy
 */

const $ = new Env("vx好奇车生活(Loon)");

const env_name = "hqcsh";

// ✅ Loon：优先读 $argument，其次读持久化
let env = "";
if (typeof $argument !== "undefined" && $argument) {
  // 支持 hqcsh=xxx#yyy 或直接 xxx#yyy
  const m = $argument.match(new RegExp(`${env_name}=([^&]+)`));
  env = m ? decodeURIComponent(m[1]) : $argument;
}
env = env || $.getdata(env_name) || "";

// 后面的 || 表示如果前面结果为 false/空/null/undefined 就取后面的值
const Notify = 1; // 1通知, 0不通知
const debug = 0;  // 1调试, 0不调试
let scriptVersionNow = "1.0.5";
let msg = "";

// 任务ID（原脚本 그대로）
const taskId = [
  "662805299354165248", // 逛好物
  "662805189626974208", // 维修保养
  "662793252641984512", // 本地车服
  "662794321581330432", // 选二手车
  "662794237938524160", // 选新车
  "662794135429734400", // 汽车回收
  "662805119309467648", // 附近加油站
  "662805251388100608", // 违章
];

// 通用UA（原脚本 그대로）
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Windows WindowsWechat/WMPF WindowsWechat(0x63090a13) XWEB/9129";

!(async () => {
  await getNotice();
  await getVersion("yang7758258/ohhh154@main/hqcsh.js"); // 保留原逻辑
  await main();
  await SendMsg(msg);
})()
  .catch((e) => $.logErr(e))
  .finally(() => $.done());

// =========================== 主函数 ===========================
async function main() {
  if (!env) {
    console.log(`没有填写变量, 请查看脚本说明: ${env_name}`);
    console.log(`Loon 用法：脚本参数传 hqcsh=accountId 或在持久化里写 key=hqcsh`);
    return;
  }

  // 多账号：换行 或 # 分隔
  let user_ck = env.includes("\n") ? env.split("\n") : env.split("#");
  user_ck = user_ck.map((x) => (x || "").trim()).filter(Boolean);

  DoubleLog(`\n========== 共找到 ${user_ck.length} 个账号 ==========`);

  let index = 1;
  for (let ck of user_ck) {
    if (!ck) continue;

    // 原脚本允许 & 分割，这里保留
    const ck_info = ck.split("&");
    const accountId = ck_info[0];

    const user = { index, accountId };
    index++;

    await userTask(user);

    // 账号间随机等待 1~5 秒
    const rnd_time = Math.floor(Math.random() * 4000) + 1000;
    console.log(`账号[${user.index}]随机等待${rnd_time / 1000}秒...`);
    await $.wait(rnd_time);
  }
}

async function userTask(user) {
  console.log(`\n============= 账号[${user.index}]开始任务 =============`);
  await SignTask(user);
  await wait(2);

  for (let i = 0; i < taskId.length; i++) {
    await missonTask(user, taskId[i]);
    await wait(2);
  }

  await drawTask(user);
  await jifen(user);
}

// =========================== HTTP 封装（Loon 用 $.get/$.post） ===========================
function requestJSON(options) {
  const method = (options.method || "GET").toUpperCase();
  return new Promise((resolve) => {
    const cb = (err, resp, data) => {
      if (err) {
        $.logErr(err);
        return resolve(null);
      }
      try {
        const obj = typeof data === "string" ? JSON.parse(data) : data;
        resolve(obj);
      } catch (_) {
        resolve(data);
      }
    };
    if (method === "POST") $.post(options, cb);
    else $.get(options, cb);
  });
}

// =========================== 业务接口 ===========================

// 用户签到
async function SignTask(user) {
  try {
    const options = {
      url: "https://channel.cheryfs.cn/archer/activity-api/signinact/signin",
      headers: {
        tenantId: "619669306447261696",
        activityId: "620810406813786113",
        accountId: user.accountId,
        "User-Agent": UA,
      },
    };

    const result = await requestJSON(options);
    if (result?.code == 200) {
      DoubleLog(`账号[${user.index}] 今日签到状态为:[${result.success}]`);
    } else {
      DoubleLog(`账号[${user.index}] 签到失败, 可能CK失效!`);
    }
  } catch (e) {
    console.log(e);
  }
}

// 每日抽奖
async function drawTask(user) {
  try {
    const options = {
      url: "https://channel.cheryfs.cn/archer/activity-api/luckydraw/luckydraw/13E0818B25704A48B98FC09F5BAB7EB7",
      headers: {
        tenantId: "619669306447261696",
        activityId: "620821692188483585",
        accountId: user.accountId,
        "User-Agent": UA,
      },
    };

    const result = await requestJSON(options);
    if (result?.code == "200") {
      DoubleLog(`账号[${user.index}] 抽奖状态:[${result.success}]`);
    } else {
      DoubleLog(`账号[${user.index}] 抽奖失败`);
    }
  } catch (e) {
    console.log(e);
  }
}

// 任务接口
async function missonTask(user, taskid) {
  try {
    const options = {
      url: `https://channel.cheryfs.cn/archer/activity-api/taskItem/achieve?taskItemId=${taskid}`,
      headers: {
        tenantId: "619669306447261696",
        activityId: "661720946758930433",
        accountId: user.accountId,
        "User-Agent": UA,
      },
    };

    const result = await requestJSON(options);
    if (result?.code == 200) {
      console.log(`账号[${user.index}] 任务${result.message}\n任务编号:${taskid}`);
    } else {
      DoubleLog(`账号[${user.index}] 任务失败:[${result?.message || "unknown"}]`);
    }
  } catch (e) {
    console.log(e);
  }
}

// 查询积分
async function jifen(user) {
  try {
    const options = {
      url: "https://channel.cheryfs.cn/archer/activity-api/common/accountPointLeft?pointId=620415610219683840&showExpire=true&timeType=day&indexDay",
      headers: {
        tenantId: "619669306447261696",
        activityId: "621883730893492225",
        accountId: user.accountId,
        "User-Agent": UA,
      },
    };

    const result = await requestJSON(options);
    if (result?.code == 200) {
      DoubleLog(`账号[${user.index}] 总积分:[${result.result}]`);
    } else {
      DoubleLog(`账号[${user.index}] 积分查询失败`);
    }
  } catch (e) {
    console.log(e);
  }
}

// =========================== 通知/日志/工具 ===========================

async function SendMsg(message) {
  if (!message) return;
  if (Notify > 0) {
    // Loon: 直接通知
    $.msg($.name, "", message);
  } else {
    console.log(message);
  }
}

function DoubleLog(data) {
  if (data) {
    console.log(`${data}`);
    msg += `\n${data}`;
  }
}

function wait(n) {
  return new Promise((resolve) => setTimeout(resolve, n * 1000));
}

function debugLog(...args) {
  if (debug) console.log(...args);
}

// 远程通知（保留原逻辑：走脚本自带 $.get）
async function getNotice() {
  try {
    const urls = [
      "https://gitee.com/ohhhooh/jd_haoyangmao/raw/master/Notice.json",
    ];
    let notice = null;

    for (const url of urls) {
      const result = await new Promise((resolve) => {
        $.get({ url, headers: { "User-Agent": UA } }, (err, resp, data) => {
          if (err) return resolve(null);
          try {
            resolve(JSON.parse(data));
          } catch (_) {
            resolve(null);
          }
        });
      });

      if (result && "notice" in result) {
        notice = String(result.notice).replace(/\\n/g, "\n");
        break;
      }
    }

    if (notice) DoubleLog(notice);
  } catch (e) {
    console.log(e);
  }
}

// 远程版本（保留原逻辑）
function getVersion(scriptUrl, timeout = 3000) {
  return new Promise((resolve) => {
    const options = { url: `https://fastly.jsdelivr.net/gh/${scriptUrl}` };
    $.get(options, (err, resp, data) => {
      try {
        const regex = /scriptVersionNow\s*=\s*(["'`])([\d.]+)\1/;
        const match = data && data.match ? data.match(regex) : null;
        const latest = match ? match[2] : "";
        console.log(`\n====== 当前版本：${scriptVersionNow} 最新版本：${latest} ======`);
      } catch (e) {
        $.logErr(e, resp);
      }
      resolve();
    }, timeout);
  });
}

/**
 * Env（原脚本自带的跨平台 Env，Loon 支持 $loon + $httpClient + $persistentStore）
 * 这里保持最小化：保留 get/post/msg/getdata/setdata/wait/done/logErr
 */
function Env(name) {
  return new (class {
    constructor(name) {
      this.name = name;
      this.startTime = Date.now();
      console.log(`\n${this.name}, 开始!`);
    }
    getEnv() {
      return typeof $loon !== "undefined" ? "Loon" : "Other";
    }
    isLoon() {
      return this.getEnv() === "Loon";
    }
    getdata(key) {
      return $persistentStore.read(key);
    }
    setdata(val, key) {
      return $persistentStore.write(val, key);
    }
    get(opts, cb) {
      $httpClient.get(opts, cb);
    }
    post(opts, cb) {
      $httpClient.post(opts, cb);
    }
    msg(title, subtitle = "", body = "", opts) {
      $notification.post(title, subtitle, body, opts);
    }
    logErr(err) {
      console.log(`❗️${this.name} 错误:`, err);
    }
    wait(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }
    done() {
      const cost = (Date.now() - this.startTime) / 1000;
      console.log(`${this.name}, 结束! 用时 ${cost}s\n`);
      $done();
    }
  })(name);
}
