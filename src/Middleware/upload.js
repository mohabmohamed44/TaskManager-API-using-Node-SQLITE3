const multer = require("multer");
const path = require("path");

// Memory storage for Supabase
const storage = multer.memoryStorage();

const allowedExtensions = [
  ".jpeg",
  ".jpg",
  ".png",
  ".gif",
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".xlsx",
  ".xls",
  ".csv",
];

const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/csv",
];

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    allowedExtensions.includes(ext) &&
    allowedMimeTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(new Error("File type not allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;
