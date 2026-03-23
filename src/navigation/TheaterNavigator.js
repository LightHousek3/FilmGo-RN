import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TheaterScreen from "../screens/placeholder/TheaterScreen";
import TheaterShowtimesScreen from "../screens/theater/TheaterShowtimesScreen";

const Stack = createNativeStackNavigator();

const TheaterNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TheaterHome" component={TheaterScreen} />
      <Stack.Screen name="TheaterShowtimes" component={TheaterShowtimesScreen} />
    </Stack.Navigator>
  );
};

export default TheaterNavigator;
