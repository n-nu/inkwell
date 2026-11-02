import TokenService from '../services/token.service.js';
import UserRepository from '../repositories/user.repository.js';

const tokenService = new TokenService();
const userRepository = new UserRepository();

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const match = authHeader.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Authentication is required.' },
    });
  }

  let payload;
  try {
    payload = tokenService.verifyAccessToken(match[1]);
  } catch {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired access token.' },
    });
  }

  if (!payload || typeof payload !== 'object' || typeof payload.sub !== 'string') {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired access token.' },
    });
  }

  try {
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      return res.status(401).json({
        error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired access token.' },
      });
    }

    req.user = { id: user.id, email: user.email };
    return next();
  } catch (error) {
    return next(error);
  }
}

export default requireAuth;
