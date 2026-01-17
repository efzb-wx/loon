// Loon response rewrite script

if ($response && $response.body) {
  const newBody = JSON.stringify({
    e: 0,
    r: {
      a: "967"
    }
  });

  $done({
    body: newBody
  });
} else {
  $done({});
}
