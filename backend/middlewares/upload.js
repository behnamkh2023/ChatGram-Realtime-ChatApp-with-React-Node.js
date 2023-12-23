const multer = require("multer");
const { mkdir } = require("fs/promises");
function makeDir(folder) {
  let year = new Date().getFullYear();
  let month = String(new Date().getMonth() + 1).padStart(2, "0");
  let day = String(new Date().getDate()).padStart(2, "0");
  return `./public/uploads/${folder}/${year}/${month}/${day}`;
}

const ImageStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let dir = makeDir("images");
    try {
      await mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err, dir);
    }
  },
  filename: (req, file, cb) => {
    let fileName = file.originalname.replace(/\s/g, "-");
    cb(null, Date.now() + "-" + fileName);
  },
});

const imgFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const uploadImg = multer({
  storage: ImageStorage,
  limits: {
    fileSize: 1024 * 1024 * 2,
  },
  fileFilter: imgFilter,
});
const FileStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let dir = makeDir("files");
    try {
      await mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err, dir);
    }
  },
  filename: (req, file, cb) => {
    let fileName = file.originalname.replace(/\s/g, "-");
    cb(null, Date.now() + "-" + fileName);
  },
});

const voiceStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    let dir = makeDir("chatFile");
    try {
      await mkdir(dir, { recursive: true });
      cb(null, dir);
    } catch (err) {
      cb(err, dir);
    }
  },
  filename: (req, file, cb) => {
    let fileName = file.originalname.replace(/\s/g, "-");
    cb(null, Date.now() + "-" + fileName + ".wav");
  },
});

const fileFilter = (req, file, cb) => {
  cb(null, true);
};
const voiceFilter = (req, file, cb) => {
  if (file.mimetype === "audio/webm") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const uploadFile = multer({
  storage: FileStorage,
  limits: {
    fileSize: 1024 * 1024 * 30,
  },
  fileFilter: fileFilter,
});
const uploadVoice = multer({
  storage: voiceStorage,
  limits: {
    fileSize: 1024 * 1024 * 30,
  },
  fileFilter: voiceFilter,
});

module.exports = {
  uploadImg,
  uploadFile,
  uploadVoice,
};
