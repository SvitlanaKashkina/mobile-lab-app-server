import prisma from '../prisma/lib/prisma.js';


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user_data.findUnique({
      where: { email },
    });

    if (!user) {
      // If the user is not found
      return res.status(401).json({ error: 'Invalid email or password' });
    }

     // Plaintext password comparison (direct)
     if (user.password !== password) {
      // If the password does not match
      return res.status(401).json({ error: 'Invalid email or password' });
    }

     // Create Base64 photo safely or null
    const fotoBase64 = user.foto ? user.foto.toString('base64') : null;
    console.log("Base64 image preview:", fotoBase64 ? fotoBase64.slice(0, 10) : "No picture");
    console.log("Server sends Base64:", fotoBase64 ? fotoBase64.slice(0, 10) : "zero");

    // Successful response if data is entered correctly
    res.status(200).json({
       message: 'Login successful',
      userId: user.userId,
    });
    console.log(" Login successful", user);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};
