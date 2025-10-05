import prisma from '../prisma/lib/prisma.js';

export const getUserById = async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log('Received userId:', userId);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const user = await prisma.user_data.findUnique({
      where: { userId },
      select: {
        userId: true,
        firstname: true,
        lastname: true,
        position: true,
        email: true,
        foto: true,
      },
    });

    if (!user) {
      console.error(`User with ID ${userId} not found`);
      return res.status(404).json({ error: 'User not found' });
    }

     // Make sure user.foto is a buffer before converting to Base64
    let fotoBase64 = null;
    if (user.foto) {
      if (Buffer.isBuffer(user.foto)) {
        fotoBase64 = user.foto.toString('base64');
      } else if (user.foto instanceof Uint8Array) {
        fotoBase64 = Buffer.from(user.foto).toString('base64');
      } else {
        console.warn('Unexpected type for user.foto:', typeof user.foto);
        fotoBase64 = null;
      }
    }
    console.log("Image URI to frontend:", fotoBase64);
    res.json({
      ...user,
      foto: fotoBase64,
    });

  } catch (err) {
    console.error('Error retrieving user:', err);
    res.status(500).json({ error: 'Error retrieving user' });
  }
};


export const updateUserPhoto = async (req, res) => {
  const { userId } = req.params;
  let { foto } = req.body;

  if (!foto) {
    return res.status(400).json({ error: 'No photo included in the request' });
  }

  // Remove Base64 prefix if present
  if (foto.startsWith('data:image')) {
    foto = foto.split(',')[1];
  }

  try {
    // Convert Base64 to Buffer (for bytea)
    const bufferData = Buffer.from(foto, 'base64');

    const updatedUser = await prisma.user_data.update({
      where: { userId: parseInt(userId) },
      data: {
        foto: bufferData,
      },
    });

    res.json({ message: 'Photo updated successfully', data: updatedUser });
  } catch (err) {
    console.error('Error updating photo:', err);
    res.status(500).json({ error: 'Error updating photo' });
  }
};


export const deleteUser = async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log("Delete user with ID:", userId);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    await prisma.user_data.delete({
      where: { userId },
    });
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Error deleting user,status 500' });
  }
};