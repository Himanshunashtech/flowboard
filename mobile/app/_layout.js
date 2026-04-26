import { Slot } from 'expo-router';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import '../global.css';

// Typically you would wrap <Slot/> in Redux Provider here.
// For now, setting up the basic routing structure.
export default function Layout() {
  return (
    <View className="flex-1 bg-background">
      <StatusBar style="auto" />
      <Slot />
    </View>
  );
}