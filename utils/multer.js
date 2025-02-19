import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

// Get the current directory (equivalent to __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadDir = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Ensure the correct path
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const fileFilter = function (req, file, cb) {
  const allowedTypes = /pdf/;
  const fileExtension = path.extname(file.originalname).toLowerCase();
  const isFileTypeValid = allowedTypes.test(fileExtension);
  const isMimeTypeValid = allowedTypes.test(file.mimetype);

  if (isFileTypeValid && isMimeTypeValid) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only PDF files are allowed."), false);
  }
};

const upload = multer({ storage, fileFilter });
export default upload;
