import jwt from 'jsonwebtoken';

const accessSecret = process.env.ACCESS_TOKEN_SECRET || 'development-access-secret';
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || 'development-refresh-secret';

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