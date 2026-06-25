import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../features/home/screens/HomeScreen";
import NotificationScreen from "../features/notification/screens/NotificationScreen";
import DigitalIDScreen from "../features/digitalID/screens/DigitalIDScreen";
import StatusScreen from "../features/status/screens/StatusScreen";
import SettingScreen from "../features/setting/screens/SettingScreen";
import CustomTabBar from "./components/CustomTabBar";
import type { MainTabParamList } from "./types";

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabNavigator: React.FC = () => (
  <Tab.Navigator
    screenOptions={{ headerShown: false }}
    tabBar={(props) => <CustomTabBar {...props} />}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Notifications" component={NotificationScreen} />
    <Tab.Screen name="DigitalID" component={DigitalIDScreen} />
    <Tab.Screen name="Status" component={StatusScreen} />
    <Tab.Screen name="Settings" component={SettingScreen} />
  </Tab.Navigator>
);

export default MainTabNavigator;
