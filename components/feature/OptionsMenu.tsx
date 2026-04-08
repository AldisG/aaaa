// Powered by OnSpace.AI
import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface Option {
  icon: string;
  label: string;
  sublabel?: string;
  action: () => void;
  danger?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  options: Option[];
  loading?: boolean;
}

export default function OptionsMenu({ visible, onClose, options, loading }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Options</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <MaterialIcons name="close" size={22} color={Colors.textSecondary} />
            </Pressable>
          </View>

          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={Colors.accent} />
              <Text style={styles.loadingText}>Processing...</Text>
            </View>
          )}

          {!loading && options.map((opt, i) => (
            <Pressable
              key={i}
              style={({ pressed }) => [
                styles.option,
                i < options.length - 1 && styles.optionBorder,
                pressed && { backgroundColor: Colors.surfaceElevated },
              ]}
              onPress={() => { opt.action(); }}
            >
              <View style={[styles.optionIcon, opt.danger && styles.optionIconDanger]}>
                <MaterialIcons
                  name={opt.icon as any}
                  size={10}
                  color={opt.danger ? Colors.danger : Colors.accent}
                />
              </View>
              <View style={styles.optionText}>
                <Text style={[styles.optionLabel, opt.danger && styles.optionLabelDanger]}>
                  {opt.label}
                </Text>
                {opt.sublabel ? (
                  <Text style={styles.optionSublabel}>{opt.sublabel}</Text>
                ) : null}
              </View>
              <MaterialIcons name="chevron-right" size={18} color={Colors.textMuted} />
            </Pressable>
          ))}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  menu: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: { ...Typography.h3, color: Colors.textPrimary },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  loadingText: { ...Typography.body, color: Colors.textSecondary },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  optionBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.border,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionIconDanger: { backgroundColor: 'rgba(255,69,58,0.15)' },
  optionText: { flex: 1 },
  optionLabel: { ...Typography.body, color: Colors.textPrimary, fontWeight: '500' },
  optionLabelDanger: { color: Colors.danger },
  optionSublabel: { ...Typography.caption, color: Colors.textMuted, marginTop: 2 },
});
