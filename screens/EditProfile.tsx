import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
};

type EditNav = NativeStackNavigationProp<RootStackParamList, 'EditProfile'>;

export default function EditProfile() {
  const navigation = useNavigation<EditNav>();
  const { user, updateUser } = useUser();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Load user data when component mounts
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setBio(user.bio || '');
      setProfilePictureUrl(user.profile_picture_url || '');
    }
  }, [user]);

  const onChangePhoto = () => {
    Alert.prompt(
      'Change Photo URL',
      'Enter a new profile picture URL:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (url) => {
            if (url) setProfilePictureUrl(url);
          },
        },
      ],
      'plain-text',
      profilePictureUrl
    );
  };

  const onSave = async () => {
    if (!user) return;

    // Basic validation
    if (!name.trim() || !username.trim()) {
      Alert.alert('Error', 'Name and username are required');
      return;
    }

    setIsSaving(true);
    try {
      // Split name into first and last for backend
      const nameParts = name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      await updateUser({
        name: name.trim(),
        first_name: firstName,
        last_name: lastName,
        username: username.trim(),
        bio: bio.trim(),
        profile_picture_url: profilePictureUrl.trim(),
      });
      
      Alert.alert('Success', 'Profile updated successfully!');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const onCancel = () => navigation.goBack();

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Profile</Text>

      {/* Avatar */}
      <View style={styles.avatarRow}>
        <Image source={{ uri: profilePictureUrl || 'https://cdn-icons-png.flaticon.com/512/847/847969.png' }} style={styles.avatar} />
        <TouchableOpacity onPress={onChangePhoto} style={styles.linkButton}>
          <Text style={styles.linkText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your full name"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          placeholder="username"
        />

        <Text style={styles.label}>Bio</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
          placeholder="Tell us about yourself..."
        />

        <Text style={styles.label}>Profile Picture URL</Text>
        <TextInput
          style={styles.input}
          value={profilePictureUrl}
          onChangeText={setProfilePictureUrl}
          placeholder="https://..."
          autoCapitalize="none"
        />
      </View>

      {/* Buttons */}
      <View style={styles.btnRow}>
        <TouchableOpacity style={[styles.btn, styles.cancel]} onPress={onCancel}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.btn, styles.save, isSaving && styles.disabled]} 
          onPress={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.btnText}>Save Changes</Text>
          )}
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

  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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

  disabled: {
    opacity: 0.6,
  },
});
