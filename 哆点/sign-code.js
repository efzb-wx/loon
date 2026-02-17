/**
 * 多点：签到 + 生成邀请码 + 互刷赞(sendKey) - Loon（带随机延迟）
 *
 * ✅ 所有发包之间随机延迟 1~4 秒（整数），避免同时发包
 */

(function () {
  const KEY_CK = "duodianck";
  const KEY_CODE = "duodiancode";

  const SPLIT_ACCT = "@";
  const SPLIT_KV = ";";

  const URL_CHECKIN = "https://sign-in.dmall.com/checkIn";
  const URL_INVITE = "https://sign-in.dmall.com/generateInviteCode";
  const URL_SENDKEY = "https://sign-in.dmall.com/sendKey";

  const INVITE_BODY = "actId=521";

  // ====== checkIn body（你的抓包体，原样放）======
  const BODY_TEMPLATE =
    "tenantId=1&platform=IOS&vendorId=1&trackData=%7B%22session_id%22%3A%22CB7CCC587AC0000290301A01B01C83F0%22%2C%22sdk_type%22%3A%22js%22%2C%22data_seq%22%3A0%2C%22data_version%22%3A%221.0%22%2C%22debug_mode%22%3A%22DEBUG_OFF%22%2C%22client_time%22%3A0%2C%22unique_id%22%3A%22%22%2C%22user_id%22%3A%22%22%2C%22ticket_name%22%3A%2255CBFA466B7FF5593EB30D97C1B49A6C6448C1078A42009AB1060276F254DCAFCCAB0D04491BA410706F9F6AEBF47154D6D11B502604B7A7435FF09746F6E94998AB0AE8881C7E7501DBC9E0B2A093FA3B1B857596A8C7935BCF089517ECF78864BCBD5DB5C5AC3FB466FBD1DE3616B0376DF87C0CAD8F044CA53E7B79A488D5%22%2C%22project%22%3A%22%E5%95%86%E5%9F%8EAPP%22%2C%22env%22%3A%22app_ios%22%2C%22%24system%22%3A%7B%22app_version%22%3A%226.7.2%22%2C%22first_session_time%22%3A1758501034047%2C%22session_count%22%3A30%2C%22imei%22%3A%22%22%2C%22idfa%22%3A%22%22%2C%22mac%22%3A%22%22%2C%22android_id%22%3A%22%22%2C%22user_agent%22%3A%22Mozilla%2F5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2016_3_1%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Mobile%2F15E148Dmall%2F6.7.2%22%2C%22dev_type%22%3A%22iPhone%22%2C%22dev_platform%22%3A%22IOS%22%2C%22dev_platform_version%22%3A%2216.3.1%22%2C%22dev_manufacturer%22%3A%22iPhone14%2C2%22%2C%22dev_carrier%22%3A%22%22%2C%22dev_network_type%22%3A%222%22%2C%22app_notification_state%22%3A%221%22%7D%2C%22%24attrs%22%3A%7B%22page_title%22%3A%22%E7%AD%BE%E5%88%B0%22%2C%22page_url%22%3A%22https%3A%2F%2Fappsign-in.dmall.com%2F%3FdmTransStatusBar%3Dtrue%26dmShowTitleBar%3Dfalse%26bounces%3Dfalse%26dmNeedLogin%3Dtrue%23%2F%22%2C%22vender_id%22%3A%221%22%2C%22store_id%22%3A%2213044%22%7D%2C%22%24source%22%3A%7B%22tpc%22%3A%22%22%2C%22tdc%22%3A%22%22%7D%2C%22system%22%3A%7B%22app_version%22%3A%226.7.2%22%2C%22first_session_time%22%3A1758501034047%2C%22session_count%22%3A30%2C%22imei%22%3A%22%22%2C%22idfa%22%3A%22%22%2C%22mac%22%3A%22%22%2C%22android_id%22%3A%22%22%2C%22user_agent%22%3A%22Mozilla%2F5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2016_3_1%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Mobile%2F15E148Dmall%2F6.7.2%22%2C%22dev_type%22%3A%22iPhone%22%2C%22dev_platform%22%3A%22IOS%22%2C%22dev_platform_version%22%3A%2216.3.1%22%2C%22dev_manufacturer%22%3A%22iPhone14%2C2%22%2C%22dev_carrier%22%3A%22%22%2C%22dev_network_type%22%3A%222%22%2C%22app_notification_state%22%3A%221%22%7D%2C%22attrs%22%3A%7B%22page_title%22%3A%22%E7%AD%BE%E5%88%B0%22%2C%22page_url%22%3A%22https%3A%2F%2Fappsign-in.dmall.com%2F%3FdmTransStatusBar%3Dtrue%26dmShowTitleBar%3Dfalse%26bounces%3Dfalse%26dmNeedLogin%3Dtrue%23%2F%22%2C%22vender_id%22%3A%221%22%2C%22store_id%22%3A%2213044%22%7D%2C%22source%22%3A%7B%22tpc%22%3A%22%22%2C%22tdc%22%3A%22%22%7D%7D";

  // ===== 随机延迟：1~4 秒（整数）=====
  function randDelaySec() {
//    return Math.floor(Math.random() * 4) + 1; // 1..4
    return Math.floor(Math.random() * 4) + 23; // 1..4
  }
  function delayNext(fn, label) {
    const s = randDelaySec();
    console.log(`[delay] ${label || "next"} -> ${s}s`);
    setTimeout(fn, s * 1000);
  }

  // ===== 工具 =====
  function trim(s) { return (s || "").trim(); }

  function parseAcct(str) {
    const o = {};
    (str || "").split(SPLIT_KV).forEach(p => {
      p = trim(p);
      if (!p) return;
      const i = p.indexOf("=");
      if (i === -1) return;
      const k = trim(p.slice(0, i));
      const v = trim(p.slice(i + 1));
      if (k) o[k] = v;
    });
    return o;
  }

  function loadAccounts() {
    const raw = $persistentStore.read(KEY_CK) || "";
    if (!trim(raw)) return [];
    return raw.split(SPLIT_ACCT)
      .map(x => trim(x))
      .filter(Boolean)
      .map(parseAcct)
      .filter(o => o.ticketName && o.token && o.userId);
  }

  function notify(title, sub, body) {
    $notification.post(title, sub || "", body || "");
  }

  function buildCookie(acct) {
    return `ticketName=${acct.ticketName}; token=${acct.token}; userId=${acct.userId}`;
  }

  function replaceTrackTicketName(body, ticketName) {
    const enc = encodeURIComponent(ticketName);
    return body.replace(/(%22ticket_name%22%3A%22)[^%]*(%22)/, `$1${enc}$2`);
  }

  function post(url, headers, body, cb) {
    $httpClient.post({ url, headers, body }, function (err, resp, data) {
      if (err) return cb(err, null);
      cb(null, data);
    });
  }

  function commonHeaders(acct, ua) {
    return {
      "Host": "sign-in.dmall.com",
      "Content-Type": "application/x-www-form-urlencoded",
      "Origin": "https://appsign-in.dmall.com",
      "Accept-Encoding": "gzip, deflate, br",
      "Cookie": buildCookie(acct),
      "Connection": "keep-alive",
      "Accept": "application/json, text/plain, */*",
      "User-Agent": ua,
      "Referer": "https://appsign-in.dmall.com/",
      "Accept-Language": "zh-CN,zh-Hans;q=0.9"
    };
  }

  function doCheckin(acct, cb) {
    const headers = commonHeaders(
      acct,
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148Dmall/6.7.2"
    );
    const body = replaceTrackTicketName(BODY_TEMPLATE, acct.ticketName);

    post(URL_CHECKIN, headers, body, function (err, data) {
      if (err) return cb({ ok: false, userId: acct.userId, msg: String(err) });

      let msg = "";
      try {
        const j = JSON.parse(data || "{}");
        msg = j.errMsg || j.message || j.msg || (j.code ? `code=${j.code}` : "OK");
        if (j.code && (j.errMsg || j.msg)) msg = `${j.code} ${j.errMsg || j.msg}`;
      } catch (e) {
        msg = (data || "").slice(0, 80) || "响应非JSON";
      }
      cb({ ok: true, userId: acct.userId, msg });
    });
  }

  function doInvite(acct, cb) {
    const headers = commonHeaders(
      acct,
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148Dmall/6.7.5"
    );

    post(URL_INVITE, headers, INVITE_BODY, function (err, data) {
      if (err) return cb({ ok: false, userId: acct.userId, code: "", msg: String(err) });

      try {
        const j = JSON.parse(data || "{}");
        const code = j.data || "";
        const ok = (j.code === "0000") && !!code;
        const msg = j.msg || j.errMsg || (j.code ? `code=${j.code}` : "OK");
        cb({ ok, userId: acct.userId, code, msg });
      } catch (e) {
        cb({ ok: false, userId: acct.userId, code: "", msg: "返回非JSON" });
      }
    });
  }

  function doSendKey(acct, inviteCode, cb) {
    const headers = commonHeaders(
      acct,
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 MicroMessenger/8.0.68(0x1800442a) NetType/WIFI Language/zh_CN miniProgram/wx688e0bc628edd02e"
    );
    const body = `inviteCode=${encodeURIComponent(inviteCode)}`;

    post(URL_SENDKEY, headers, body, function (err, data) {
      if (err) return cb({ ok: false, userId: acct.userId, inviteCode, msg: String(err) });

      let msg = "";
      let ok = true;
      try {
        const j = JSON.parse(data || "{}");
        msg = j.msg || j.errMsg || (j.code ? `code=${j.code}` : "OK");
        if (j.code && (j.msg || j.errMsg)) msg = `${j.code} ${j.msg || j.errMsg}`;
        if (j.code && j.code !== "0000") ok = false;
      } catch (e) {
        msg = (data || "").slice(0, 80) || "响应非JSON";
      }

      cb({ ok, userId: acct.userId, inviteCode, msg });
    });
  }

  function get3CodesForIndex(i, codes) {
    const n = codes.length;
    const self = codes[i];
    const picks = [];
    const seen = {};

    const want = [1, 2, 3].map(k => (i - k + n) % n);
    for (const idx of want) {
      const c = codes[idx];
      if (!c) continue;
      if (self && c === self) continue;
      if (seen[c]) continue;
      seen[c] = 1;
      picks.push(c);
      if (picks.length >= 3) break;
    }

    if (picks.length < 3) {
      for (let k = 0; k < n && picks.length < 3; k++) {
        const c = codes[k];
        if (!c) continue;
        if (self && c === self) continue;
        if (seen[c]) continue;
        seen[c] = 1;
        picks.push(c);
      }
    }
    return picks;
  }

  // ===== 主流程：每账号（签到 -> 延迟 -> 邀请码）; 全部完成后（互刷赞每包延迟）=====
  try {
    const accounts = loadAccounts();
    if (accounts.length === 0) {
      notify("多点任务", "未找到账号", "请先获取并保存 duodianck");
      return $done({});
    }

    const signResults = [];
    const inviteResults = [];
    let idx = 0;

    function stepInvite() {
      if (idx >= accounts.length) {
        const codesAligned = inviteResults.map(r => (r && r.ok && r.code) ? r.code : "");
        const rawCodes = codesAligned.join(` ${SPLIT_ACCT} `);
        $persistentStore.write(rawCodes, KEY_CODE);

        // 进入互刷赞（先延迟一下再开始）
        return delayNext(function () {
          stepSendKey(codesAligned);
        }, "before sendKey");
      }

      const acct = accounts[idx];

      // 发 checkIn
      doCheckin(acct, function (r1) {
        signResults.push(r1);

        // checkIn -> invite 之间随机延迟
        delayNext(function () {
          doInvite(acct, function (r2) {
            inviteResults[idx] = r2;
            idx++;

            // 下一个账号开始前也随机延迟
            delayNext(stepInvite, "next account");
          });
        }, "checkIn->invite");
      });
    }

    const sendKeyResults = [];

    function stepSendKey(codesAligned) {
      const n = accounts.length;
      const usable = codesAligned.filter(c => !!c).length;
      if (usable === 0) {
        return finish("未获取到任何邀请码，跳过互刷赞", codesAligned);
      }

      const tasks = [];
      for (let i = 0; i < n; i++) {
        const picks = get3CodesForIndex(i, codesAligned);
        for (const code of picks) tasks.push({ acctIndex: i, inviteCode: code });
      }

      let t = 0;
      function runTask() {
        if (t >= tasks.length) return finish("", codesAligned);

        const job = tasks[t++];
        const acct = accounts[job.acctIndex];

        // 每次 sendKey 前随机延迟（保证不同时发包）
        delayNext(function () {
          doSendKey(acct, job.inviteCode, function (r) {
            sendKeyResults.push(r);
            runTask();
          });
        }, "sendKey");
      }

      runTask();
    }

    function finish(extraMsg, codesAligned) {
      const okSign = signResults.filter(r => r.ok).length;
      const failSign = signResults.length - okSign;

      const okInvite = inviteResults.filter(r => r && r.ok).length;
      const failInvite = accounts.length - okInvite;

      const okSend = sendKeyResults.filter(r => r.ok).length;
      const failSend = sendKeyResults.length - okSend;

      const signLines = signResults.map(r => `${r.ok ? "✅" : "❌"} userId=${r.userId} | ${r.msg}`);
      const inviteLines = inviteResults.map(r => {
        if (!r) return "❌ 未执行";
        return `${r.ok ? "✅" : "❌"} userId=${r.userId} | ${r.code || ""} ${r.msg || ""}`.trim();
      });
      const sendLines = sendKeyResults.map(r => {
        const flag = r.ok ? "✅" : "❌";
        return `${flag} userId=${r.userId} -> ${r.inviteCode} | ${r.msg}`;
      });

      const summary = [
        `签到 成功${okSign}/失败${failSign}`,
        `邀请码 成功${okInvite}/失败${failInvite}（已写入 duodiancode，对齐存储）`,
        `互刷赞 成功${okSend}/失败${failSend}（实际发送 ${sendKeyResults.length} 次）`,
        extraMsg ? `提示：${extraMsg}` : ""
      ].filter(Boolean).join(" | ");

      notify(
        "多点任务完成",
        summary,
        [
          "【签到】",
          ...signLines.slice(0, 3),
          (signLines.length > 3 ? "..." : ""),
          "【邀请码】",
          ...inviteLines.slice(0, 3),
          (inviteLines.length > 3 ? "..." : ""),
          "【互刷赞】",
          ...sendLines.slice(0, 5),
          (sendLines.length > 5 ? "..." : "")
        ].filter(Boolean).join("\n")
      );

      return $done({});
    }

    // 启动（先延迟一下也行，但不是必须）
    delayNext(stepInvite, "start");

  } catch (e) {
    notify("多点任务", "脚本异常", String(e));
    $done({});
  }
})();
