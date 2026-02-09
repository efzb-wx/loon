/**
 * 多点 Loon Script（多账号 @ 分隔，按 userId 去重）
 * 存储 KEY：duodianck
 * 格式：ticketName=xxx; token=yyy; userId=zzz @ ticketName=...; token=...; userId=...
 *
 * 规则：
 * - 若 userId 已存在：只更新 ticketName / token
 * - 若 userId 不存在：追加新账号
 */

(function () {
  const KEY = "duodianck";
  const SPLIT_ACCT = "@"; // 账号分隔符
  const SPLIT_KV = ";";   // 键值对分隔符（兼容含空格/不含空格）

  function trim(s) { return (s || "").trim(); }

  // 解析 "a=1; b=2; c=3" => {a:"1", b:"2", c:"3"}
  function parseAcct(str) {
    const obj = {};
    const parts = (str || "").split(SPLIT_KV);
    for (let p of parts) {
      p = trim(p);
      if (!p) continue;
      const idx = p.indexOf("=");
      if (idx === -1) continue;
      const k = trim(p.slice(0, idx));
      const v = trim(p.slice(idx + 1));
      if (k) obj[k] = v;
    }
    return obj;
  }

  // 组装 {ticketName, token, userId} => "ticketName=...; token=...; userId=..."
  function buildAcct(o) {
    return `ticketName=${o.ticketName || ""}; token=${o.token || ""}; userId=${o.userId || ""}`;
  }

  // 读取并解析 duodianck => [{ticketName, token, userId}, ...]
  function loadAll() {
    const raw = $persistentStore.read(KEY) || "";
    if (!trim(raw)) return [];
    return raw
      .split(SPLIT_ACCT)
      .map(x => trim(x))
      .filter(Boolean)
      .map(parseAcct)
      .filter(o => o.userId); // 必须有 userId 才算一条有效账号
  }

  // 写回数组 => duodianck
  function saveAll(list) {
    const raw = list.map(buildAcct).join(` ${SPLIT_ACCT} `);
    $persistentStore.write(raw, KEY);
    return raw;
  }

  function notify(title, sub, body) {
    $notification.post(title, sub || "", body || "");
  }

  try {
    // ===== 1) 抓登录响应 =====
    const body = $response.body || "";
    let obj;
    try {
      obj = JSON.parse(body);
    } catch (e) {
      console.log("[duodian] 登录响应非JSON，跳过");
      return $done({});
    }

    const data = obj.data || {};
    const ticketName = data.ticketName;
    const token = data.token;

    if (!ticketName || !token) {
      console.log("[duodian] 未获取到 ticketName/token，跳过");
      return $done({});
    }

    // ===== 2) 主动请求 userId =====
    const url = "https://weixinapp.dmall.com/member/memberInfoNew";
    const headers = {
      "Host": "weixinapp.dmall.com",
      "Connection": "keep-alive",
      "token": token,
      "ticketName": ticketName,
      "Referer": "https://servicewechat.com/wx688e0bc628edd02e/325/page-frame.html"
    };

    $httpClient.get({ url, headers }, function (err, resp, data2) {
      if (err) {
        console.log("[duodian] memberInfoNew 请求失败: " + err);
        notify("多点 CK 获取失败", "memberInfoNew 请求失败", String(err));
        return $done({});
      }

      let res;
      try {
        res = JSON.parse(data2);
      } catch (e) {
        console.log("[duodian] memberInfoNew 返回非JSON");
        notify("多点 CK 获取失败", "memberInfoNew 返回非JSON", "");
        return $done({});
      }

      const userId = res && res.data && res.data.userInfo ? res.data.userInfo.userId : null;
      const code = res ? res.code : "";

      if (code !== "0000" || !userId) {
        console.log("[duodian] 未获取到 userId 或 code!=0000");
        notify("多点 CK 获取失败", `code=${code || "unknown"}`, "未获取到 userId");
        return $done({});
      }

      // ===== 3) 多账号去重更新 =====
      const all = loadAll();
      const idx = all.findIndex(x => String(x.userId) === String(userId));

      let action = "";
      if (idx >= 0) {
        // 已存在：只更新 ticketName/token
        all[idx].ticketName = ticketName;
        all[idx].token = token;
        action = "更新";
      } else {
        // 不存在：追加新账号
        all.push({ ticketName, token, userId: String(userId) });
        action = "新增";
      }

      const finalRaw = saveAll(all);

      console.log(`[duodian] ✅ ${action}成功 userId=${userId}`);
      console.log(`[duodian] duodianck=${finalRaw}`);

      notify(
        `多点 CK ${action}成功 🎉`,
        `userId=${userId}`,
        `当前账号数：${all.length}`
      );

      $done({});
    });

  } catch (e) {
    console.log("[duodian] 脚本异常: " + String(e));
    $done({});
  }
})();
