import jwt from 'jsonwebtoken';

function requireSecret(name) {
  const secret = process.env[name];
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) {
    throw new Error(`${name} must be configured with at least 32 bytes.`);
  }
  return secret;
}

const accessSecret = requireSecret('ACCESS_TOKEN_SECRET');
const refreshSecret = requireSecret('REFRESH_TOKEN_SECRET');
if (accessSecret === refreshSecret) {
  throw new Error('ACCESS_TOKEN_SECRET and REFRESH_TOKEN_SECRET must be different.');
}

export class TokenService {
  issueTokens(user) {
    const payload = { sub: user.id, email: user.email };

    return {
      accessToken: jwt.sign(payload, accessSecret, { expiresIn: '15m' }),
      refreshToken: jwt.sign(payload, refreshSecret, { expiresIn: '7d' }),
    };
  }

  verifyAccessToken(token) {
    return jwt.verify(token, accessSecret);
  }

  verifyRefreshToken(token) {
    return jwt.verify(token, refreshSecret);
  }
}

export default TokenService;