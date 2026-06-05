import React, { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { Screen } from '@/components/common/Screen';
import { incidentsService } from '@/services/incidents.service';
import { getErrorMessage } from '@/services/api';
import { colors } from '@/theme/colors';

const INCIDENT_TYPES = [
  { value: 'ACCIDENTE', label: 'Accidente' },
  { value: 'ROBO', label: 'Robo' },
  { value: 'DANO', label: 'Daño' },
  { value: 'OBSTRUCCION', label: 'Obstrucción' },
  { value: 'SEGURIDAD', label: 'Seguridad' },
  { value: 'OTRO', label: 'Otro' }
];

export const IncidentsScreen = () => {
  const [incidentType, setIncidentType] = useState('OTRO');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!description.trim()) {
      Alert.alert('Descripción requerida', 'Describe brevemente la incidencia.');
      return;
    }

    try {
      setSaving(true);

      await incidentsService.create({
        incidentType,
        description: description.trim()
      });

      setDescription('');
      setIncidentType('OTRO');

      Alert.alert('Incidencia enviada', 'El reporte fue enviado al panel administrativo.');
    } catch (e) {
      Alert.alert('No se pudo enviar', getErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen>
      <Header title="Reportar incidencia" subtitle="" />

      <Card>
        <Text style={{ color: colors.text, fontWeight: '900', fontSize: 16, marginBottom: 10 }}>
          Tipo de incidencia
        </Text>

        <View style={{ gap: 8, marginBottom: 12 }}>
          {INCIDENT_TYPES.map((type) => {
            const selected = incidentType === type.value;

            return (
              <Pressable
                key={type.value}
                onPress={() => setIncidentType(type.value)}
                style={{
                  padding: 12,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: selected ? colors.accent : colors.border,
                  backgroundColor: selected ? colors.accentSoft : colors.white
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '900' }}>
                  {type.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Input
          label="Descripción"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
        />

        <Button title="Enviar reporte" loading={saving} onPress={submit} />
      </Card>
    </Screen>
  );
};
