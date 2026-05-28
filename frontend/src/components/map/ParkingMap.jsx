import React, { useMemo, useState } from 'react';

const initialLayout = [
  {
    "code": "A1",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": -5.36,
    "y": 101.83,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A2",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 44.64,
    "y": 102.07,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A3",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 94.64,
    "y": 102.32,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A4",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 144.64,
    "y": 102.57,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A5",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 194.64,
    "y": 102.82,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A6",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 244.64,
    "y": 103.07,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A7",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 294.64,
    "y": 103.32,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A8",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 344.64,
    "y": 103.57,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A9",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 394.64,
    "y": 103.81,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A10",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 444.64,
    "y": 104.06,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A11",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 494.64,
    "y": 104.31,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "A12",
    "group": "A",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 544.64,
    "y": 104.56,
    "width": 42,
    "height": 78,
    "rotation": 0.28
  },
  {
    "code": "B1",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 62.19,
    "y": 315.43,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B2",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 110.19,
    "y": 315.22,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B3",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 158.19,
    "y": 315.01,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B4",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 206.19,
    "y": 314.81,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B5",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 254.19,
    "y": 314.6,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B6",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 302.19,
    "y": 314.39,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B7",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 350.19,
    "y": 314.18,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B8",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 398.19,
    "y": 313.97,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B9",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 446.18,
    "y": 313.76,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B10",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 494.18,
    "y": 313.56,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B11",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 542.18,
    "y": 313.35,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B12",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 590.18,
    "y": 313.14,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "B13",
    "group": "B",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 638.18,
    "y": 312.93,
    "width": 40,
    "height": 76,
    "rotation": -0.25
  },
  {
    "code": "C1",
    "group": "C",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 709.5,
    "y": 346.64,
    "width": 46,
    "height": 75,
    "rotation": -0.18
  },
  {
    "code": "C2",
    "group": "C",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 763.5,
    "y": 346.47,
    "width": 46,
    "height": 75,
    "rotation": -0.18
  },
  {
    "code": "C3",
    "group": "C",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 817.5,
    "y": 346.31,
    "width": 46,
    "height": 75,
    "rotation": -0.18
  },
  {
    "code": "C4",
    "group": "C",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 871.5,
    "y": 346.14,
    "width": 46,
    "height": 75,
    "rotation": -0.18
  },
  {
    "code": "D1",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 851.78,
    "y": 121.88,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D2",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 893.61,
    "y": 147.5,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D3",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 936.72,
    "y": 174.65,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D4",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 979.19,
    "y": 201.03,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D5",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1021.67,
    "y": 227.42,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D6",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1064.14,
    "y": 253.8,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D7",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1106.61,
    "y": 280.18,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D8",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1149.09,
    "y": 306.56,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D9",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1191.56,
    "y": 332.95,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D10",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1234.03,
    "y": 359.33,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D11",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1276.5,
    "y": 385.71,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D12",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1318.98,
    "y": 412.1,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D13",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1361.45,
    "y": 438.48,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D14",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1403.92,
    "y": 464.86,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "D15",
    "group": "D",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1446.4,
    "y": 491.24,
    "width": 42,
    "height": 72,
    "rotation": 31.85
  },
  {
    "code": "E1",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 956.99,
    "y": 997.36,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E2",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 958.35,
    "y": 947.37,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E3",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 959.71,
    "y": 897.39,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E4",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 961.07,
    "y": 847.41,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E5",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 962.44,
    "y": 797.43,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E6",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 963.8,
    "y": 747.45,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E7",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 965.16,
    "y": 697.47,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E8",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 966.52,
    "y": 647.49,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E9",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 967.88,
    "y": 597.5,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E10",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 969.24,
    "y": 547.52,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E11",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 970.6,
    "y": 497.54,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "E12",
    "group": "E",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 971.96,
    "y": 447.56,
    "width": 42,
    "height": 74,
    "rotation": -88.44
  },
  {
    "code": "F1",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1123.44,
    "y": 1038.44,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F2",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1155.28,
    "y": 999.88,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F3",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1187.11,
    "y": 961.32,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F4",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1218.94,
    "y": 922.76,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F5",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1250.77,
    "y": 884.21,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F6",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1282.6,
    "y": 845.65,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F7",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1314.43,
    "y": 807.09,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F8",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1346.27,
    "y": 768.53,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F9",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1378.1,
    "y": 729.97,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F10",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1409.93,
    "y": 691.41,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F11",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1441.76,
    "y": 652.86,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "F12",
    "group": "F",
    "type": "CAR",
    "status": "AVAILABLE",
    "x": 1473.59,
    "y": 614.3,
    "width": 42,
    "height": 74,
    "rotation": -50.46
  },
  {
    "code": "M1",
    "group": "M",
    "type": "MOTORCYCLE",
    "status": "AVAILABLE",
    "x": 1478.02,
    "y": 539.43,
    "width": 34,
    "height": 48,
    "rotation": -57.36
  },
  {
    "code": "M2",
    "group": "M",
    "type": "MOTORCYCLE",
    "status": "AVAILABLE",
    "x": 1500.67,
    "y": 504.06,
    "width": 34,
    "height": 48,
    "rotation": -57.36
  },
  {
    "code": "M3",
    "group": "M",
    "type": "MOTORCYCLE",
    "status": "AVAILABLE",
    "x": 1524.93,
    "y": 569.95,
    "width": 34,
    "height": 48,
    "rotation": -57.36
  },
  {
    "code": "M4",
    "group": "M",
    "type": "MOTORCYCLE",
    "status": "AVAILABLE",
    "x": 1547.58,
    "y": 534.58,
    "width": 34,
    "height": 48,
    "rotation": -57.36
  },
  {
    "code": "DIS1",
    "group": "DIS",
    "type": "DISABLED",
    "status": "AVAILABLE",
    "x": 5,
    "y": 317,
    "width": 58,
    "height": 58,
    "rotation": 0
  }
];

const statusColors = {
  AVAILABLE: '#22c55e',
  OCCUPIED: '#ef4444',
  RESERVED: '#facc15',
  OUT_OF_SERVICE: '#64748b'
};

const statusLabels = {
  AVAILABLE: 'Disponible',
  OCCUPIED: 'Ocupado',
  RESERVED: 'Reservado',
  OUT_OF_SERVICE: 'Fuera de servicio'
};

const typeLabels = {
  CAR: 'Auto',
  AUTO: 'Auto',
  MOTORCYCLE: 'Moto',
  MOTO: 'Moto',
  DISABLED: 'Discapacidad',
  DISABILITY: 'Discapacidad'
};

const normalizeType = (type) => {
  if (type === 'MOTO') return 'MOTORCYCLE';
  if (type === 'DISABILITY') return 'DISABLED';
  if (type === 'AUTO') return 'CAR';
  return type || 'CAR';
};

const normalizeStatus = (status, assignmentStatus) => {
  if (assignmentStatus === 'ASSIGNED') return 'OCCUPIED';
  if (status === 'BLOCKED' || status === 'MAINTENANCE') return 'OUT_OF_SERVICE';
  return status || 'AVAILABLE';
};

const carLayout = initialLayout.filter((space) => space.type === 'CAR');
const motorcycleLayout = initialLayout.filter((space) => space.type === 'MOTORCYCLE');
const disabledLayout = initialLayout.filter((space) => space.type === 'DISABLED');

const getDisplayCode = (layoutSpace, apiSpace) => layoutSpace?.code || apiSpace?.code;

const mergeApiIntoLayout = (apiSpaces = []) => {
  const normalizedApi = apiSpaces.map((space) => ({
    ...space,
    normalizedType: normalizeType(space.spaceType || space.type),
    normalizedStatus: normalizeStatus(space.status, space.assignmentStatus)
  }));

  const usedApiIds = new Set();
  const apiByCode = new Map(normalizedApi.map((space) => [space.code, space]));

  const consume = (layoutSpace, candidates, index) => {
    const direct = apiByCode.get(layoutSpace.code);
    let apiSpace = direct && !usedApiIds.has(direct.id || direct.code) ? direct : candidates[index];

    if (apiSpace) usedApiIds.add(apiSpace.id || apiSpace.code);

    return {
      ...layoutSpace,
      actualCode: apiSpace?.code || layoutSpace.code,
      id: apiSpace?.id || layoutSpace.code,
      number: apiSpace?.number,
      status: apiSpace?.normalizedStatus || normalizeStatus(layoutSpace.status),
      type: normalizeType(layoutSpace.type),
      assignmentStatus: apiSpace?.assignmentStatus,
      plate: apiSpace?.plate,
      brand: apiSpace?.brand,
      model: apiSpace?.model,
      reservationId: apiSpace?.reservationId,
      vehicleId: apiSpace?.vehicleId,
      userId: apiSpace?.userId,
      displayCode: getDisplayCode(layoutSpace, apiSpace)
    };
  };

  const autoApi = normalizedApi
    .filter((space) => space.normalizedType === 'CAR')
    .sort((a, b) => (a.number || 0) - (b.number || 0));
  const motoApi = normalizedApi
    .filter((space) => space.normalizedType === 'MOTORCYCLE')
    .sort((a, b) => (a.number || 0) - (b.number || 0));
  const disabledApi = normalizedApi
    .filter((space) => space.normalizedType === 'DISABLED')
    .sort((a, b) => (a.number || 0) - (b.number || 0));

  const merged = [];
  carLayout.forEach((layoutSpace, index) => merged.push(consume(layoutSpace, autoApi, index)));
  motorcycleLayout.forEach((layoutSpace, index) => merged.push(consume(layoutSpace, motoApi, index)));
  disabledLayout.forEach((layoutSpace, index) => merged.push(consume(layoutSpace, disabledApi, index)));

  return initialLayout.map((layoutSpace) => merged.find((space) => space.code === layoutSpace.code) || layoutSpace);
};

const getFill = (space) => {
  if (space.status === 'OCCUPIED') return statusColors.OCCUPIED;
  if (space.status === 'RESERVED') return statusColors.RESERVED;
  if (space.status === 'OUT_OF_SERVICE') return statusColors.OUT_OF_SERVICE;
  if (space.type === 'MOTORCYCLE') return '#bb00ff';
  if (space.type === 'DISABLED') return '#2563eb';
  return statusColors.AVAILABLE;
};

export default function ParkingMap({ spaces = [], showVehicleDetails = true, interactivePreview = false }) {
  const mergedSpaces = useMemo(() => mergeApiIntoLayout(spaces), [spaces]);
  const [previewSpaces, setPreviewSpaces] = useState(mergedSpaces);
  const [hovered, setHovered] = useState(null);
  const [zoom, setZoom] = useState(1);
  const liveSpaces = interactivePreview ? previewSpaces : mergedSpaces;

  React.useEffect(() => {
    if (!interactivePreview) return;
    setPreviewSpaces(mergedSpaces);
  }, [mergedSpaces, interactivePreview]);

  const counts = useMemo(() => liveSpaces.reduce((acc, space) => {
    acc[space.status] = (acc[space.status] || 0) + 1;
    return acc;
  }, {}), [liveSpaces]);

  const updateStatus = (code, status) => {
    setPreviewSpaces((prev) => prev.map((space) => (
      space.code === code ? { ...space, status } : space
    )));
  };

  return (
    <div className="parking-shell">
      <div className="parking-toolbar">
        <div>
          <h3>Mapa del estacionamiento</h3>
          <p>Distribución operativa con cajones fijos y estados en tiempo real.</p>
        </div>
        <div className="parking-stats">
          <span className="badge green">Disponibles: {counts.AVAILABLE || 0}</span>
          <span className="badge red">Ocupados: {counts.OCCUPIED || 0}</span>
          <span className="badge yellow">Reservados: {counts.RESERVED || 0}</span>
          <span className="badge gray">Fuera: {counts.OUT_OF_SERVICE || 0}</span>
        </div>
      </div>

      <div className="map-controls" aria-label="Controles del mapa">
        <button type="button" onClick={() => setZoom((value) => Math.max(0.55, Number((value - 0.1).toFixed(2))))}>Alejar</button>
        <button type="button" onClick={() => setZoom(1)}>Restablecer</button>
        <button type="button" onClick={() => setZoom((value) => Math.min(1.6, Number((value + 0.1).toFixed(2))))}>Acercar</button>
        <span className="badge gray">Zoom: {Math.round(zoom * 100)}%</span>
      </div>

      <div className="parking-map-card">
        <div className="map-scroll-area" aria-label="Área desplazable del mapa">
          <div className="map-canvas" style={{ transform: `scale(${zoom})` }}>
        <svg viewBox="0 0 1550 1100" className="parking-svg" role="img" aria-label="Mapa de cajones de estacionamiento">
          {liveSpaces.map((space) => (
            <g
              key={space.code}
              transform={`translate(${space.x}, ${space.y}) rotate(${space.rotation})`}
              onMouseEnter={() => setHovered(space)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => interactivePreview && updateStatus(space.code, space.status === 'AVAILABLE' ? 'OCCUPIED' : 'AVAILABLE')}
              className="parking-space-group"
              style={{ cursor: interactivePreview ? 'pointer' : 'default' }}
            >
              <rect
                x={-space.width / 2}
                y={-space.height / 2}
                width={space.width}
                height={space.height}
                rx="8"
                fill={getFill(space)}
                stroke="#ffffff"
                strokeWidth="2"
                className={space.status === 'OCCUPIED' ? 'parking-occupied' : ''}
              />
              <text
                x="0"
                y="0"
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="800"
                style={{ pointerEvents: 'none' }}
              >
                {space.code}
              </text>
            </g>
          ))}
        </svg>

        </div>
        </div>

        {hovered ? (
          <div className="parking-tooltip" aria-live="polite">
            <strong>{hovered.code}</strong>
            <span>{typeLabels[hovered.type] || hovered.type} · {statusLabels[hovered.status] || hovered.status}</span>
            {showVehicleDetails && hovered.status === 'OCCUPIED' ? (
              <span>{hovered.brand || 'N/D'} {hovered.model || ''} · {hovered.plate || 'Sin placa'}</span>
            ) : null}
            {hovered.actualCode && hovered.actualCode !== hovered.code ? (
              <span>Código interno: {hovered.actualCode}</span>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="parking-legend">
        <LegendDot color="#22c55e" label="Disponible" />
        <LegendDot color="#ef4444" label="Ocupado" />
        <LegendDot color="#facc15" label="Reservado" />
        <LegendDot color="#64748b" label="Fuera de servicio" />
        <LegendDot color="#bb00ff" label="Moto" />
        <LegendDot color="#2563eb" label="Discapacidad" />
      </div>
    </div>
  );
}

function LegendDot({ color, label }) {
  return <span className="legend-item"><i style={{ background: color }} />{label}</span>;
}
