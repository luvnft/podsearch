import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(__dirname);
    cb(null, "../../uploads");
  },
  filename: (req, file, cb) => {
    // Store file with unique name
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const audioMimeTypes = ["audio/mpeg", "audio/wav", "audio/aac", "wav", "mp3", "audio/wave"];

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    console.log(file);
    const fileType: string = file?.originalname.split(".")[-1] || "";
    console.log("Hello: ", fileType);
    if (audioMimeTypes.includes(file.mimetype) || audioMimeTypes.includes(fileType)) {
      // check file type to be audio
      cb(null, true);
    } else {
      cb(null, false); // reject the file, no error
      throw new Error("Not an audio file!"); // throw an error
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 10, // limit to 10mb
  },
});

export default upload;
