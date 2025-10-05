import prisma from '../prisma/lib/prisma.js';

export const registerUser = async (req, res) => {
  const { email, pin } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const existingUser = await prisma.user_data.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Convert and check PIN
    const parsedPin = parseInt(pin, 10);
    if (isNaN(parsedPin)) {
      return res.status(400).json({ error: 'Invalid PIN. Please use numbers only' });
    }

     // Process optional photo (if available)
    const fotoBuffer = req.body.foto
      ? Buffer.from(req.body.foto, 'base64')
      : null;

    // Process optional push token (if available)
    const pushToken = typeof req.body.pushtoken === 'string' && req.body.pushtoken.trim() !== ""
    ? req.body.pushtoken
    : null;

    // Create user
    const newUser = await prisma.user_data.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        position: req.body.position,
        email: req.body.email,
        password: req.body.password,
        pin: parsedPin,
        foto: fotoBuffer,
        pushtoken: pushToken
      }
    });

    res.status(201).json({
      userId: newUser.userId,
      message: 'User created successfully'
    });
    console.log("✅ User registered successfully:", newUser);

  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ error: 'Error creating user' });
  }
};