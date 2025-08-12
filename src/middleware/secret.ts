import { Request, Response, NextFunction } from "express";

const BASE_URL = "https://license.aselstudios.com/api/licenses";

export default async function (req: Request, res: Response, next: NextFunction) {
  const key = req.get("X-API-Secret");
  if (!key) {
    return res.status(401).json({ status: false, message: "Missing X-API-Secret header" });
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = typeof forwardedFor === "string"
    ? forwardedFor.split(",")[0].trim()
    : req.ip || (req.connection.remoteAddress ?? "");

  const resp = await fetch(`${BASE_URL}/${encodeURIComponent(key)}/validate`, {
    method: "POST",
    headers: {
      "X-Forwarded-For": clientIp,
      "User-Agent": req.get("user-agent") || "",
      "Accept": "application/json",
    },
  });

  if (!resp.ok) {
    let body: any = null;
    try { body = await resp.json(); } catch { /* ignore */ }
    const message = body?.error || body?.message || `License API error (HTTP ${resp.status})`;
    return res.status(401).json({ status: false, message });
  }

  const data: any = await resp.json();

  if (!data || data.valid !== true) {
    const message = data?.error || data?.message || "License is not valid";
    return res.status(401).json({ status: false, message });
  }

  next();
}
