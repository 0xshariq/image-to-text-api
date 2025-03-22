import express from "express";
import upload from "../middlewares/uploadImage.js";
import path from "path";
import fs from "fs";
import { getHistory } from "../controllers/image.js";

const router = express.Router();

// Upload image
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }
  const filePath = `/uploads/${req.file.filename}`;
  res.json({ message: "Image uploaded successfully", filePath });
});

// Retrieve uploaded image
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const fileExtensions = [".jpg", ".jpeg", ".png"];

  // Check all possible extensions
  for (const ext of fileExtensions) {
    const filePath = path.join("uploads", `${userId}${ext}`);
    if (fs.existsSync(filePath)) {
      return res.sendFile(path.resolve(filePath));
    }
  }

  res.status(404).json({ message: "Image not found" });
});

router.get("/history", getHistory);

export default router;
