import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform } from 'react-native';
import { WebView } from 'react-native-webview';
import Constants from 'expo-constants';

export default function App() {
  // If no URL is provided, it falls back to a placeholder or localhost for testing.
  // In a real scenario, you'd replace this with the production URL of your Vite/React app.
  const webAppUrl = Constants.expoConfig?.extra?.webAppUrl || 'https://flowboard-app.vercel.app';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <WebView
        source={{ uri: webAppUrl }}
        style={styles.webview}
        // Allows the webview to handle back navigation and links gracefully
        allowsBackForwardNavigationGestures={true}
        // Essential for React web apps
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Match this with your web app's background color
    // Ensure content doesn't go under Android status bar
    paddingTop: Platform.OS === 'android' ? Constants.statusBarHeight : 0,
  },
  webview: {
    flex: 1,
  },
});
