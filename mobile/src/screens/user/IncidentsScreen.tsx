import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Screen } from '@/components/common/Screen';
import { incidentsService } from '@/services/incidents.service';
import { getErrorMessage } from '@/services/api';

export const IncidentsScreen = () => {
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const submit = async () => {
    try { setSaving(true); await incidentsService.create({ incidentType: 'REPORTE_MOVIL', description }); setDescription(''); Alert.alert('Incidente enviado', 'El reporte fue enviado al panel administrativo.'); }
    catch(e) { Alert.alert('No se pudo enviar', getErrorMessage(e)); }
    finally { setSaving(false); }
  };
  return <Screen><Header title="Reportar incidente" subtitle="El reporte se sincroniza con el panel web del administrador." /><Card><Input label="Descripción" value={description} onChangeText={setDescription} multiline numberOfLines={5} /><Button title="Enviar reporte" loading={saving} onPress={submit} /></Card></Screen>;
};
