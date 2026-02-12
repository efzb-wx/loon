/**
 * 多点终极版
 * 功能：
 * 1. 签到
 * 2. 每账号生成3个邀请码
 * 3. 邀请码格式 aaa#bbb#ccc@ddd#eee#fff
 * 4. 第 i 个账号使用第 (i+3)%n 个账号的邀请码
 * 5. 每个邀请码只使用一次（请求发出即删除）
 * 6. 所有请求随机延迟1~4秒
 */

(function () {

  const KEY_CK = "duodianck";
  const KEY_CODE = "duodiancode";

  const SPLIT_ACCT = "@";
  const SPLIT_KV = ";";
  const SPLIT_INNER = "#";

  const URL_CHECKIN = "https://sign-in.dmall.com/checkIn";
  const URL_INVITE = "https://sign-in.dmall.com/generateInviteCode";
  const URL_SENDKEY = "https://sign-in.dmall.com/sendKey";

  const INVITE_BODY = "actId=521";

  /* ================= 随机延迟 ================= */

  function randDelay() {
    return Math.floor(Math.random() * 4) + 1;
  }

  function delayRun(fn, label) {
    const s = randDelay();
    console.log(`[延迟] ${label || ""} ${s}s`);
    setTimeout(fn, s * 1000);
  }

  /* ================= 工具函数 ================= */

  function trim(s) { return (s || "").trim(); }

  function parseAccount(str) {
    const obj = {};
    str.split(SPLIT_KV).forEach(p => {
      p = trim(p);
      const i = p.indexOf("=");
      if (i > -1) obj[trim(p.slice(0, i))] = trim(p.slice(i + 1));
    });
    return obj;
  }

  function loadAccounts() {
    const raw = $persistentStore.read(KEY_CK) || "";
    if (!raw) return [];
    return raw.split(SPLIT_ACCT)
      .map(x => trim(x))
      .filter(Boolean)
      .map(parseAccount)
      .filter(o => o.ticketName && o.token && o.userId);
  }

  function saveCodePool(pool) {
    const raw = pool
      .map(arr => arr.length ? arr.join(SPLIT_INNER) : "")
      .join(` ${SPLIT_ACCT} `);
    $persistentStore.write(raw, KEY_CODE);
  }

  function notify(title, sub, body) {
    $notification.post(title, sub || "", body || "");
  }

  function buildCookie(a) {
    return `ticketName=${a.ticketName}; token=${a.token}; userId=${a.userId}`;
  }

  function post(url, headers, body, cb) {
    $httpClient.post({ url, headers, body }, (err, resp, data) => {
      if (err) return cb(err, null);
      cb(null, data);
    });
  }

  function headers(acct, ua) {
    return {
      "Host": "sign-in.dmall.com",
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://appsign-in.dmall.com",
      "Cookie": buildCookie(acct),
      "User-Agent": ua,
      "Referer": "https://appsign-in.dmall.com/",
      "Accept": "application/json, text/plain, */*"
    };
  }

  /* ================= 主流程 ================= */

  const accounts = loadAccounts();
  const n = accounts.length;

  if (n === 0) {
    notify("多点任务", "未找到账号", "请先获取 duodianck");
    return $done({});
  }

  const codePool = Array.from({ length: n }, () => []);
  const signResults = [];
  const sendResults = [];

  let idx = 0;

  /* ========= 每账号：签到 + 生成3邀请码 ========= */

  function processAccount() {
    if (idx >= n) {
      saveCodePool(codePool);
      return delayRun(runSendAll, "进入互刷赞");
    }

    const acct = accounts[idx];

    // 签到
    post(
      URL_CHECKIN,
      headers(acct, "Mozilla/5.0 Dmall/6.7.2"),
      "tenantId=1",
      () => {
        signResults.push(acct.userId);

        // 生成3次邀请码
        let k = 0;
        function genOne() {
          if (k >= 3) {
            idx++;
            return delayRun(processAccount, "下一个账号");
          }

          delayRun(() => {
            post(
              URL_INVITE,
              headers(acct, "Mozilla/5.0 Dmall/6.7.5"),
              INVITE_BODY,
              (err, data) => {
                try {
                  const j = JSON.parse(data || "{}");
                  if (j.code === "0000" && j.data)
                    codePool[idx].push(j.data);
                } catch (e) {}
                k++;
                genOne();
              }
            );
          }, "生成邀请码");
        }

        genOne();
      }
    );
  }

  /* ========= 互刷赞 ========= */

  function runSendAll() {
    const tasks = [];

    for (let i = 0; i < n; i++) {
      const src = (i + 3) % n;
      for (let t = 0; t < 3; t++) {
        tasks.push({ target: i, source: src });
      }
    }

    let t = 0;

    function nextSend() {
      if (t >= tasks.length) {
        saveCodePool(codePool);
        return finish();
      }

      const job = tasks[t++];
      const acct = accounts[job.target];
      const src = job.source;

      if (!codePool[src].length) {
        sendResults.push("无可用邀请码");
        return delayRun(nextSend);
      }

      const code = codePool[src][0];

      delayRun(() => {
        post(
          URL_SENDKEY,
          headers(acct, "Mozilla/5.0 MicroMessenger"),
          `inviteCode=${encodeURIComponent(code)}`,
          () => {
            // ✅ 请求发出即删除
            codePool[src].shift();
            sendResults.push(code);
            nextSend();
          }
        );
      }, "发送点赞");
    }

    nextSend();
  }

  function finish() {
    notify(
      "多点任务完成",
      `签到${signResults.length}个 | 刷赞${sendResults.length}次`,
      "邀请码已按规则消耗"
    );
    $done({});
  }

  /* ========= 启动 ========= */

  delayRun(processAccount, "开始执行");

})();
