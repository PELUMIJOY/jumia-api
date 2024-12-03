import jwt from 'jsonwebtoken';

export const oauthCallback = (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(400).json({ error: 'User email not found in request.' });
    }

    const { email } = req.user;
    res.redirect(`/auth/send-otp?email=${encodeURIComponent(email)}`);
  } catch (error) {
    console.error('Error in OAuth callback:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
