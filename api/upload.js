// api/upload.js
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "public/images");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("Created folder:", uploadDir);
}

// where to store
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `image-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

// only allow these
const ALLOWED_EXT = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
const ALLOWED_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const isExtOk = ALLOWED_EXT.includes(ext);
    const isMimeOk = ALLOWED_MIME.includes(file.mimetype);

    if (isExtOk && isMimeOk) {
      return cb(null, true);
    }

    // reject non-image files
    cb(
      new Error(
        "Only image files (jpg, jpeg, png, gif, webp) are allowed!"
      )
    );
  },
});

export default upload;
