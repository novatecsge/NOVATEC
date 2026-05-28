import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';
import Svg, { G, Path, Polygon, Rect, Text as SvgText } from 'react-native-svg';
import { Card } from '@/components/common/Card';
import { Header } from '@/components/common/Header';
import { ListState } from '@/components/common/ListState';
import { Screen } from '@/components/common/Screen';
import { parkingLayout } from '@/config/parkingLayout';
import { parkingService } from '@/services/parking.service';
import { socketService } from '@/services/socket.service';
import { getErrorMessage, toArray } from '@/services/api';
import { ParkingSpace } from '@/types/api';
import { colors } from '@/theme/colors';

const getCode = (space: ParkingSpace) => String(space.code || space.number || space.id || '');
const normalizeStatus = (status?: string) => String(status || 'AVAILABLE').toUpperCase();
const normalizeType = (space: ParkingSpace) => String(space.type || space.space_type || '').toUpperCase();

const fillOf = (space: ParkingSpace) => {
  const status = normalizeStatus(space.status);
  const type = normalizeType(space);
  if (status === 'OCCUPIED') return colors.danger;
  if (status === 'RESERVED') return colors.warning;
  if (status === 'OUT_OF_SERVICE' || status === 'DISABLED') return colors.muted;
  if (type === 'MOTORCYCLE' || type === 'MOTO') return '#f97316';
  if (type === 'DISABLED' || type === 'DISABILITY') return '#2563eb';
  return colors.success;
};

const mergeApiIntoLayout = (apiSpaces: ParkingSpace[]) => {
  const apiByCode = new Map(apiSpaces.map((space) => [getCode(space), space]));
  return parkingLayout.map((layoutSpace) => {
    const apiSpace = apiByCode.get(getCode(layoutSpace));
    return apiSpace ? { ...layoutSpace, ...apiSpace, code: getCode(layoutSpace) } : layoutSpace;
  });
};

export const ParkingMapScreen = () => {
  const [spaces, setSpaces] = useState<ParkingSpace[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const response = await parkingService.map();
      setSpaces(toArray<ParkingSpace>(response, ['spaces', 'parkingSpaces', 'parking_spaces']));
    } catch(e) {
      Alert.alert('Error', getErrorMessage(e));
      setSpaces([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const onUpdate = (payload: any) => {
      setSpaces((prev) => toArray<ParkingSpace>(prev).map((s) => (
        s.id === payload?.id || getCode(s) === String(payload?.code || payload?.number || '') ? { ...s, ...payload } : s
      )));
    };
    socketService.on('space:update', onUpdate);
    socketService.on('access:entry', load);
    socketService.on('access:exit', load);
    socketService.on('reservation:new', load);
    return () => {
      socketService.off('space:update', onUpdate);
      socketService.off('access:entry', load);
      socketService.off('access:exit', load);
      socketService.off('reservation:new', load);
    };
  }, []);

  const liveSpaces = useMemo(() => mergeApiIntoLayout(toArray<ParkingSpace>(spaces)), [spaces]);
  const available = liveSpaces.filter((s) => normalizeStatus(s.status) === 'AVAILABLE').length;
  const occupied = liveSpaces.filter((s) => normalizeStatus(s.status) === 'OCCUPIED').length;
  const reserved = liveSpaces.filter((s) => normalizeStatus(s.status) === 'RESERVED').length;

  return <Screen>
    <Header title="Mapa" subtitle="Misma distribución SVG del mapa web, con estados del backend en tiempo real." />
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
      <Text style={{ color: colors.success, fontWeight: '800' }}>Disponibles: {available}</Text>
      <Text style={{ color: colors.danger, fontWeight: '800' }}>Ocupados: {occupied}</Text>
      <Text style={{ color: colors.warning, fontWeight: '800' }}>Reservados: {reserved}</Text>
      <Text style={{ color: colors.muted, fontWeight: '800' }}>Total: {liveSpaces.length}</Text>
    </View>
    <ListState loading={loading} empty={!loading && liveSpaces.length === 0} />
    <Card>
      <Svg viewBox="0 0 1600 1100" width="100%" height={520}>
        <Polygon
          points="290,40 760,150 890,280 840,330 970,700 930,720 945,790 520,860 360,650 450,510 430,400 270,320 120,520 120,760 360,760 360,900 70,900 70,580 170,420 90,390 250,90"
          fill="#ffffff"
          stroke="#1f2937"
          strokeWidth="5"
        />
        <Path d="M80 580 H355 V900 M250 90 L290 40 L760 150 L890 280 M430 400 L270 320 M945 790 L520 860" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" opacity="0.75" />
        <Path d="M80 580 H355 V900 M250 90 L290 40 L760 150 L890 280 M430 400 L270 320 M945 790 L520 860" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="18 18" strokeLinecap="round" />
        {liveSpaces.map((space) => {
          const x = Number(space.x ?? 0);
          const y = Number(space.y ?? 0);
          const rotation = Number(space.rotation ?? 0);
          const width = Number(space.width ?? 40);
          const height = Number(space.height ?? 76);
          const code = getCode(space);
          return <G key={code} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            <Rect x={-width / 2} y={-height / 2} width={width} height={height} rx="3" fill={fillOf(space)} stroke="#ffffff" strokeWidth="2" />
            <SvgText x="0" y="0" textAnchor="middle" alignmentBaseline="middle" fill="white" fontSize="12" fontWeight="800">{code}</SvgText>
          </G>;
        })}
      </Svg>
    </Card>
    <Card><Text style={{ color: colors.muted }}>Este mapa usa las coordenadas del componente web y escucha Socket.IO: space:update, access:entry, access:exit y reservation:new.</Text></Card>
  </Screen>;
};
