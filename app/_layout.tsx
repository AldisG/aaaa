import { Stack } from "expo-router";

import "../global.css";

export default function RootLayout() {
    return <Stack screenOptions={{
        headerShown: false,
        contentStyle: {
            paddingHorizontal: 16,
            paddingTop: 32,
            paddingBottom: 16,
        },
    }}>
        <Stack.Screen name="(tabs)" />
    </Stack>;
}
