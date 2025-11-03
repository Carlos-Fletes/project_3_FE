// Login.tsx
//web 127612041741-30t2l6pgdt18ij22gvvr03r1kf4org0h.apps.googleusercontent.com
// andriod 127612041741-3j8btuc7ol6immrjslqvkbrlj89o2ggf.apps.googleusercontent.com

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const Login: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Hello</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Login;
