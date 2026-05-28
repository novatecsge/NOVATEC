import React, { useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { Input } from '@/components/common/Input';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { vehiclesService } from '@/services/vehicles.service';
import { getErrorMessage, toArray } from '@/services/api';
import { Vehicle } from '@/types/api';
import { colors } from '@/theme/colors';

export const VehiclesScreen = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [color, setColor] = useState('');
  const [year, setYear] = useState(String(new Date().getFullYear()));
  const [saving, setSaving] = useState(false);
  const load = async () => { try { setError(null); setLoading(true); setVehicles(toArray<Vehicle>(await vehiclesService.list(), ['vehicles'])); } catch(e) { setError(getErrorMessage(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const create = async () => {
    try { setSaving(true); await vehiclesService.create({ plate, brand, model, color, year: Number(year), vehicleType: 'AUTO' }); setPlate(''); setBrand(''); setModel(''); setColor(''); setYear(String(new Date().getFullYear())); await load(); }
    catch(e) { Alert.alert('No se pudo registrar', getErrorMessage(e)); } finally { setSaving(false); }
  };
  const remove = async (id: string) => { try { await vehiclesService.remove(id); await load(); } catch(e) { Alert.alert('No se pudo eliminar', getErrorMessage(e)); } };
  return <Screen>
    <Header title="Mis vehículos" subtitle="Usa las mismas APIs del sistema web." />
    <Card><Input label="Placa" value={plate} onChangeText={setPlate} autoCapitalize="characters" /><Input label="Marca" value={brand} onChangeText={setBrand} /><Input label="Modelo" value={model} onChangeText={setModel} /><Input label="Color" value={color} onChangeText={setColor} /><Input label="Año" value={year} onChangeText={setYear} keyboardType="numeric" /><Button title="Registrar vehículo" loading={saving} onPress={create} /></Card>
    <ListState loading={loading} error={error} empty={!loading && toArray(vehicles).length === 0} />
    {toArray<Vehicle>(vehicles).map((v) => <Card key={String(v.id || v.plate || v.licensePlate)}><View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}><View style={{ flex: 1 }}><Text style={{ fontSize: 17, fontWeight: '900', color: colors.text }}>{String(v.plate || v.licensePlate || 'Sin placa')}</Text><Text style={{ color: colors.muted }}>{[v.brand, v.model, v.color].filter(Boolean).join(' · ') || 'Sin detalles'}</Text></View><Button title="Eliminar" variant="danger" onPress={() => v.id ? remove(v.id) : undefined} /></View></Card>)}
  </Screen>;
};
