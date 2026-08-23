const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || typeof username !== 'string' || username.trim().length === 0) {
      return res.status(400).json({ error: 'Username is required' });
    }
    if (!password || typeof password !== 'string' || password.trim().length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }

    const expectedUser = process.env.ADMIN_USER || 'admin';
    const expectedPassword = process.env.ADMIN_PASSWORD || 'adminpassword';

    const usernameMatch = username.length === expectedUser.length &&
      crypto.timingSafeEqual(Buffer.from(username), Buffer.from(expectedUser));

    const passwordMatch = password.length === expectedPassword.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(expectedPassword));

    if (usernameMatch && passwordMatch) {
      const token = jwt.sign(
        { username },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      return res.status(200).json({ token, message: 'Authentication successful' });
    }

    return res.status(401).json({ error: 'Invalid username or password' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
