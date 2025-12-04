import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const API_BASE = 'https://betsocial-fde6ef886274.herokuapp.com';

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [category, setCategory] = useState('');
  const [endsAt, setEndsAt] = useState('');

  const handleCreatePoll = async () => {
    if (!question || !options || !category || !endsAt) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const endsAtIso = endsAt.endsWith('Z') ? endsAt : `${endsAt}Z`;

    try {
      const response = await fetch(`${API_BASE}/api/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          options: options.split(',').map(opt => opt.trim()),
          category,
          endsAt: endsAtIso,
          status: 'PENDING',
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Poll created successfully!');
        setQuestion('');
        setOptions('');
        setCategory('');
        setEndsAt('');
      } 
      else {
        const text = await response.text();
        console.log('Create poll error body:', text);
        Alert.alert('Error', 'Failed to create poll.');
      }
    } 
    catch (error) {
      console.error('Create poll error:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Poll</Text>

      <TextInput
        style={styles.input}
        placeholder="Poll Question"
        value={question}
        onChangeText={setQuestion}
      />

      <TextInput
        style={styles.input}
        placeholder="Options (comma separated)"
        value={options}
        onChangeText={setOptions}
      />

      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />

      <TextInput
        style={styles.input}
        placeholder="End Date (YYYY-MM-DDTHH:mm:ss)"
        value={endsAt}
        onChangeText={setEndsAt}
      />

      <TouchableOpacity style={styles.button} onPress={handleCreatePoll}>
        <Text style={styles.buttonText}>Submit Poll</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ECE9FF',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4B3EFF',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#6B4EFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
});