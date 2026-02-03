export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false });

  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_NOTIFY_TO; // 店担当者の userId

  if (!token || !to) return res.status(500).json({ ok: false, error: "Missing env" });

  let body = req.body;
  // Vercel環境でreq.bodyが文字列のことがあるので保険
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch {}
  }

  const text = body?.text || "予約が入りました（本文未設定）";

  const r = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      to,
      messages: [{ type: "text", text }],
    }),
  });

  if (!r.ok) {
    const t = await r.text();
    return res.status(500).json({ ok: false, error: t });
  }

  return res.status(200).json({ ok: true });
}
