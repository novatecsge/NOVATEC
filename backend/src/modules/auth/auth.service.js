const crypto = require('crypto');
const AppError = require('../../shared/errors/AppError');
const { hashPassword, comparePassword } = require('../../shared/utils/password');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('../../shared/utils/jwt');
const { withTransaction } = require('../../shared/utils/transaction');
const authRepository = require('./auth.repository');
const ROLES = require('../../shared/constants/roles');
const { sendPasswordResetEmail } = require('../../shared/services/mail.service');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const getRefreshTokenExpirationDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date;
};

const sanitizeUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role_name,
  isActive: user.is_active,
  isDisabled: user.is_disabled,
  hasDisability: user.has_disability,
  consentAccepted: user.consent_accepted,
  createdAt: user.created_at,
  totalVehicles: Number(user.total_vehicles || 0)
});

const getPasswordResetExpirationDate = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 30);
  return date;
};

const requestPasswordReset = async (email) => {
  return withTransaction(async (client) => {
    const user = await authRepository.findUserByEmail(email, client);

    if (!user || !user.is_active || user.is_disabled) {
      return { sent: true };
    }

    await authRepository.revokeActivePasswordResetTokens(user.id, client);

    const rawToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = hashToken(rawToken);

    await authRepository.createPasswordResetToken({
      userId: user.id,
      resetTokenHash,
      expiresAt: getPasswordResetExpirationDate()
    }, client);

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${rawToken}`;

    await sendPasswordResetEmail({
      to: user.email,
      fullName: user.full_name,
      resetUrl
    });

    await authRepository.createAuditLog({
      actorUserId: user.id,
      action: 'REQUEST_PASSWORD_RESET',
      moduleName: 'AUTH',
      entityType: 'USER',
      entityId: user.id,
      oldData: {},
      newData: { email: user.email }
    }, client);

    return {
      sent: true,
      resetUrl: process.env.NODE_ENV === 'production' ? undefined : resetUrl
    };
  });
};

const resetPassword = async ({ token, newPassword }) => {
  if (!token || !newPassword) {
    throw new AppError('Token y nueva contraseña son obligatorios', 400, 'RESET_REQUIRED');
  }

  if (newPassword.length < 8) {
    throw new AppError('La contraseña debe tener al menos 8 caracteres', 400, 'PASSWORD_TOO_SHORT');
  }

  return withTransaction(async (client) => {
    const resetTokenHash = hashToken(token);
    const resetToken = await authRepository.findPasswordResetToken(resetTokenHash, client);

    if (!resetToken || resetToken.used_at || new Date(resetToken.expires_at) < new Date()) {
      throw new AppError('El enlace de recuperación es inválido o expiró', 400, 'INVALID_RESET_TOKEN');
    }

    if (!resetToken.is_active || resetToken.is_disabled) {
      throw new AppError('La cuenta está inactiva o deshabilitada', 403, 'USER_INACTIVE');
    }

    const passwordHash = await hashPassword(newPassword);

    await authRepository.updatePassword(resetToken.user_id, passwordHash, client);
    await authRepository.markPasswordResetTokenUsed(resetToken.id, client);
    await authRepository.markAllSessionsCompromised(resetToken.user_id, client);

    await authRepository.createAuditLog({
      actorUserId: resetToken.user_id,
      action: 'RESET_PASSWORD',
      moduleName: 'AUTH',
      entityType: 'USER',
      entityId: resetToken.user_id,
      oldData: {},
      newData: { updated: true }
    }, client);

    return { updated: true };
  });
};

const buildPayload = (user) => ({
  userId: user.id,
  email: user.email,
  role: user.role_name
});

const register = async ({ fullName, email, password, consentAccepted }) => {
  return withTransaction(async (client) => {
    const existingUser = await authRepository.findUserByEmail(email, client);

    if (existingUser) {
      throw new AppError('Ya existe un usuario con ese correo', 409, 'EMAIL_ALREADY_EXISTS');
    }

    if (!consentAccepted) {
      throw new AppError('Debes aceptar el tratamiento de datos', 400, 'CONSENT_REQUIRED');
    }

    const userRole = await authRepository.findRoleByName(ROLES.USER, client);

    if (!userRole) {
      throw new AppError('El rol USER no existe en base de datos', 500, 'ROLE_NOT_FOUND');
    }

    const passwordHash = await hashPassword(password);

    const createdUser = await authRepository.createUser({
      roleId: userRole.id,
      fullName,
      email,
      passwordHash,
      consentAccepted
    }, client);

    await authRepository.createAuditLog({
      actorUserId: createdUser.id,
      action: 'REGISTER',
      moduleName: 'AUTH',
      entityType: 'USER',
      entityId: createdUser.id,
      oldData: {},
      newData: {
        email: createdUser.email,
        fullName: createdUser.full_name
      }
    }, client);

    const fullUser = await authRepository.findUserByEmail(email, client);

    return {
      user: sanitizeUser(fullUser)
    };
  });
};

const login = async ({ email, password, userAgent, ipAddress }) => {
  return withTransaction(async (client) => {
    const user = await authRepository.findUserByEmail(email, client);

    if (!user) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.is_active || user.is_disabled) {
      throw new AppError('La cuenta está inactiva o deshabilitada', 403, 'USER_INACTIVE');
    }

    const passwordMatches = await comparePassword(password, user.password_hash);

    if (!passwordMatches) {
      throw new AppError('Credenciales inválidas', 401, 'INVALID_CREDENTIALS');
    }

    const payload = buildPayload(user);
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashToken(refreshToken),
      userAgent,
      ipAddress,
      expiresAt: getRefreshTokenExpirationDate()
    }, client);

    await authRepository.updateLastLogin(user.id, client);

    await authRepository.createAuditLog({
      actorUserId: user.id,
      action: 'LOGIN',
      moduleName: 'AUTH',
      entityType: 'SESSION',
      newData: {
        email: user.email,
        ipAddress
      }
    }, client);

    return {
      accessToken,
      refreshToken,
      user: sanitizeUser(user)
    };
  });
};

const refresh = async ({ refreshToken }) => {
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch (_error) {
    throw new AppError('Refresh token inválido o expirado', 401, 'INVALID_REFRESH_TOKEN');
  }

  return withTransaction(async (client) => {
    const sessions = await authRepository.getActiveSessionsByUser(decoded.userId, client);
    const refreshTokenHash = hashToken(refreshToken);
    const matchedSession = sessions.find((session) => session.refresh_token_hash === refreshTokenHash);

    if (!matchedSession) {
      await authRepository.markAllSessionsCompromised(decoded.userId, client);

      await authRepository.createAuditLog({
        actorUserId: decoded.userId,
        action: 'REFRESH_TOKEN_REUSE_DETECTED',
        moduleName: 'AUTH',
        entityType: 'SESSION',
        oldData: {},
        newData: { compromised: true }
      }, client);

      throw new AppError('Posible reutilización de refresh token detectada', 401, 'REFRESH_TOKEN_REUSE');
    }

    const user = await authRepository.findUserById(decoded.userId, client);

    if (!user || !user.is_active || user.is_disabled) {
      throw new AppError('Usuario no disponible para renovar sesión', 403, 'USER_INACTIVE');
    }

    const newPayload = {
      userId: user.id,
      email: user.email,
      role: user.role_name
    };

    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await authRepository.revokeSessionById(matchedSession.id, client);

    await authRepository.createSession({
      userId: user.id,
      refreshTokenHash: hashToken(newRefreshToken),
      userAgent: null,
      ipAddress: null,
      expiresAt: getRefreshTokenExpirationDate()
    }, client);

    await authRepository.createAuditLog({
      actorUserId: user.id,
      action: 'REFRESH_SESSION',
      moduleName: 'AUTH',
      entityType: 'SESSION',
      newData: { rotated: true }
    }, client);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  });
};

const changePassword = async ({ userId, currentPassword, newPassword }) => {
  if (!currentPassword || !newPassword) {
    throw new AppError('La contraseña actual y la nueva contraseña son obligatorias', 400, 'PASSWORD_REQUIRED');
  }

  if (newPassword.length < 6) {
    throw new AppError('La nueva contraseña debe tener al menos 6 caracteres', 400, 'PASSWORD_TOO_SHORT');
  }

  return withTransaction(async (client) => {
    const user = await authRepository.findUserById(userId, client);

    if (!user) {
      throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
    }

    const matches = await comparePassword(currentPassword, user.password_hash);
    if (!matches) {
      throw new AppError('La contraseña actual no es correcta', 401, 'INVALID_CURRENT_PASSWORD');
    }

    const passwordHash = await hashPassword(newPassword);
    await authRepository.updatePassword(userId, passwordHash, client);

    await authRepository.createAuditLog({
      actorUserId: userId,
      action: 'CHANGE_PASSWORD',
      moduleName: 'AUTH',
      entityType: 'USER',
      entityId: userId,
      oldData: {},
      newData: { updated: true }
    }, client);

    return { updated: true };
  });
};

const me = async (userId) => {
  const user = await authRepository.findUserById(userId);

  if (!user) {
    throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }

  return {
    user: sanitizeUser(user)
  };
};

module.exports = {
  register,
  login,
  refresh,
  me,
  changePassword,
  requestPasswordReset,
  resetPassword
};