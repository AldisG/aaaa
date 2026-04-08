// Powered by OnSpace.AI
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from 'react';
import {
    Modal,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    View
} from 'react-native';
import Svg, { Circle, Defs, Rect, Stop, LinearGradient as SvgLinearGradient, RadialGradient as SvgRadialGradient } from 'react-native-svg';

const PRESET_COLORS = [
  '#1A1A1A', '#1E3A8A', '#991B1B', '#14532D',
  '#4A1D96', '#7C2D12', '#0F4C75', '#1B4F72',
  '#145A32', '#4A235A', '#784212', '#1F2937',
  '#FFFFFF', '#F5F5F5', '#E8C98E', '#FF9F0A',
];

const WHEEL_SIZE = 240;
const WHEEL_RADIUS = WHEEL_SIZE / 2;

function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const hi = Math.floor(h / 60) % 6;
  const f = h / 60 - Math.floor(h / 60);
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  const vals: [number, number, number][] = [
    [v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q],
  ];
  const [r, g, b] = vals[hi];
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
}

// Build a hue ring from 36 colored arcs using SVG wedges
function hueToColor(hue: number, brightness: number): string {
  const [r, g, b] = hsvToRgb(hue, 1, brightness);
  return rgbToHex(r, g, b);
}

interface Props {
  visible: boolean;
  onClose: () => void;
  currentColor: string;
  customSwatches: string[];
  onColorChange: (color: string) => void;
  onSaveSwatch: (color: string) => void;
}

export default function ColorPickerModal({
  visible, onClose, currentColor, customSwatches,
  onColorChange, onSaveSwatch,
}: Props) {
  const [hue, setHue] = useState(0);
  const [saturation, setSaturation] = useState(0.9);
  const [brightness, setBrightness] = useState(0.85);

  const computedColor = (() => {
    const [r, g, b] = hsvToRgb(hue, saturation, brightness);
    return rgbToHex(r, g, b);
  })();

  const updateFromXY = useCallback((lx: number, ly: number, bv: number) => {
    const dx = lx - WHEEL_RADIUS;
    const dy = ly - WHEEL_RADIUS;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > WHEEL_RADIUS + 16) return;
    let angle = Math.atan2(dy, dx) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    const s = Math.min(1, dist / WHEEL_RADIUS);
    setHue(angle);
    setSaturation(s);
    const [r, g, b] = hsvToRgb(angle, s, bv);
    onColorChange(rgbToHex(r, g, b));
  }, [onColorChange]);

  const wheelPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      updateFromXY(e.nativeEvent.locationX, e.nativeEvent.locationY, brightness);
    },
    onPanResponderMove: (e) => {
      updateFromXY(e.nativeEvent.locationX, e.nativeEvent.locationY, brightness);
    },
  });

  const SLIDER_W = WHEEL_SIZE;
  const sliderPan = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (e) => {
      const v = Math.max(0.05, Math.min(1, e.nativeEvent.locationX / SLIDER_W));
      setBrightness(v);
      const [r, g, b] = hsvToRgb(hue, saturation, v);
      onColorChange(rgbToHex(r, g, b));
    },
    onPanResponderMove: (e) => {
      const v = Math.max(0.05, Math.min(1, e.nativeEvent.locationX / SLIDER_W));
      setBrightness(v);
      const [r, g, b] = hsvToRgb(hue, saturation, v);
      onColorChange(rgbToHex(r, g, b));
    },
  });

  // Build 36 hue segments as SVG pie wedges
  const SEGMENTS = 36;
  const angleStep = 360 / SEGMENTS;
  const wedgePaths: { d: string; color: string }[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const startAngle = (i * angleStep - 90) * (Math.PI / 180);
    const endAngle = ((i + 1) * angleStep - 90) * (Math.PI / 180);
    const r = WHEEL_RADIUS;
    const cx = WHEEL_RADIUS;
    const cy = WHEEL_RADIUS;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
    wedgePaths.push({ d, color: hueToColor(i * angleStep, brightness) });
  }

  // Indicator position
  const indAngle = (hue - 90) * (Math.PI / 180);
  const indR = saturation * (WHEEL_RADIUS - 6);
  const indX = WHEEL_RADIUS + indR * Math.cos(indAngle);
  const indY = WHEEL_RADIUS + indR * Math.sin(indAngle);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={e => e.stopPropagation()}>
          <View style={styles.dragHandle} />
          <Text style={styles.title}>Color Picker</Text>

          {/* SVG Color Wheel */}
          <View style={styles.wheelContainer} {...wheelPan.panHandlers}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE}>
              <Defs>
                <SvgRadialGradient id="whiteGrad" cx="50%" cy="50%" r="50%">
                  <Stop offset="0%" stopColor="white" stopOpacity={1} />
                  <Stop offset="100%" stopColor="white" stopOpacity={0} />
                </SvgRadialGradient>
              </Defs>
              {/* Hue wedges */}
              {wedgePaths.map((w, i) => (
                <Svg key={i}>
                  <Circle
                    cx={WHEEL_RADIUS}
                    cy={WHEEL_RADIUS}
                    r={WHEEL_RADIUS}
                    fill={w.color}
                    clipPath={`path("${w.d}")`}
                  />
                </Svg>
              ))}
              {/* White radial overlay for saturation */}
              <Circle cx={WHEEL_RADIUS} cy={WHEEL_RADIUS} r={WHEEL_RADIUS} fill="url(#whiteGrad)" />
              {/* Center */}
              <Circle cx={WHEEL_RADIUS} cy={WHEEL_RADIUS} r={WHEEL_RADIUS * 0.08} fill="white" />
              {/* Indicator */}
              <Circle cx={indX} cy={indY} r={8} fill="none" stroke="white" strokeWidth={2.5} />
              <Circle cx={indX} cy={indY} r={5} fill={computedColor} />
            </Svg>
          </View>

          {/* Brightness Slider */}
          <Text style={styles.sliderLabel}>Brightness</Text>
          <View style={[styles.sliderTrack, { width: SLIDER_W }]} {...sliderPan.panHandlers}>
            <Svg width={SLIDER_W} height={28} style={StyleSheet.absoluteFill}>
              <Defs>
                <SvgLinearGradient id="brightGrad" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0%" stopColor="#000" />
                  <Stop offset="100%" stopColor={hueToColor(hue, 1)} />
                </SvgLinearGradient>
              </Defs>
              <Rect x={0} y={0} width={SLIDER_W} height={28} fill="url(#brightGrad)" rx={14} />
            </Svg>
            <View style={[styles.sliderThumb, { left: brightness * SLIDER_W - 10 }]} />
          </View>

          {/* Current Color + Save Swatch */}
          <View style={styles.currentRow}>
            <View style={[styles.currentSwatch, { backgroundColor: computedColor }]} />
            <Text style={styles.currentHex}>{computedColor.toUpperCase()}</Text>
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
              onPress={() => onSaveSwatch(computedColor)}
            >
              <MaterialIcons name="bookmark-add" size={18} color={Colors.bg} />
              <Text style={styles.saveBtnText}>Save Swatch</Text>
            </Pressable>
          </View>

          {/* Presets */}
          <Text style={styles.sectionLabel}>Presets</Text>
          <View style={styles.swatchGrid}>
            {PRESET_COLORS.map(c => (
              <Pressable
                key={c}
                style={[styles.swatch, { backgroundColor: c }, c === currentColor && styles.swatchSelected]}
                onPress={() => onColorChange(c)}
              />
            ))}
          </View>

          {/* Custom Swatches */}
          {customSwatches.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>My Swatches</Text>
              <View style={styles.swatchGrid}>
                {customSwatches.map((c, i) => (
                  <Pressable
                    key={i}
                    style={[styles.swatch, { backgroundColor: c }, c === currentColor && styles.swatchSelected]}
                    onPress={() => onColorChange(c)}
                  />
                ))}
              </View>
            </>
          )}

          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Done</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.lg,
    paddingBottom: 40,
    alignItems: 'center',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: 2,
    marginBottom: Spacing.md,
  },
  title: { ...Typography.h3, color: Colors.textPrimary, marginBottom: Spacing.md },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_RADIUS,
    overflow: 'hidden',
    marginBottom: Spacing.md,
  },
  sliderLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: 6, alignSelf: 'flex-start' },
  sliderTrack: {
    height: 28,
    borderRadius: 14,
    marginBottom: Spacing.md,
    overflow: 'visible',
    position: 'relative',
    justifyContent: 'center',
  },
  sliderThumb: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'white',
    top: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  currentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignSelf: 'stretch',
  },
  currentSwatch: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  currentHex: { ...Typography.body, color: Colors.textPrimary, flex: 1, fontFamily: 'monospace' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: Radius.sm,
    gap: 4,
  },
  saveBtnText: { color: Colors.bg, fontWeight: '600', fontSize: 13 },
  sectionLabel: { ...Typography.label, color: Colors.textSecondary, marginBottom: Spacing.sm, alignSelf: 'flex-start' },
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    alignSelf: 'stretch',
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.surfaceElevated,
  },
  swatchSelected: {
    borderWidth: 3,
    borderColor: Colors.accent,
  },
  closeBtn: {
    backgroundColor: Colors.accent,
    padding: 14,
    borderRadius: Radius.md,
    alignItems: 'center',
    alignSelf: 'stretch',
    marginTop: Spacing.sm,
  },
  closeBtnText: { color: Colors.bg, fontWeight: '700', fontSize: 16 },
});
