// Powered by OnSpace.AI
import { Colors, Radius, Spacing } from '@/constants/theme';
import { NotePage } from '@/services/notesService';
import { MaterialIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

interface Props {
  pages: NotePage[];
  currentIndex: number;
  onPageChange: (index: number) => void;
  onAddPage: () => void;
}

export default function PageNavigator({ pages, currentIndex, onPageChange, onAddPage }: Props) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {pages.map((page, idx) => (
          <Pressable
            key={page.id}
            style={({ pressed }) => [
              styles.thumb,
              idx === currentIndex && styles.thumbActive,
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => onPageChange(idx)}
          >
            {page.thumbnail ? (
              <Image source={{ uri: page.thumbnail }} style={styles.thumbImage} contentFit="cover" />
            ) : (
              <View style={styles.thumbBlank}>
                {[0, 1, 2].map(l => (
                  <View key={l} style={styles.thumbLine} />
                ))}
              </View>
            )}
            <Text style={[styles.pageNum, idx === currentIndex && styles.pageNumActive]}>
              {idx + 1}
            </Text>
          </Pressable>
        ))}

        <Pressable
          style={({ pressed }) => [styles.addBtn, pressed && { opacity: 0.7 }]}
          onPress={onAddPage}
        >
          <MaterialIcons name="add" size={20} color={Colors.accent} />
          <Text style={styles.addBtnText}>Page</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 72,
    backgroundColor: Colors.bg,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  scroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  thumb: {
    width: 48,
    height: 56,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    backgroundColor: Colors.pageLinedBg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  thumbActive: {
    borderColor: Colors.accent,
    borderWidth: 2.5,
  },
  thumbImage: { ...StyleSheet.absoluteFillObject },
  thumbBlank: {
    flex: 1,
    width: '100%',
    padding: 4,
    justifyContent: 'center',
    gap: 4,
  },
  thumbLine: {
    height: 1,
    backgroundColor: Colors.pageLinedLine,
    opacity: 0.8,
  },
  pageNum: {
    position: 'absolute',
    bottom: 2,
    right: 3,
    fontSize: 9,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  pageNumActive: { color: Colors.accent },
  addBtn: {
    width: 48,
    height: 56,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  addBtnText: { fontSize: 10, color: Colors.accent, fontWeight: '600' },
});
