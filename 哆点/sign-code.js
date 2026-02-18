/**
 * 多点：签到 + 生成邀请码 + 互刷赞(sendKey) + 开宝箱(openBox) - Loon（带随机延迟）
 *
 * ✅ 所有发包之间随机延迟 1~2 秒（整数），串行执行不并发
 */

(function () {
  const KEY_CK = "duodianck";
  const KEY_CODE = "duodiancode";

  const SPLIT_ACCT = "@";
  const SPLIT_KV = ";";

  const URL_CHECKIN = "https://sign-in.dmall.com/checkIn";
  const URL_INVITE = "https://sign-in.dmall.com/generateInviteCode";
  const URL_SENDKEY = "https://sign-in.dmall.com/sendKey";
  const URL_OPENBOX = "https://sign-in.dmall.com/openBox";

  const INVITE_BODY = "actId=521";
  const OPENBOX_BODY = "index=0";

  // ====== checkIn body（你的抓包体，原样放）======
  const BODY_TEMPLATE =
    "tenantId=1&platform=IOS&vendorId=1&trackData=%7B%22session_id%22%3A%22CB7CCC587AC0000290301A01B01C83F0%22%2C%22sdk_type%22%3A%22js%22%2C%22data_seq%22%3A0%2C%22data_version%22%3A%221.0%22%2C%22debug_mode%22%3A%22DEBUG_OFF%22%2C%22client_time%22%3A0%2C%22unique_id%22%3A%22%22%2C%22user_id%22%3A%22%22%2C%22ticket_name%22%3A%2255CBFA466B7FF5593EB30D97C1B49A6C6448C1078A42009AB1060276F254DCAFCCAB0D04491BA410706F9F6AEBF47154D6D11B502604B7A7435FF09746F6E94998AB0AE8881C7E7501DBC9E0B2A093FA3B1B857596A8C7935BCF089517ECF78864BCBD5DB5C5AC3FB466FBD1DE3616B0376DF87C0CAD8F044CA53E7B79A488D5%22%2C%22project%22%3A%22%E5%95%86%E5%9F%8EAPP%22%2C%22env%22%3A%22app_ios%22%2C%22%24system%22%3A%7B%22app_version%22%3A%226.7.2%22%2C%22first_session_time%22%3A1758501034047%2C%22session_count%22%3A30%2C%22imei%22%3A%22%22%2C%22idfa%22%3A%22%22%2C%22mac%22%3A%22%22%2C%22android_id%22%3A%22%22%2C%22user_agent%22%3A%22Mozilla%2F5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2016_3_1%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Mobile%2F15E148Dmall%2F6.7.2%22%2C%22dev_type%22%3A%22iPhone%22%2C%22dev_platform%22%3A%22IOS%22%2C%22dev_platform_version%22%3A%2216.3.1%22%2C%22dev_manufacturer%22%3A%22iPhone14%2C2%22%2C%22dev_carrier%22%3A%22%22%2C%22dev_network_type%22%3A%222%22%2C%22app_notification_state%22%3A%221%22%7D%2C%22%24attrs%22%3A%7B%22page_title%22%3A%22%E7%AD%BE%E5%88%B0%22%2C%22page_url%22%3A%22https%3A%2F%2Fappsign-in.dmall.com%2F%3FdmTransStatusBar%3Dtrue%26dmShowTitleBar%3Dfalse%26bounces%3Dfalse%26dmNeedLogin%3Dtrue%23%2F%22%2C%22vender_id%22%3A%221%22%2C%22store_id%22%3A%2213044%22%7D%2C%22%24source%22%3A%7B%22tpc%22%3A%22%22%2C%22tdc%22%3A%22%22%7D%2C%22system%22%3A%7B%22app_version%22%3A%226.7.2%22%2C%22first_session_time%22%3A1758501034047%2C%22session_count%22%3A30%2C%22imei%22%3A%22%22%2C%22idfa%22%3A%22%22%2C%22mac%22%3A%22%22%2C%22android_id%22%3A%22%22%2C%22user_agent%22%3A%22Mozilla%2F5.0%20%28iPhone%3B%20CPU%20iPhone%20OS%2016_3_1%20like%20Mac%20OS%20X%29%20AppleWebKit%2F605.1.15%20%28KHTML%2C%20like%20Gecko%29%20Mobile%2F15E148Dmall%2F6.7.2%22%2C%22dev_type%22%3A%22iPhone%22%2C%22dev_platform%22%3A%22IOS%22%2C%22dev_platform_version%22%3A%2216.3.1%22%2C%22dev_manufacturer%22%3A%22iPhone14%2C2%22%2C%22dev_carrier%22%3A%22%22%2C%22dev_network_type%22%3A%222%22%2C%22app_notification_state%22%3A%221%22%7D%2C%22attrs%22%3A%7B%22page_title%22%3A%22%E7%AD%BE%E5%88%B0%22%2C%22page_url%22%3A%22https%3A%2F%2Fappsign-in.dmall.com%2F%3FdmTransStatusBar%3Dtrue%26dmShowTitleBar%3Dfalse%26bounces%3Dfalse%26dmNeedLogin%3Dtrue%23%2F%22%2C%22vender_id%22%3A%221%22%2C%22store_id%22%3A%2213044%22%7D%2C%22source%22%3A%7B%22tpc%22%3A%22%22%2C%22tdc%22%3A%22%22%7D%7D";

  // ===== 随机延迟：1~2 秒（整数）=====
  function randDelaySec() {
    return Math.floor(Math.random() * 2) + 1; // 1..2
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

  function parseMsgFromJSON(data) {
    try {
      const j = JSON.parse(data || "{}");
      let msg = j.msg || j.errMsg || j.message || "";
      if (!msg && j.code) msg = `code=${j.code}`;
      if (j.code && msg) msg = `${j.code} ${msg}`.trim();
      const ok = !j.code || j.code === "0000";
      return { ok, msg: msg || "OK", json: j };
    } catch (e) {
      return { ok: true, msg: (data || "").slice(0, 80) || "响应非JSON", json: null };
    }
  }

  function doCheckin(acct, cb) {
    const headers = commonHeaders(
      acct,
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148Dmall/6.7.2"
    );
    const body = replaceTrackTicketName(BODY_TEMPLATE, acct.ticketName);

    post(URL_CHECKIN, headers, body, function (err, data) {
      if (err) return cb({ ok: false, userId: acct.userId, msg: String(err) });
      const p = parseMsgFromJSON(data);
      cb({ ok: p.ok, userId: acct.userId, msg: p.msg });
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
        const msg = (j.code ? `${j.code} ` : "") + (j.msg || j.errMsg || "OK");
        cb({ ok, userId: acct.userId, code, msg: msg.trim() });
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
      const p = parseMsgFromJSON(data);
      cb({ ok: p.ok, userId: acct.userId, inviteCode, msg: p.msg });
    });
  }

  function doOpenBox(acct, cb) {
    const headers = commonHeaders(
      acct,
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_3_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148Dmall/6.7.8"
    );

    post(URL_OPENBOX, headers, OPENBOX_BODY, function (err, data) {
      if (err) return cb({ ok: false, userId: acct.userId, msg: String(err) });
      const p = parseMsgFromJSON(data);
      cb({ ok: p.ok, userId: acct.userId, msg: p.msg });
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

  // ===== 主流程 =====
  try {
    const accounts = loadAccounts();
    if (accounts.length === 0) {
      notify("多点任务", "未找到账号", "请先获取并保存 duodianck");
      return $done({});
    }

    const signResults = [];
    const inviteResults = [];
    const sendKeyResults = [];
    const openBoxResults = [];

    // 1) 每账号：签到 -> 延迟 -> 邀请码 -> 延迟 -> 下一个账号
    let idx = 0;

    function stepInvite() {
      if (idx >= accounts.length) {
        const codesAligned = inviteResults.map(r => (r && r.ok && r.code) ? r.code : "");
        const rawCodes = codesAligned.join(` ${SPLIT_ACCT} `);
        $persistentStore.write(rawCodes, KEY_CODE);

        // 2) 互刷赞
        return delayNext(function () {
          stepSendKey(codesAligned);
        }, "before sendKey");
      }

      const acct = accounts[idx];

      doCheckin(acct, function (r1) {
        signResults.push(r1);

        delayNext(function () {
          doInvite(acct, function (r2) {
            inviteResults[idx] = r2;
            idx++;

            delayNext(stepInvite, "next account");
          });
        }, "checkIn->invite");
      });
    }

    // 2) 互刷赞：每个 sendKey 前延迟
    function stepSendKey(codesAligned) {
      const n = accounts.length;
      const usable = codesAligned.filter(c => !!c).length;

      if (usable === 0) {
        // 无邀请码，直接进入 openBox
        return delayNext(function () {
          stepOpenBox();
        }, "skip sendKey -> openBox");
      }

      const tasks = [];
      for (let i = 0; i < n; i++) {
        const picks = get3CodesForIndex(i, codesAligned);
        for (const code of picks) tasks.push({ acctIndex: i, inviteCode: code });
      }

      let t = 0;
      function runTask() {
        if (t >= tasks.length) {
          // sendKey 完成 -> openBox
          return delayNext(function () {
            stepOpenBox();
          }, "sendKey done -> openBox");
        }

        const job = tasks[t++];
        const acct = accounts[job.acctIndex];

        delayNext(function () {
          doSendKey(acct, job.inviteCode, function (r) {
            sendKeyResults.push(r);
            runTask();
          });
        }, "sendKey");
      }

      runTask();
    }

    // 3) openBox：每个账号发一次 index=0（串行+延迟）
    let ob = 0;
    function stepOpenBox() {
      if (ob >= accounts.length) {
        return finish();
      }

      const acct = accounts[ob++];

      delayNext(function () {
        doOpenBox(acct, function (r) {
          openBoxResults.push(r);
          stepOpenBox();
        });
      }, "openBox");
    }

    function finish() {
      const okSign = signResults.filter(r => r.ok).length;
      const failSign = signResults.length - okSign;

      const okInvite = inviteResults.filter(r => r && r.ok).length;
      const failInvite = accounts.length - okInvite;

      const okSend = sendKeyResults.filter(r => r.ok).length;
      const failSend = sendKeyResults.length - okSend;

      const okOpen = openBoxResults.filter(r => r.ok).length;
      const failOpen = openBoxResults.length - okOpen;

      const signLines = signResults.map(r => `${r.ok ? "✅" : "❌"} userId=${r.userId} | ${r.msg}`);
      const inviteLines = inviteResults.map(r => {
        if (!r) return "❌ 未执行";
        return `${r.ok ? "✅" : "❌"} userId=${r.userId} | ${r.code || ""} ${r.msg || ""}`.trim();
      });
      const sendLines = sendKeyResults.map(r => `${r.ok ? "✅" : "❌"} userId=${r.userId} -> ${r.inviteCode} | ${r.msg}`);
      const openLines = openBoxResults.map(r => `${r.ok ? "✅" : "❌"} userId=${r.userId} | ${r.msg}`);

      notify(
        "多点任务完成",
        `签到 ${okSign}/${failSign} | 邀请码 ${okInvite}/${failInvite} | 互刷赞 ${okSend}/${failSend}（${sendKeyResults.length}次） | 开宝箱 ${okOpen}/${failOpen}`,
        [
          "【签到】",
          ...signLines.slice(0, 3),
          (signLines.length > 3 ? "..." : ""),
          "【邀请码】",
          ...inviteLines.slice(0, 3),
          (inviteLines.length > 3 ? "..." : ""),
          "【互刷赞】",
          ...sendLines.slice(0, 4),
          (sendLines.length > 4 ? "..." : ""),
          "【开宝箱】",
          ...openLines.slice(0, 3),
          (openLines.length > 3 ? "..." : "")
        ].filter(Boolean).join("\n")
      );

      $done({});
    }

    // 启动（先延迟一下）
    delayNext(stepInvite, "start");

  } catch (e) {
    notify("多点任务", "脚本异常", String(e));
    $done({});
  }
})();
