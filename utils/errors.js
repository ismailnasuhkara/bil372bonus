export class AppError extends Error {
  constructor(message, code, meta = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.meta = meta;
  }
}

export class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} ${id} not found`, 'NOT_FOUND', { resource, id });
  }
}

export class ValidationError extends AppError {
  constructor(message, fields = {}) {
    super(message, 'VALIDATION_ERROR', { fields });
  }
}

export class AuthError extends AppError {
  constructor(message) {
    super(message, 'AUTH_ERROR');
    this.data = { message };
  }
}

export class PermissionError extends AppError {
  constructor(action) {
    super(`Not permitted to perform: ${action}`, 'PERMISSION_ERROR', { action });
  }
}

export function handleSocketError(socket, err) {
  if (err instanceof AppError) {
    socket.emit('error', { code: err.code, message: err.message, meta: err.meta });
  } else {
    console.error('[unhandled]', err);
    socket.emit('error', { code: 'INTERNAL_ERROR', message: 'Something went wrong' });
  }
}