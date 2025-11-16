import { Request, Response, NextFunction } from "express";
import asyncHandler from "express-async-handler";
import { Texture } from "./texture.model";

const savePlayer = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body.textures = JSON.parse(req.body.textures);
      const player = new Texture(req.body);
      const validateErr = player.validateSync();
      if (validateErr) {
        res.status(500).json({ status: false, error: validateErr });
        return;
      }

      await Texture.replaceOne({ uniqueId: req.body.uniqueId }, req.body, {
        upsert: true,
      }).exec();

      res.status(200).json({ status: true, data: player });
    } catch (e) {
      res.status(500).json({ status: false, error: e });
    }
  }
);

const getPlayerById = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.params.uniqueId) {
        res.status(400).json({ message: "Unique ID is required!" });
        return;
      }
      const player = await Texture.findOne({ uniqueId: req.params.uniqueId });
      if (!player) {
        res.status(404).json({ message: "Player not found!" });
        return;
      }

      res.status(200).json(player);
    } catch (e) {
      res.status(500).json(e);
    }
  }
);

const getAll = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const players = await Texture.find({ secret: req.get("X-API-Secret") });
      res.status(200).json(players);
    } catch (e) {
      res.status(500).json(e);
    }
  }
);

export { savePlayer, getAll, getPlayerById };