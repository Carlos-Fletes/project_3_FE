import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Platform } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello World! 👋</Text>
      <Text style={styles.subtitle}>React Native Expo + TypeScript</Text>
      <Text style={styles.platform}>
        Running on: {Platform.OS === 'web' ? 'Web Browser' : Platform.OS}
      </Text>
      <Text style={styles.instruction}>
        Ready for your assignment! 🚀
      </Text>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  platform: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 15,
    fontWeight: '600',
  },
  instruction: {
    fontSize: 16,
    color: '#28a745',
    textAlign: 'center',
    fontWeight: '500',
  },
});
