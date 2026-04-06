import { Ionicons } from "@expo/vector-icons";
import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { ParamListBase, RouteProp, useNavigationState } from '@react-navigation/native';
import { Tabs } from "expo-router";
import { ComponentProps } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

const tabBarButtonStyleElement = (props: BottomTabBarButtonProps, route: RouteProp<ParamListBase, string>, isLarge: boolean) => {
    const activeRouteName = useNavigationState(state =>
        state.routes[state.index].name
    );

    const { accessibilityState, onPress } = props;
    const focused = accessibilityState?.selected;

    const iconName: IconName = (route.name === "pokemon") ? "flame" : "home";
    const color = (route.name === activeRouteName) ? "orange" : "#eee"

    return (
        <Pressable
            onPress={onPress}
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <View
                style={{
                    backgroundColor: focused ? "#3b2a7a" : "transparent",
                    padding: 8,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "row",
                    gap: isLarge ? 6 : 0,
                }}
            >
                <Ionicons name={iconName} size={20} color={color} />

                {isLarge && (
                    <Text style={{ color: color, fontSize: 12 }}>
                        {route.name}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

export default function Layout() {
    const { width } = useWindowDimensions();
    const isLarge = width >= 768;

    return (
        <Tabs
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    position: "absolute",
                    bottom: 8,
                    left: isLarge ? "25%" : 16,
                    right: isLarge ? "25%" : 16,
                    height: 60,
                    borderRadius: 20,
                    backgroundColor: "#2b1e5a",
                    borderTopWidth: 0,
                    elevation: 8,
                    paddingBottom: 0,
                },
                tabBarButton: (props) => tabBarButtonStyleElement(props, route, isLarge)
            })}
        />
    );
}