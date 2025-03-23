import express from "express";
import { uploadImages } from "../middlewares/uploadImage.js";
import fs from "fs";
import { getHistory } from "../controllers/image.js";

const router = express.Router();

// Upload multiple images
router.post("/upload", uploadImages.array("images", 5), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    const extractedTexts = await Promise.all(
      req.files.map(async (file) => {
        const imagePath = file.path;
        const { data: { text } } = await Tesseract.recognize(imagePath, "eng");

        // Optional: Delete image after processing
        fs.unlinkSync(imagePath);

        return { filename: file.originalname, text };
      })
    );

    return res.json({ extractedTexts });
  } catch (error) {
    console.error("Error processing images:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Retrieve all images for a specific user
router.get("/:userId", (req, res) => {
  const userId = req.params.userId;
  const uploadedFiles = fs.readdirSync("uploads");

  // Filter files belonging to the user
  const userFiles = uploadedFiles.filter((file) =>
    file.startsWith(`${userId}_`)
  );

  if (userFiles.length === 0) {
    return res.status(404).json({ message: "No images found for this user" });
  }

  // Return all matching image files
  res.json({ images: userFiles.map((file) => `/uploads/${file}`) });
});

// Retrieve upload history
router.get("/history", getHistory);

export default router;
