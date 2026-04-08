import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '@/constants/theme';
import { MaterialIcons } from '@expo/vector-icons';
import React from 'react';

export const NoNoteThumbnail = (setNewTitle: Function, setShowNewModal: Function) => {
    return (
        <View style={styles.emptyState}>
            <Image
                source={require('@/assets/images/onboarding-hero.png')}
                style={styles.emptyImage}
                contentFit="contain"
            />
            <Text style={styles.emptyTitle}>No Notes Yet</Text>
            <Text style={styles.emptyBody}>Tap the + button to create your first note and start writing with your stylus.</Text>
            <Pressable
                style={({ pressed }) => [styles.emptyBtn, pressed && { opacity: 0.8 }]}
                onPress={() => { setNewTitle(''); setShowNewModal(true); }}
            >
                <MaterialIcons name="add" size={20} color={Colors.bg} />
                <Text style={styles.emptyBtnText}>New Note</Text>
            </Pressable>
        </View>
    )
}

const styles = StyleSheet.create({
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    emptyImage: { width: 220, height: 300, marginBottom: Spacing.lg },
    emptyTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: Spacing.sm, textAlign: 'center' },
    emptyBody: { ...Typography.body, color: Colors.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: Spacing.xl },
    emptyBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.accent,
        paddingHorizontal: Spacing.lg,
        paddingVertical: 12,
        borderRadius: Radius.full,
        gap: Spacing.xs,
    },
    emptyBtnText: { color: Colors.bg, fontWeight: '600', fontSize: 16 },

})