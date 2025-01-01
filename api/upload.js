import multer, { memoryStorage } from 'multer';
import { put } from '@vercel/blob';

const storage = memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // Max file size 30MB
});

const multerMiddleware = upload.array('images', 10); // Maximum 10 files

export default async (req, res) => {
  console.log(`Received ${req.method} request to ${req.url}`);

  if (req.method === 'POST') {
    try {
      // Run the multerMiddleware to handle file upload
      await new Promise((resolve, reject) => {
        multerMiddleware(req, res, (err) => {
          if (err) reject(err); // Reject on error
          else resolve(); // Resolve when done
        });
      });

      // Check if files are uploaded
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: 'No files were uploaded.' });
      }

      // Process each uploaded file
      const uploadPromises = req.files.map(async (file) => {
        try {
          // Upload to vercel blob storage and get the file URL
          const blob = await put(file.originalname, file.buffer, {
            access: 'public',
          });

          // Return the uploaded file data
          return {
            id: Date.now() + Math.random(),
            fileName: file.originalname,
            filePath: blob.url, // URL returned by @vercel/blob
            enabled: true,
          };
        } catch (error) {
          // Catch any errors related to file upload to vercel blob
          console.error('Error uploading file:', error);
          return null; // Return null if the upload fails
        }
      });

      // Wait for all uploads to complete
      const uploadedImages = await Promise.all(uploadPromises);

      // Filter out any failed uploads (null values)
      const validImages = uploadedImages.filter((image) => image !== null);

      // If no valid images were uploaded, return an error
      if (validImages.length === 0) {
        return res.status(500).json({ message: 'Failed to upload images.' });
      }

      // Return the successfully uploaded images
      return res.status(200).json(validImages);
    } catch (error) {
      console.error('Error in upload API:', error);
      
      // Handle specific error scenarios like file size limits
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds the 30MB limit per image.' });
      }
      
      // Return a generic server error message
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  } else {
    // If the method is not POST, return 405 Method Not Allowed
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
};
