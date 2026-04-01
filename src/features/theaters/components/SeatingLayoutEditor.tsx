import { useState, useRef, useCallback, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  MousePointer2,
  Grid3x3,
  Undo2,
  Rows3,
  Circle,
  Triangle,
  Type,
} from 'lucide-react';
import type { SeatEntity } from '../domain/entities/theater.entity';
import { TheatersAdminRemoteDatasource } from '../data/datasources/theaters-admin.remote-datasource';

const datasource = new TheatersAdminRemoteDatasource();

/* ---------- types ---------- */
type Tool = 'select' | 'add' | 'add-row' | 'add-arc' | 'add-triangle' | 'delete';

interface EditorSeat extends SeatEntity {
  _tempId: string;
  selected: boolean;
  disabled: boolean;
}

const SEAT_RADIUS = 14;
const GRID_SIZE = 32; // each cell fits one seat (diameter 28 + 4 gap)

function snapToGrid(v: number): number {
  return Math.round(v / GRID_SIZE) * GRID_SIZE;
}

const SEAT_TYPES = [
  { value: 'standard', label: 'Estandar', color: '#D4663F' },
  { value: 'vip', label: 'VIP', color: '#D4A843' },
  { value: 'premium', label: 'Premium', color: '#2A9D8F' },
  { value: 'wheelchair', label: 'Accesible', color: '#5A9E6F' },
];

interface Props {
  theaterId: string;
  layoutId: string;
  layoutName: string;
  canvasWidth: number;
  canvasHeight: number;
  initialSeats: SeatEntity[];
  onClose: () => void;
}

let seatCounter = 0;
function nextTempId() {
  return `temp-${++seatCounter}-${Date.now()}`;
}

export function SeatingLayoutEditor({
  theaterId,
  layoutId,
  layoutName,
  canvasWidth,
  canvasHeight,
  initialSeats,
  onClose,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [seats, setSeats] = useState<EditorSeat[]>(() =>
    initialSeats.map((s) => ({
      ...s,
      _tempId: s.id || nextTempId(),
      posX: snapToGrid(s.posX),
      posY: snapToGrid(s.posY),
      selected: false,
      disabled: s.isActive === false,
    })),
  );
  const [tool, setTool] = useState<Tool>('select');
  const [saving, setSaving] = useState(false);
  const [undoStack, setUndoStack] = useState<EditorSeat[][]>([]);
  const [showGrid, setShowGrid] = useState(true);

  // Properties panel
  const [seatType, setSeatType] = useState('standard');
  const [seatColor, setSeatColor] = useState('#D4663F');
  const [seatSection, setSeatSection] = useState('');
  const [seatRow, setSeatRow] = useState('');
  const [seatAngle, setSeatAngle] = useState(0);
  const [seatPrice, setSeatPrice] = useState<number | ''>('');

  // Rename
  const [renaming, setRenaming] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');

  // Shape builders
  const [rowStart, setRowStart] = useState<{ x: number; y: number } | null>(null);
  const [rowCount, setRowCount] = useState(10);
  const [rowLetter, setRowLetter] = useState('A');
  // Arc specific
  const [arcAngleSpan, setArcAngleSpan] = useState(120); // degrees of the arc

  // Zoom & pan
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Dragging (supports multi-drag)
  const [dragging, setDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  const selectedSeats = seats.filter((s) => s.selected);

  // ── Helpers ──
  function isLabelDuplicate(label: string, excludeTempId?: string): boolean {
    return seats.some((s) => s.label === label && s._tempId !== excludeTempId);
  }

  /** Check if a grid cell is already occupied by another seat */
  function isCellOccupied(posX: number, posY: number, excludeTempIds?: Set<string>): boolean {
    return seats.some((s) => {
      if (excludeTempIds?.has(s._tempId)) return false;
      return s.posX === posX && s.posY === posY;
    });
  }

  function pushUndo() {
    setUndoStack((prev) => [...prev.slice(-30), seats.map((s) => ({ ...s }))]);
  }

  function handleUndo() {
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    setUndoStack((s) => s.slice(0, -1));
    setSeats(prev);
  }

  // ── Canvas Rendering ──
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.scale(dpr, dpr);

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--surface-container').trim() || '#2A2320';
    ctx.fillRect(0, 0, w, h);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Grid — each cell is one seat slot
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 0.5;
      for (let x = 0; x <= canvasWidth; x += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += GRID_SIZE) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
      }
      // Draw cell centers as subtle dots
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let x = GRID_SIZE / 2; x <= canvasWidth; x += GRID_SIZE) {
        for (let y = GRID_SIZE / 2; y <= canvasHeight; y += GRID_SIZE) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Canvas boundary
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvasWidth, canvasHeight);

    // Stage
    ctx.fillStyle = 'rgba(212, 102, 63, 0.15)';
    ctx.fillRect(canvasWidth * 0.15, 10, canvasWidth * 0.7, 40);
    ctx.fillStyle = 'rgba(212, 102, 63, 0.6)';
    ctx.font = '14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('ESCENARIO', canvasWidth / 2, 36);

    // Section labels (group seats by section)
    const sectionBounds: Record<string, { minX: number; minY: number; maxX: number; maxY: number }> = {};
    for (const seat of seats) {
      const sec = seat.sectionName || '';
      if (!sec) continue;
      if (!sectionBounds[sec]) {
        sectionBounds[sec] = { minX: seat.posX, minY: seat.posY, maxX: seat.posX, maxY: seat.posY };
      } else {
        sectionBounds[sec].minX = Math.min(sectionBounds[sec].minX, seat.posX);
        sectionBounds[sec].minY = Math.min(sectionBounds[sec].minY, seat.posY);
        sectionBounds[sec].maxX = Math.max(sectionBounds[sec].maxX, seat.posX);
        sectionBounds[sec].maxY = Math.max(sectionBounds[sec].maxY, seat.posY);
      }
    }
    for (const [name, b] of Object.entries(sectionBounds)) {
      const pad = 25;
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.strokeRect(b.minX - pad, b.minY - pad, b.maxX - b.minX + pad * 2, b.maxY - b.minY + pad * 2);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText(name, b.minX - pad + 4, b.minY - pad - 4);
    }

    // Seats
    for (const seat of seats) {
      ctx.save();
      ctx.translate(seat.posX, seat.posY);
      ctx.rotate((seat.angle * Math.PI) / 180);

      ctx.beginPath();
      ctx.roundRect(-SEAT_RADIUS, -SEAT_RADIUS, SEAT_RADIUS * 2, SEAT_RADIUS * 2, 4);

      if (seat.selected) {
        ctx.fillStyle = seat.disabled ? '#4a4540' : '#2A9D8F';
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
      } else if (seat.disabled) {
        ctx.fillStyle = '#3a3530';
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 1;
      } else {
        ctx.fillStyle = seat.color || '#D4663F';
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
      }

      ctx.fill();
      ctx.stroke();

      // X mark for disabled seats
      if (seat.disabled) {
        ctx.strokeStyle = 'rgba(230, 57, 70, 0.7)';
        ctx.lineWidth = 2;
        const s = SEAT_RADIUS * 0.5;
        ctx.beginPath(); ctx.moveTo(-s, -s); ctx.lineTo(s, s); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(s, -s); ctx.lineTo(-s, s); ctx.stroke();
      }

      ctx.rotate((-seat.angle * Math.PI) / 180);
      ctx.fillStyle = seat.disabled ? 'rgba(255,255,255,0.3)' : '#fff';
      ctx.font = '9px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(seat.label, 0, seat.price ? -3 : 0);

      // Show price below label if set
      if (seat.price && !seat.disabled) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '7px system-ui';
        ctx.fillText(`$${seat.price}`, 0, 6);
      }

      ctx.restore();
    }

    // Shape builder preview
    if ((tool === 'add-row' || tool === 'add-arc' || tool === 'add-triangle') && rowStart) {
      ctx.fillStyle = 'rgba(42, 157, 143, 0.4)';
      ctx.beginPath();
      ctx.arc(rowStart.x, rowStart.y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(42, 157, 143, 0.6)';
      ctx.font = '10px system-ui';
      ctx.textAlign = 'left';
      ctx.fillText('Clic en el punto final', rowStart.x + 10, rowStart.y + 4);
    }

    ctx.restore();
  }, [seats, zoom, pan, showGrid, canvasWidth, canvasHeight, tool, rowStart]);

  useEffect(() => { draw(); }, [draw]);

  useEffect(() => {
    const observer = new ResizeObserver(() => draw());
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [draw]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (renaming) return; // don't capture while renaming
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedSeats.length > 0) { pushUndo(); setSeats((prev) => prev.filter((s) => !s.selected)); }
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey)) { handleUndo(); }
      if (e.key === 'a' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); setSeats((prev) => prev.map((s) => ({ ...s, selected: true }))); }
      if (e.key === 'Escape') { setSeats((prev) => prev.map((s) => ({ ...s, selected: false }))); setRowStart(null); }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selectedSeats, renaming, undoStack]);

  // ── Canvas Mouse ──
  function canvasToWorld(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: (clientX - rect.left - pan.x) / zoom, y: (clientY - rect.top - pan.y) / zoom };
  }

  function findSeatAt(wx: number, wy: number): EditorSeat | null {
    for (let i = seats.length - 1; i >= 0; i--) {
      const s = seats[i];
      const dx = wx - s.posX, dy = wy - s.posY;
      if (Math.sqrt(dx * dx + dy * dy) <= SEAT_RADIUS + 2) return s;
    }
    return null;
  }

  function generateShapeSeats(start: { x: number; y: number }, end: { x: number; y: number }, shape: 'row' | 'arc' | 'triangle'): EditorSeat[] {
    const newSeats: EditorSeat[] = [];

    if (shape === 'row') {
      const dx = end.x - start.x, dy = end.y - start.y;
      for (let i = 0; i < rowCount; i++) {
        const t = rowCount > 1 ? i / (rowCount - 1) : 0;
        newSeats.push({
          _tempId: nextTempId(), label: `${rowLetter}${i + 1}`,
          posX: Math.round(start.x + dx * t), posY: Math.round(start.y + dy * t),
          angle: seatAngle, color: seatColor, seatType,
          sectionName: seatSection || undefined, rowName: rowLetter || undefined,
          seatNumber: i + 1, selected: false, disabled: false,
        });
      }
    } else if (shape === 'arc') {
      // Arc: center is midpoint between start and end, radius is distance / 2
      const cx = (start.x + end.x) / 2;
      const cy = end.y; // center below the arc
      const radius = Math.sqrt((end.x - start.x) ** 2 + (end.y - start.y) ** 2) / 2;
      const spanRad = (arcAngleSpan * Math.PI) / 180;
      const startAngle = -Math.PI / 2 - spanRad / 2;

      for (let i = 0; i < rowCount; i++) {
        const t = rowCount > 1 ? i / (rowCount - 1) : 0;
        const angle = startAngle + spanRad * t;
        const seatAngleVal = (angle * 180) / Math.PI + 90; // face inward
        newSeats.push({
          _tempId: nextTempId(), label: `${rowLetter}${i + 1}`,
          posX: Math.round(cx + radius * Math.cos(angle)),
          posY: Math.round(cy + radius * Math.sin(angle)),
          angle: Math.round(seatAngleVal), color: seatColor, seatType,
          sectionName: seatSection || undefined, rowName: rowLetter || undefined,
          seatNumber: i + 1, selected: false, disabled: false,
        });
      }
    } else if (shape === 'triangle') {
      // Triangle: 3 sides from start to end (top), then two angled sides down
      const width = Math.abs(end.x - start.x);
      const height = Math.abs(end.y - start.y);
      const midX = (start.x + end.x) / 2;
      const topY = Math.min(start.y, end.y);
      const bottomY = Math.max(start.y, end.y);
      const seatsPerSide = Math.ceil(rowCount / 3);

      // Top side (left to right)
      for (let i = 0; i < seatsPerSide; i++) {
        const t = seatsPerSide > 1 ? i / (seatsPerSide - 1) : 0;
        newSeats.push({
          _tempId: nextTempId(), label: `${rowLetter}${newSeats.length + 1}`,
          posX: Math.round(start.x + width * t), posY: Math.round(topY),
          angle: 0, color: seatColor, seatType,
          sectionName: seatSection || undefined, rowName: rowLetter || undefined,
          seatNumber: newSeats.length + 1, selected: false, disabled: false,
        });
      }
      // Right side (top-right to bottom-center)
      for (let i = 1; i < seatsPerSide; i++) {
        const t = i / (seatsPerSide - 1);
        newSeats.push({
          _tempId: nextTempId(), label: `${rowLetter}${newSeats.length + 1}`,
          posX: Math.round(end.x - (end.x - midX) * t), posY: Math.round(topY + height * t),
          angle: 0, color: seatColor, seatType,
          sectionName: seatSection || undefined, rowName: rowLetter || undefined,
          seatNumber: newSeats.length + 1, selected: false, disabled: false,
        });
      }
      // Left side (bottom-center to top-left)
      for (let i = 1; i < seatsPerSide - 1; i++) {
        const t = i / (seatsPerSide - 1);
        newSeats.push({
          _tempId: nextTempId(), label: `${rowLetter}${newSeats.length + 1}`,
          posX: Math.round(midX + (start.x - midX) * t), posY: Math.round(bottomY - height * t),
          angle: 0, color: seatColor, seatType,
          sectionName: seatSection || undefined, rowName: rowLetter || undefined,
          seatNumber: newSeats.length + 1, selected: false, disabled: false,
        });
      }
    }

    // Apply price to all generated seats
    const priceVal = seatPrice === '' ? undefined : seatPrice;
    if (priceVal !== undefined) {
      for (const s of newSeats) { s.price = priceVal; }
    }

    return newSeats;
  }

  function handleMouseDown(e: React.MouseEvent) {
    const { x, y } = canvasToWorld(e.clientX, e.clientY);

    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      return;
    }

    if (tool === 'select') {
      const seat = findSeatAt(x, y);
      if (seat) {
        if (e.shiftKey) {
          setSeats((prev) => prev.map((s) => s._tempId === seat._tempId ? { ...s, selected: !s.selected } : s));
        } else {
          if (!seat.selected) {
            setSeats((prev) => prev.map((s) => ({ ...s, selected: s._tempId === seat._tempId })));
          }
          // Start drag for all selected
          setDragging(true);
          setDragStartPos({ x, y });
          setSeatType(seat.seatType);
          setSeatColor(seat.color);
          setSeatSection(seat.sectionName || '');
          setSeatRow(seat.rowName || '');
          setSeatAngle(seat.angle);
          setSeatPrice(seat.price ?? '');
        }
      } else {
        setSeats((prev) => prev.map((s) => ({ ...s, selected: false })));
      }
    } else if (tool === 'add') {
      const snappedX = snapToGrid(x);
      const snappedY = snapToGrid(y);
      if (isCellOccupied(snappedX, snappedY)) return; // blocked — cell taken
      pushUndo();
      let label = `${rowLetter}${seats.length + 1}`;
      let counter = seats.length + 1;
      while (isLabelDuplicate(label)) { counter++; label = `${rowLetter}${counter}`; }
      const newSeat: EditorSeat = {
        _tempId: nextTempId(), label,
        posX: snappedX, posY: snappedY,
        angle: seatAngle, color: seatColor, seatType,
        price: seatPrice === '' ? undefined : seatPrice,
        sectionName: seatSection || undefined, rowName: rowLetter || undefined,
        seatNumber: counter, selected: false, disabled: false,
      };
      setSeats((prev) => [...prev, newSeat]);
    } else if (tool === 'add-row' || tool === 'add-arc' || tool === 'add-triangle') {
      if (!rowStart) {
        setRowStart({ x: snapToGrid(x), y: snapToGrid(y) });
      } else {
        pushUndo();
        const shape = tool === 'add-row' ? 'row' : tool === 'add-arc' ? 'arc' : 'triangle';
        const rawSeats = generateShapeSeats(rowStart, { x: snapToGrid(x), y: snapToGrid(y) }, shape);
        // Snap each seat to grid and filter out collisions
        const occupiedSet = new Set(seats.map((s) => `${s.posX},${s.posY}`));
        const validSeats: EditorSeat[] = [];
        for (const s of rawSeats) {
          s.posX = snapToGrid(s.posX);
          s.posY = snapToGrid(s.posY);
          const key = `${s.posX},${s.posY}`;
          if (!occupiedSet.has(key)) {
            occupiedSet.add(key);
            validSeats.push(s);
          }
        }
        setSeats((prev) => [...prev, ...validSeats]);
        setRowStart(null);
        setRowLetter((l) => String.fromCharCode(l.charCodeAt(0) + 1));
      }
    } else if (tool === 'delete') {
      const seat = findSeatAt(x, y);
      if (seat) { pushUndo(); setSeats((prev) => prev.filter((s) => s._tempId !== seat._tempId)); }
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
      return;
    }

    if (dragging) {
      const { x, y } = canvasToWorld(e.clientX, e.clientY);
      // Snap movement to grid increments
      const snappedX = snapToGrid(x);
      const snappedY = snapToGrid(y);
      const snappedStartX = snapToGrid(dragStartPos.x);
      const snappedStartY = snapToGrid(dragStartPos.y);
      const dx = snappedX - snappedStartX;
      const dy = snappedY - snappedStartY;
      if (dx !== 0 || dy !== 0) {
        // Check if any selected seat would collide with a non-selected seat
        const selectedIds = new Set(seats.filter((s) => s.selected).map((s) => s._tempId));
        const nonSelectedPositions = new Set(
          seats.filter((s) => !s.selected).map((s) => `${s.posX},${s.posY}`),
        );
        const wouldCollide = seats.some((s) => {
          if (!s.selected) return false;
          return nonSelectedPositions.has(`${s.posX + dx},${s.posY + dy}`);
        });
        if (!wouldCollide) {
          setSeats((prev) => prev.map((s) =>
            s.selected ? { ...s, posX: s.posX + dx, posY: s.posY + dy } : s,
          ));
          setDragStartPos({ x, y });
        }
      }
    }
  }

  function handleMouseUp() {
    if (dragging) { pushUndo(); setDragging(false); }
    setIsPanning(false);
  }

  function handleDoubleClick(e: React.MouseEvent) {
    const { x, y } = canvasToWorld(e.clientX, e.clientY);
    const seat = findSeatAt(x, y);
    if (seat && tool === 'select') {
      setRenaming(seat._tempId);
      setRenameValue(seat.label);
      setRenameError('');
    }
  }

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom((z) => Math.min(3, Math.max(0.3, z * delta)));
  }

  // ── Rename ──
  function confirmRename() {
    if (!renaming) return;
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenameError('El nombre no puede estar vacio'); return; }
    if (isLabelDuplicate(trimmed, renaming)) { setRenameError('Ya existe un asiento con ese nombre'); return; }
    pushUndo();
    setSeats((prev) => prev.map((s) => s._tempId === renaming ? { ...s, label: trimmed } : s));
    setRenaming(null);
  }

  // ── Properties Update ──
  function updateSelectedSeats(updates: Partial<EditorSeat>) {
    pushUndo();
    setSeats((prev) => prev.map((s) => (s.selected ? { ...s, ...updates } : s)));
  }

  function deleteSelected() {
    pushUndo();
    setSeats((prev) => prev.filter((s) => !s.selected));
  }

  // ── Save ──
  async function handleSave() {
    setSaving(true);
    try {
      const seatsToSave = seats.map((s) => ({
        id: s.id, label: s.label, sectionName: s.sectionName,
        rowName: s.rowName, seatNumber: s.seatNumber,
        posX: s.posX, posY: s.posY, angle: s.angle,
        color: s.color, backgroundColor: s.backgroundColor, seatType: s.seatType,
        price: s.price ?? null,
        isActive: !s.disabled,
      }));
      await datasource.bulkUpsertSeats(theaterId, layoutId, seatsToSave);
    } finally { setSaving(false); }
  }

  const inputStyle = { backgroundColor: 'var(--surface-variant)', borderColor: 'var(--border)', color: 'var(--text-primary)' };

  return (
    <div className="fixed inset-0 z-50 flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left Toolbar */}
      <div className="w-[270px] flex flex-col border-r overflow-y-auto" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <button onClick={onClose} className="rounded-lg p-1" style={{ color: 'var(--text-secondary)' }}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{layoutName}</h2>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{seats.length} asientos</p>
          </div>
        </div>

        {/* Tools */}
        <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Herramientas</p>
          <div className="grid grid-cols-3 gap-1">
            {([
              { id: 'select', icon: MousePointer2, label: 'Seleccionar' },
              { id: 'add', icon: Plus, label: 'Agregar' },
              { id: 'add-row', icon: Rows3, label: 'Fila' },
              { id: 'add-arc', icon: Circle, label: 'Arco' },
              { id: 'add-triangle', icon: Triangle, label: 'Triangulo' },
              { id: 'delete', icon: Trash2, label: 'Eliminar' },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => { setTool(t.id); setRowStart(null); }}
                className="flex flex-col items-center gap-0.5 rounded-lg px-1.5 py-1.5 text-[10px] font-medium transition-colors"
                style={{
                  backgroundColor: tool === t.id ? 'var(--primary-container)' : 'var(--surface-variant)',
                  color: tool === t.id ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                <t.icon className="h-3.5 w-3.5" /> {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-1.5 mt-2">
            <button onClick={() => setShowGrid((g) => !g)}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs"
              style={{ backgroundColor: showGrid ? 'var(--accent-container)' : 'var(--surface-variant)', color: showGrid ? 'var(--accent)' : 'var(--text-muted)' }}>
              <Grid3x3 className="h-3 w-3" /> Grid
            </button>
            <button onClick={handleUndo} disabled={undoStack.length === 0}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs disabled:opacity-30"
              style={{ backgroundColor: 'var(--surface-variant)', color: 'var(--text-secondary)' }}>
              <Undo2 className="h-3 w-3" /> Deshacer
            </button>
          </div>
        </div>

        {/* Rename selected seat */}
        {selectedSeats.length === 1 && (
          <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1">
              <Type className="h-3 w-3" style={{ color: 'var(--text-muted)' }} />
              <label className="text-[10px] font-semibold uppercase" style={{ color: 'var(--text-muted)' }}>Nombre</label>
            </div>
            <div className="flex gap-1 mt-1">
              <input
                type="text"
                value={renaming === selectedSeats[0]._tempId ? renameValue : selectedSeats[0].label}
                onChange={(e) => {
                  if (renaming !== selectedSeats[0]._tempId) {
                    setRenaming(selectedSeats[0]._tempId);
                    setRenameError('');
                  }
                  setRenameValue(e.target.value);
                }}
                onKeyDown={(e) => { if (e.key === 'Enter') confirmRename(); if (e.key === 'Escape') setRenaming(null); }}
                onBlur={confirmRename}
                placeholder="ej. A1"
                className="flex-1 rounded-lg border px-2 py-1 text-xs outline-none"
                style={inputStyle}
              />
            </div>
            {renameError && <p className="text-[10px] mt-0.5" style={{ color: 'var(--error)' }}>{renameError}</p>}
          </div>
        )}

        {/* Seat Properties */}
        <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
            Propiedades {selectedSeats.length > 0 && `(${selectedSeats.length})`}
          </p>
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Tipo</label>
              <select value={seatType} onChange={(e) => {
                setSeatType(e.target.value);
                const st = SEAT_TYPES.find((t) => t.value === e.target.value);
                if (st) setSeatColor(st.color);
                if (selectedSeats.length > 0) updateSelectedSeats({ seatType: e.target.value, color: st?.color || seatColor });
              }} className="w-full rounded-lg border px-2 py-1 text-xs outline-none" style={inputStyle}>
                {SEAT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Seccion</label>
                <input type="text" placeholder="ej. Platea" value={seatSection}
                  onChange={(e) => { setSeatSection(e.target.value); if (selectedSeats.length > 0) updateSelectedSeats({ sectionName: e.target.value }); }}
                  className="w-full rounded-lg border px-2 py-1 text-xs outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Fila</label>
                <input type="text" placeholder="A" value={seatRow}
                  onChange={(e) => { setSeatRow(e.target.value); if (selectedSeats.length > 0) updateSelectedSeats({ rowName: e.target.value }); }}
                  className="w-full rounded-lg border px-2 py-1 text-xs outline-none" style={inputStyle} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Color</label>
                <div className="flex items-center gap-1">
                  <input type="color" value={seatColor}
                    onChange={(e) => { setSeatColor(e.target.value); if (selectedSeats.length > 0) updateSelectedSeats({ color: e.target.value }); }}
                    className="h-7 w-7 rounded border cursor-pointer" style={{ borderColor: 'var(--border)' }} />
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{seatColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Angulo</label>
                <input type="number" placeholder="0" value={seatAngle}
                  onChange={(e) => { setSeatAngle(Number(e.target.value)); if (selectedSeats.length > 0) updateSelectedSeats({ angle: Number(e.target.value) }); }}
                  className="w-full rounded-lg border px-2 py-1 text-xs outline-none" style={inputStyle} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Precio (MXN)</label>
              <input type="number" placeholder="0.00" value={seatPrice}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setSeatPrice(val);
                  if (selectedSeats.length > 0) updateSelectedSeats({ price: val === '' ? undefined : val });
                }}
                className="w-full rounded-lg border px-2 py-1 text-xs outline-none" style={inputStyle} />
              <p className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Precio por asiento en esta seccion</p>
            </div>
            {selectedSeats.length > 0 && (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    pushUndo();
                    const allDisabled = selectedSeats.every((s) => s.disabled);
                    setSeats((prev) => prev.map((s) => s.selected ? { ...s, disabled: !allDisabled } : s));
                  }}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs w-full justify-center"
                  style={{
                    backgroundColor: selectedSeats.every((s) => s.disabled) ? 'var(--success-container)' : 'var(--warning-container)',
                    color: selectedSeats.every((s) => s.disabled) ? 'var(--success)' : 'var(--warning)',
                  }}>
                  {selectedSeats.every((s) => s.disabled)
                    ? `Habilitar (${selectedSeats.length})`
                    : `Deshabilitar (${selectedSeats.length})`}
                </button>
                <button onClick={deleteSelected}
                  className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs w-full justify-center"
                  style={{ backgroundColor: 'var(--error-container)', color: 'var(--error)' }}>
                  <Trash2 className="h-3 w-3" /> Eliminar ({selectedSeats.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Shape Builder */}
        {(tool === 'add-row' || tool === 'add-arc' || tool === 'add-triangle') && (
          <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              {tool === 'add-row' ? 'Fila Recta' : tool === 'add-arc' ? 'Arco Curvo' : 'Triangulo'}
            </p>
            <p className="text-[10px] mb-2" style={{ color: 'var(--text-muted)' }}>
              {!rowStart ? 'Clic en el punto de inicio' : 'Clic en el punto final'}
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Asientos</label>
                <input type="number" min={1} max={100} value={rowCount}
                  onChange={(e) => setRowCount(Number(e.target.value))}
                  className="w-full rounded-lg border px-2 py-1 text-xs outline-none" style={inputStyle} />
              </div>
              <div>
                <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Letra Fila</label>
                <input type="text" maxLength={2} value={rowLetter}
                  onChange={(e) => setRowLetter(e.target.value.toUpperCase())}
                  className="w-full rounded-lg border px-2 py-1 text-xs outline-none" style={inputStyle} />
              </div>
            </div>
            {tool === 'add-arc' && (
              <div className="mt-2">
                <label className="block text-[10px] mb-0.5" style={{ color: 'var(--text-muted)' }}>Apertura del arco (grados)</label>
                <input type="range" min={30} max={300} value={arcAngleSpan}
                  onChange={(e) => setArcAngleSpan(Number(e.target.value))}
                  className="w-full" />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{arcAngleSpan}°</span>
              </div>
            )}
          </div>
        )}

        {/* Sections — price & summary */}
        {(() => {
          const sectionMap: Record<string, { count: number; disabled: number; price?: number; color: string }> = {};
          for (const s of seats) {
            const sec = s.sectionName || 'Sin seccion';
            if (!sectionMap[sec]) sectionMap[sec] = { count: 0, disabled: 0, price: s.price, color: s.color };
            sectionMap[sec].count++;
            if (s.disabled) sectionMap[sec].disabled++;
          }
          const sectionNames = Object.keys(sectionMap);
          if (sectionNames.length === 0) return null;
          return (
            <div className="px-3 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Secciones ({sectionNames.length})
              </p>
              <div className="space-y-2">
                {sectionNames.map((sec) => {
                  const info = sectionMap[sec];
                  return (
                    <div key={sec} className="rounded-lg p-2" style={{ backgroundColor: 'var(--surface-variant)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="inline-block h-2.5 w-2.5 rounded" style={{ backgroundColor: info.color }} />
                          <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{sec}</span>
                        </div>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                          {info.count} asientos{info.disabled > 0 ? ` (${info.disabled} off)` : ''}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>$</span>
                        <input
                          type="number"
                          placeholder="Precio"
                          value={info.price ?? ''}
                          onChange={(e) => {
                            pushUndo();
                            const newPrice = e.target.value === '' ? undefined : Number(e.target.value);
                            setSeats((prev) => prev.map((s) =>
                              (s.sectionName || 'Sin seccion') === sec ? { ...s, price: newPrice } : s,
                            ));
                          }}
                          className="flex-1 rounded border px-1.5 py-0.5 text-[11px] outline-none"
                          style={inputStyle}
                        />
                        <button
                          onClick={() => {
                            // Select all seats in this section
                            setSeats((prev) => prev.map((s) => ({
                              ...s,
                              selected: (s.sectionName || 'Sin seccion') === sec,
                            })));
                            setTool('select');
                          }}
                          className="rounded px-1.5 py-0.5 text-[10px]"
                          style={{ backgroundColor: 'var(--accent-container)', color: 'var(--accent)' }}
                        >
                          Seleccionar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* Legend */}
        <div className="px-3 py-3">
          <p className="text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Tipos de Asiento</p>
          <div className="space-y-1">
            {SEAT_TYPES.map((t) => (
              <div key={t.value} className="flex items-center gap-2">
                <span className="inline-block h-3 w-3 rounded" style={{ backgroundColor: t.color }} />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{t.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Save */}
        <div className="mt-auto p-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 justify-center w-full rounded-xl px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            style={{ backgroundColor: 'var(--primary)', color: '#fff' }}>
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : `Guardar ${seats.length} asientos`}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="flex-1 overflow-hidden"
        style={{ cursor: tool === 'select' ? (dragging ? 'grabbing' : 'default') : tool === 'delete' ? 'not-allowed' : 'crosshair' }}>
        <canvas ref={canvasRef} className="w-full h-full"
          onMouseDown={handleMouseDown} onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
          onDoubleClick={handleDoubleClick} onWheel={handleWheel} />
      </div>

      {/* Status bar */}
      <div className="fixed bottom-0 left-[270px] right-0 flex items-center justify-between px-4 py-1.5 border-t text-xs"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        <span>Zoom: {Math.round(zoom * 100)}% | Asientos: {seats.length} | Seleccionados: {selectedSeats.length}</span>
        <span>Doble clic para renombrar | Delete para eliminar | Ctrl+Z deshacer | Ctrl+A seleccionar todo</span>
      </div>
    </div>
  );
}
