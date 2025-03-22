import Tesseract from "tesseract.js";
import fs from "fs";
import path from "path";

export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const userId = req.user.id; // Get User ID from middleware
    const imagePath = path.join("uploads", `${userId}.jpg`);

    // Check if the file already exists
    if (fs.existsSync(imagePath)) {
      return res
        .status(409)
        .json({ message: "Image already exists for this user" });
    }

    // Process the image using OCR
    const {
      data: { text },
    } = await Tesseract.recognize(imagePath, "eng");

    // Generate a public URL (assuming static file hosting)
    const imageUrl = `${req.protocol}://${req.get(
      "host"
    )}/uploads/${userId}.jpg`;

    res.json({ extractedText: text, imagePath, imageUrl });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error processing image", error: error.message });
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = fs.readdirSync("uploads").map((filename) => ({
      filename,
      timestamp: fs.statSync(`uploads/${filename}`).mtime,
    }));
    res.json(history); // Return the list of uploaded images
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error getting history", error: error.message });
  }
};
