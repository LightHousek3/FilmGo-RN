import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import FestivalScreen from "../screens/festival/FestivalScreen";
import FestivalDetailScreen from "../screens/festival/FestivalDetailScreen";

const Stack = createNativeStackNavigator();

const FestivalStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FestivalList" component={FestivalScreen} />
      <Stack.Screen name="FestivalDetail" component={FestivalDetailScreen} />
    </Stack.Navigator>
  );
};

export default FestivalStackNavigator;