import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { usersService } from '@/services/users.service';
import { getErrorMessage, toArray } from '@/services/api';
import { User } from '@/types/api';
import { colors } from '@/theme/colors';

export const AdminUsersScreen = () => {
  const [items, setItems] = useState<User[]>([]); const [loading, setLoading] = useState(true);
  const load = async () => { try { setLoading(true); setItems(toArray<User>(await usersService.list(), ['users'])); } catch(e) { Alert.alert('Error', getErrorMessage(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  return <Screen><Header title="Usuarios" subtitle="Consulta administrativa de todos los usuarios." /><Button title="Actualizar" loading={loading} onPress={load}/><ListState loading={loading} empty={!loading && toArray(items).length===0}/>{toArray<User>(items).map((u) => <Card key={String(u.id || u.email)}><Text style={{ fontWeight:'900', color: colors.text }}>{String(u.fullName || u.full_name || u.email)}</Text><Text style={{ color: colors.muted }}>{String(u.email)} · {String(u.role || u.role_name)}</Text></Card>)}</Screen>;
};
