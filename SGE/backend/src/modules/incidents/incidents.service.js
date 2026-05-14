const AppError = require('../../shared/errors/AppError');
const { getIo } = require('../../config/socket');
const incidentsRepository = require('./incidents.repository');
const notificationsRepository = require('../notifications/notifications.repository');

const mapIncident = (incident) => ({
  id: incident.id,
  userId: incident.user_id,
  incidentType: incident.incident_type,
  description: incident.description,
  status: incident.status,
  resolvedBy: incident.resolved_by,
  resolvedAt: incident.resolved_at,
  createdAt: incident.created_at,
  updatedAt: incident.updated_at,
  fullName: incident.full_name,
  email: incident.email
});

const createIncident = async (userId, payload) => {
  const incident = await incidentsRepository.createIncident({
    userId,
    incidentType: payload.incidentType,
    description: payload.description
  });

  await notificationsRepository.createNotification({
    userId,
    type: 'INCIDENT',
    title: 'Incidencia registrada',
    message: 'Tu incidencia fue registrada correctamente',
    priority: 2,
    relatedEntityType: 'INCIDENT',
    relatedEntityId: incident.id
  });

  const io = getIo();
  io.to('admin').emit('incident:new', {
    incidentId: incident.id,
    userId,
    status: incident.status
  });

  return {
    incident: mapIncident(incident)
  };
};

const listIncidents = async () => {
  const incidents = await incidentsRepository.listIncidents();
  return {
    incidents: incidents.map(mapIncident)
  };
};

const updateIncidentStatus = async (actorUserId, incidentId, status) => {
  const before = await incidentsRepository.findIncidentById(incidentId);

  if (!before) {
    throw new AppError('Incidencia no encontrada', 404, 'INCIDENT_NOT_FOUND');
  }

  const updated = await incidentsRepository.updateIncidentStatus({
    incidentId,
    status,
    resolvedBy: actorUserId
  });

  await notificationsRepository.createNotification({
    userId: updated.user_id,
    type: 'INCIDENT',
    title: 'Actualización de incidencia',
    message: `Tu incidencia cambió a estado ${status}`,
    priority: 2,
    relatedEntityType: 'INCIDENT',
    relatedEntityId: updated.id
  });

  return {
    incident: mapIncident(updated)
  };
};

module.exports = {
  createIncident,
  listIncidents,
  updateIncidentStatus
};