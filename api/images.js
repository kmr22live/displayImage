const fs = require('fs').promises;
const path = require('path');

const IMAGES_FILE = path.join(process.cwd(), 'images.json');

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
  try {
    // GET: Fetch all images
    if (req.method === 'GET') {
      const images = await readImages();
      return res.status(200).json(images);
    }

    // PUT: Toggle enable/disable status of an image
    if (req.method === 'PUT') {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
      }

      const images = await readImages();
      const imageIndex = images.findIndex((img) => img.id == id);

      if (imageIndex === -1) {
        return res.status(404).json({ message: 'Image not found' });
      }

      images[imageIndex].enabled = !images[imageIndex].enabled;
      await writeImages(images);
      return res.status(200).json(images);
    }

    // DELETE: Remove an image
    if (req.method === 'DELETE') {
      const { id } = req.params;
      if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
      }

      const images = await readImages();
      const updatedImages = images.filter((img) => img.id != id);

      if (images.length === updatedImages.length) {
        return res.status(404).json({ message: 'Image not found' });
      }

      await writeImages(updatedImages);
      return res.status(200).json(updatedImages);
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Error in image API:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

