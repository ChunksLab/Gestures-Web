import { Request, Response, NextFunction } from "express";

const BASE_URL = "https://license.aselstudios.com/api/licenses";

export default async function (req: Request, res: Response, next: NextFunction) {
  try {
    const key = req.get("X-API-Secret");
    if (!key) {
      return res.status(401).json({ status: false, message: "Missing X-API-Secret header" });
    }

    const forwardedFor = req.headers["x-forwarded-for"];
    const clientIp = typeof forwardedFor === "string"
      ? forwardedFor.split(",")[0].trim()
      : req.ip || (req.connection.remoteAddress ?? "");

    let resp: any;
    try {
      resp = await fetch(`${BASE_URL}/${encodeURIComponent(key)}/validate`, {
        method: "GET",
        headers: {
          "X-Forwarded-For": clientIp,
          "User-Agent": req.get("user-agent") || "",
          "Accept": "application/json",
        },
      });
    } catch (networkErr: any) {
      console.error("❌ License API connection failed:", networkErr);
      return res.status(500).json({
        status: false,
        message: "License validation service unreachable. Please try again later.",
      });
    }

    let data: any = null;
    try {
      data = await resp.json();
    } catch (jsonErr: any) {
      console.error("⚠️ Invalid JSON from License API:", jsonErr);
      return res.status(500).json({
        status: false,
        message: "Received invalid data from License API.",
      });
    }

    // Handle unsuccessful HTTP responses or invalid data
    if (!resp.ok || !data || data.valid !== true) {
      const message =
        data?.error ||
        data?.message ||
        `License validation failed (HTTP ${resp.status})`;
      console.warn("🔒 License check failed:", message);
      return res.status(401).json({ status: false, message });
    }

    // All good → continue request
    next();
  } catch (err: any) {
    // Final global safety net
    console.error("🔥 Unexpected error in license middleware:", err);
    return res.status(500).json({
      status: false,
      message: "Internal server error during license verification.",
    });
  }
}
