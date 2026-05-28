const AppError = require('../../shared/errors/AppError');
const usersRepository = require('./users.repository');

const mapUser = (user) => ({
  id: user.id,
  fullName: user.full_name,
  email: user.email,
  role: user.role_name,
  isActive: user.is_active,
  isDisabled: user.is_disabled,
  hasDisability: user.has_disability,
  createdAt: user.created_at,
  updatedAt: user.updated_at
});

const filterProfilePayload = (payload) => {
  const allowedFields = ['fullName', 'email', 'hasDisability'];
  return Object.fromEntries(
    Object.entries(payload).filter(([key]) => allowedFields.includes(key))
  );
};

const getMyProfile = async (userId) => {
  const user = await usersRepository.getProfileById(userId);

  if (!user) {
    throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }

  return { user: mapUser(user) };
};

const getAllUsers = async () => {
  const users = await usersRepository.listUsers();
  return { users: users.map(mapUser) };
};

const updateMyProfile = async (userId, payload) => {
  const safePayload = filterProfilePayload(payload);
  const before = await usersRepository.getProfileById(userId);

  if (!before) {
    throw new AppError('Usuario no encontrado', 404, 'USER_NOT_FOUND');
  }

  if (safePayload.email && safePayload.email !== before.email) {
    const existing = await usersRepository.findUserByEmail(safePayload.email);

    if (existing && existing.id !== userId) {
      throw new AppError('Ya existe un usuario con ese correo', 409, 'EMAIL_ALREADY_EXISTS');
    }
  }

  const updated = await usersRepository.updateProfile({
    userId,
    fullName: safePayload.fullName ?? null,
    email: safePayload.email ?? null,
    hasDisability: safePayload.hasDisability ?? null
  });

  await usersRepository.createAuditLog({
    actorUserId: userId,
    action: 'UPDATE_PROFILE',
    moduleName: 'USERS',
    entityType: 'USER',
    entityId: userId,
    oldData: before,
    newData: updated
  });

  const after = await usersRepository.getProfileById(userId);

  return { user: mapUser(after) };
};

const updateUserStatus = async (actorUserId, targetUserId, payload) => {
  const before = await usersRepository.getProfileById(targetUserId);

  if (!before) {
    throw new AppError('Usuario objetivo no encontrado', 404, 'USER_NOT_FOUND');
  }

  const updated = await usersRepository.updateUserStatus({
    userId: targetUserId,
    isActive: payload.isActive,
    isDisabled: payload.isDisabled
  });

  await usersRepository.createAuditLog({
    actorUserId,
    action: 'UPDATE_USER_STATUS',
    moduleName: 'USERS',
    entityType: 'USER',
    entityId: targetUserId,
    oldData: before,
    newData: updated
  });

  const after = await usersRepository.getProfileById(targetUserId);

  return { user: mapUser(after) };
};

module.exports = {
  getMyProfile,
  getAllUsers,
  updateMyProfile,
  updateUserStatus
};