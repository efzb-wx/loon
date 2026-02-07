/**
 * Loon / Surge 通用写法
 * 拦截响应 JSON，从 data.openId 取值写入持久化 mswefls
 */

(function () {
  const KEY = "mswefls";

  function done(body) {
    $done({ body });
  }

  try {
    const body = $response.body || "";
    const obj = JSON.parse(body);

    const openid = obj?.data?.openId;
    if (!openid) return done(body);

    const ok = $persistentStore.write(String(openid), KEY);

    if (ok) {
      // 写入成功提示
      $notification.post("获取到麦斯威尔token", "", `已写入 ${KEY}`);
    }

    return done(body);
  } catch (e) {
    // 解析失败不影响原响应
    return done($response.body);
  }
})();
