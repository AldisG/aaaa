// Powered by OnSpace.AI
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Pressable, ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { ToolType } from './DrawingCanvas';

const QUICK_COLORS = ['#1A1A1A', '#1E3A8A', '#991B1B', '#14532D', '#4A1D96', '#FFFFFF'];

interface Props {
  currentTool: ToolType;
  currentColor: string;
  strokeWidth: number;
  canUndo: boolean;
  canRedo: boolean;
  customSwatches: string[];
  onToolChange: (tool: ToolType) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (w: number) => void;
  onOpenColorPicker: () => void;
  onUndo: () => void;
  onRedo: () => void;
}

export default function ToolBar({
  currentTool, currentColor, strokeWidth, canUndo, canRedo,
  customSwatches, onToolChange, onColorChange, onStrokeWidthChange,
  onOpenColorPicker, onUndo, onRedo,
}: Props) {
  const [showSizes, setShowSizes] = useState(false);

  const TOOLS: { key: ToolType; icon: string; label: string }[] = [
    { key: 'pen', icon: 'pen', label: 'Pen' },
    { key: 'pencil', icon: 'pencil', label: 'Pencil' },
    { key: 'marker', icon: 'marker', label: 'Marker' },
    { key: 'eraser', icon: 'eraser', label: 'Erase' },
  ];

  const SIZES = [2, 4, 6, 10, 16, 24];

  const allColors = [...QUICK_COLORS, ...customSwatches.slice(0, 4)];

  return (
    <View style={styles.container}>
      {/* Tools Row */}
      <View style={styles.row}>
        {/* Left: Tool buttons */}
        <View style={styles.toolGroup}>
          {TOOLS.map(t => (
            <Pressable
              key={t.key}
              style={({ pressed }) => [
                styles.toolBtn,
                currentTool === t.key && styles.toolBtnActive,
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => onToolChange(t.key)}
            >
              <MaterialCommunityIcons
                name={t.icon as any}
                size={20}
                color={currentTool === t.key ? Colors.bg : Colors.textSecondary}
              />
            </Pressable>
          ))}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Color swatches */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.colorScroll}
          contentContainerStyle={styles.colorScrollContent}
        >
          {allColors.map((c, i) => (
            <Pressable
              key={i}
              style={[
                styles.colorDot,
                { backgroundColor: c },
                c === currentColor && styles.colorDotActive,
                c === '#FFFFFF' && styles.colorDotWhite,
              ]}
              onPress={() => onColorChange(c)}
            />
          ))}
          <Pressable
            style={({ pressed }) => [styles.colorWheelBtn, pressed && { opacity: 0.7 }]}
            onPress={onOpenColorPicker}
          >
            <MaterialIcons name="color-lens" size={18} color={Colors.accent} />
          </Pressable>
        </ScrollView>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Size + Undo/Redo */}
        <View style={styles.actionGroup}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.7 }]}
            onPress={() => setShowSizes(s => !s)}
          >
            <View style={[styles.sizeDot, { width: Math.min(20, strokeWidth + 4), height: Math.min(20, strokeWidth + 4) }]} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, !canUndo && styles.iconBtnDisabled, pressed && { opacity: 0.7 }]}
            onPress={onUndo}
            disabled={!canUndo}
          >
            <MaterialIcons name="undo" size={20} color={canUndo ? Colors.textPrimary : Colors.textMuted} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, !canRedo && styles.iconBtnDisabled, pressed && { opacity: 0.7 }]}
            onPress={onRedo}
            disabled={!canRedo}
          >
            <MaterialIcons name="redo" size={20} color={canRedo ? Colors.textPrimary : Colors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Size picker popup */}
      {showSizes && (
        <View style={styles.sizeRow}>
          {SIZES.map(s => (
            <Pressable
              key={s}
              style={[styles.sizeOption, s === strokeWidth && styles.sizeOptionActive]}
              onPress={() => { onStrokeWidthChange(s); setShowSizes(false); }}
            >
              <View style={[styles.sizeDot, {
                width: Math.min(22, s + 4),
                height: Math.min(22, s + 4),
                backgroundColor: s === strokeWidth ? Colors.accent : Colors.textSecondary,
              }]} />
            </Pressable>
          ))}
          <Text style={styles.sizeLabel}>{strokeWidth}px</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toolGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  toolBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  toolBtnActive: {
    backgroundColor: Colors.accent,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.xs,
  },
  colorScroll: { flex: 1, maxHeight: 44 },
  colorScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.surfaceElevated,
  },
  colorDotActive: {
    borderColor: Colors.accent,
    borderWidth: 3,
  },
  colorDotWhite: {
    borderColor: Colors.border,
  },
  colorWheelBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionGroup: {
    flexDirection: 'row',
    gap: 4,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surfaceElevated,
  },
  iconBtnDisabled: { opacity: 0.4 },
  sizeDot: {
    borderRadius: 10,
    backgroundColor: Colors.textPrimary,
  },
  sizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
  },
  sizeOption: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeOptionActive: { backgroundColor: Colors.border },
  sizeLabel: { ...Typography.caption, color: Colors.textSecondary, marginLeft: 'auto' as any },
});
