const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const IMAGES_FILE = path.join(process.cwd(), 'images.json');

// Configure storage for uploaded images
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads');
    fs.mkdir(uploadPath, { recursive: true })
      .then(() => cb(null, uploadPath))
      .catch(cb);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max file size 30MB
});

// Multer middleware to handle multiple file uploads
const multerMiddleware = upload.array('images', 10); // Maximum 10 files

async function readImages() {
  try {
    const data = await fs.readFile(IMAGES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeImages(images) {
  await fs.writeFile(IMAGES_FILE, JSON.stringify(images, null, 2));
}

module.exports = async (req, res) => {
  if (req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        multerMiddleware(req, res, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // If no files are uploaded, return an error
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files were uploaded.' });
      }

      const uploadedImages = req.files.map((file) => ({
        id: Date.now() + Math.random(), // Unique ID for each image
        fileName: file.filename,
        filePath: `uploads/${file.filename}`,
        enabled: true,
      }));

      const existingImages = await readImages();
      const updatedImages = [...existingImages, ...uploadedImages];
      await writeImages(updatedImages);

      res.status(200).json(updatedImages);
    } catch (error) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds the 30MB limit per image.' });
      }
      console.error('Error in upload API:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
};

