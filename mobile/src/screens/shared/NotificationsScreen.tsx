import React, { useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { notificationsService } from '@/services/notifications.service';
import { getErrorMessage, toArray } from '@/services/api';
import { NotificationItem } from '@/types/api';
import { colors } from '@/theme/colors';

export const NotificationsScreen = () => {
  const [items, setItems] = useState<NotificationItem[]>([]); const [loading, setLoading] = useState(true);
  const load = async () => { try { setLoading(true); setItems(toArray<NotificationItem>(await notificationsService.list(), ['notifications'])); } catch(e) { Alert.alert('Error', getErrorMessage(e)); } finally { setLoading(false); } };
  useEffect(() => { load(); }, []);
  const read = async (id: string) => { await notificationsService.markAsRead(id); await load(); };
  return <Screen><Header title="Notificaciones" subtitle="Notificaciones y avisos del sistema." /><Button title="Marcar todas como leídas" variant="outline" onPress={async()=>{ await notificationsService.markAllAsRead(); await load(); }} /><ListState loading={loading} empty={!loading && toArray(items).length===0} />{toArray<NotificationItem>(items).map((n) => <Card key={String(n.id || n.title)}><Text style={{ fontWeight:'900', color: colors.text }}>{String(n.title || 'Notificación')}</Text><Text style={{ color: colors.muted, marginVertical: 6 }}>{String(n.message || '')}</Text><Button title="Marcar leída" variant="outline" onPress={() => n.id ? read(n.id) : undefined} /></Card>)}</Screen>;
};
