import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
};

type EditNav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfile() {
  const navigation = useNavigation<EditNav>();

  // Placeholder state
  const [username, setUsername] = useState('john_doe');
  const [password, setPassword] = useState('');
  const [pfpUri, setPfpUri] = useState<string>(
    'https://cdn-icons-png.flaticon.com/512/847/847969.png'
  );

  const onChangePhoto = () => {
    Alert.alert(
      'Change Photo',
      'Photo picker not wired yet. You can connect expo-image-picker later.'
    );
  };

  const onSave = () => {
    Alert.alert('Saved', 'Profile changes saved (local only for now).');
    navigation.goBack();
  };

  const onCancel = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarRow}>
        <Image source={{ uri: pfpUri }} style={styles.avatar} />
        <TouchableOpacity onPress={onChangePhoto} style={styles.linkButton}>
          <Text style={styles.linkText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <Text style={styles.label}>New Password</Text>
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onCancel}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.save]} onPress={onSave}>
          <Text style={styles.btnText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const PURPLE = '#5E4AE3';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE9FF',
    padding: 20,
  },

  header: {
    fontSize: 22,
    fontWeight: 'bold',
    color: PURPLE,
    marginBottom: 16,
  },

  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#fff',
  },

  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: PURPLE,
  },

  linkText: {
    color: PURPLE,
    fontWeight: '600',
  },

  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  label: {
    fontSize: 14,
    color: '#555',
    marginTop: 6,
  },

  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },

  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },

  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },

  cancel: {
    backgroundColor: '#e74c3c',
  },

  save: {
    backgroundColor: PURPLE,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});
