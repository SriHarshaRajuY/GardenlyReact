import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "gardenly/images",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 1000, crop: "limit" }],
  },
});

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

    cb(new Error("Only image files (jpg, jpeg, png, gif, webp) are allowed!"));
  },
});

export { cloudinary };
export default upload;
