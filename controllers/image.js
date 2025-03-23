import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

export const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No images uploaded" });
    }

    const userId = req.user.id; // Get User ID from middleware
    const uploadDir = "uploads";

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let results = [];

    for (const file of req.files) {
      const timestamp = Date.now();
      const imagePath = path.join(uploadDir, `${userId}_${timestamp}.jpg`);
      fs.writeFileSync(imagePath, file.buffer); // Save the file

      // Process the image using OCR
      const {
        data: { text },
      } = await Tesseract.recognize(imagePath, "eng");

      // Generate a public URL (assuming static file hosting)
      const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${userId}_${timestamp}.jpg`;

      results.push({ imageUrl, extractedText: text });
    }

    res.json({ message: "Images uploaded successfully", results });
  } catch (error) {
    res.status(500).json({ message: "Error processing images", error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = fs.readdirSync("uploads").map((filename) => ({
      filename,
      timestamp: fs.statSync(`uploads/${filename}`).mtime,
    }));
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error getting history", error: error.message });
  }
};
