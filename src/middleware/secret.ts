import { Request, Response, NextFunction } from "express";

import mongoose from "mongoose";

const SecretSchema = new mongoose.Schema({
  secret: { type: String, required: true, unique: true },
  allowedIps: { type: [String], default: [] },
});

const Secret = mongoose.model("Secret", SecretSchema);

export default async function (req: Request, res: Response, next: NextFunction) {
  const key = req.get("X-API-Secret");
  const secret = await Secret.findOne({ secret: key });
  if (!secret) {
    return res.status(401).json({ status: false, message: "Secret key is not valid!" });
  }

  const forwardedFor = req.headers["x-forwarded-for"];
  const clientIp = typeof forwardedFor === "string"
  ? forwardedFor.split(",")[0].trim()
  : req.ip || (req.connection.remoteAddress ?? "");
  if (secret.allowedIps.length > 0 && !secret.allowedIps.includes(clientIp)) {
    return res.status(403).json({ status: false, message: "Access denied from this IP address!" });
  }

  next();
}
