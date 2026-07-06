import jwt from 'jsonwebtoken';
import { config } from '../../config.js';

export function authMiddleware(socket, next) {
  try {
    const token =
      socket.handshake.auth?.token ??
      socket.handshake.headers?.authorization?.replace(/^Bearer\s+/i, '');

    if (!token) return next(new AuthError('No token provided'));

    const payload = jwt.verify(token, config.auth.jwtSecret);

    socket.user = {
      id:       payload.sub,
      username: payload.username,
      roles:    payload.roles ?? [],
    };

    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError)  return next(new AuthError('Token expired'));
    if (err instanceof jwt.JsonWebTokenError)  return next(new AuthError('Invalid token'));
    next(new AuthError('Authentication failed'));
  }
}

class AuthError extends Error {
  constructor(message) {
    super(message);
    this.name    = 'AuthError';
    this.data    = { message };
  }
}