import prisma from '../prisma/lib/prisma.js';

export const handleForgotPassword = async (req, res) => {
  const { email, pin } = req.body;

  try {
    const pinAsInt = parseInt(pin, 10); // Converts the PIN to an integer

    // Search users by email and PIN
    const user = await prisma.user_data.findFirst({
      where: { email, pin: pinAsInt } // Verify PIN as integer
    });

    if (!user) {
      return res.status(401).json({ error: 'Email or PIN is incorrect' });
    }

    console.log('Password was sent to frontend:', user.password);

    // Return user's password
    return res.status(200).json({
      message: 'Passwort gefunden',
      password: user.password,
    });
  } catch (error) {
    console.error('Error retrieving password:', error);
    return res.status(500).json({ error: 'Server error retrieving password' });
  }
};