import express from "express";
import {
  getAll,
  getPlayerById,
  savePlayer,
} from "./texture.controller";

const router = express.Router();

router.get<{}, {}>("/", getAll);
router.get<{}, {}>("/:uniqueId", getPlayerById);
router.post<{}, {}>("/", savePlayer);

export default router;