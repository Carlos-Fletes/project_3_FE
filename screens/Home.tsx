import React from 'react';
import { View, Text, Button } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Welcome Home!</Text>
      <Button title="Logout" onPress={() => console.log('Logout')} />
    </View>
  );
}
