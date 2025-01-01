// api/image.js
let images = [];

export default async (req, res) => {
  try {
    console.log(`Received ${req.method} request to ${req.url}`);

    // GET: Fetch all images
    if (req.method === 'GET') {
      return res.status(200).json(images);
    }

    // PUT: Toggle enable/disable status of an image
    if (req.method === 'PUT') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
      }

      const imageIndex = images.findIndex((img) => img.id == id);

      if (imageIndex === -1) {
        return res.status(404).json({ message: 'Image not found' });
      }

      // Toggle the enabled status of the image
      images[imageIndex].enabled = !images[imageIndex].enabled;
      return res.status(200).json(images[imageIndex]);
    }

    // DELETE: Remove an image
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ message: 'Image ID is required' });
      }

      const initialLength = images.length;
      images = images.filter((img) => img.id != id);

      if (images.length === initialLength) {
        return res.status(404).json({ message: 'Image not found' });
      }

      return res.status(200).json({ message: 'Image deleted successfully' });
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  } catch (error) {
    console.error('Error in image API:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
