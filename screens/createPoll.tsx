import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

const API_BASE = 'https://betsocial-fde6ef886274.herokuapp.com';

function parseEndDate(input: string): Date | null {
  const trimmed = input.trim();
  const regex =
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})\s*(AM|PM)$/i;

  const match = trimmed.match(regex);
  if (!match) {
    return null;
  }

  const [
    _full,
    monthStr,
    dayStr,
    yearStr,
    hourStr,
    minuteStr,
    ampmRaw,
  ] = match;

  const month = Number(monthStr);
  const day = Number(dayStr);
  const year = Number(yearStr);
  let hour = Number(hourStr);
  const minute = Number(minuteStr);
  const ampm = ampmRaw.toUpperCase();

  if (month < 1 || month > 12) return null;
  if (day < 1 || day > 31) return null;
  if (hour < 1 || hour > 12) return null;
  if (minute < 0 || minute > 59) return null;

  if (ampm === 'PM' && hour !== 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;

  const date = new Date(year, month - 1, day, hour, minute);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export default function CreatePoll() {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState('');
  const [category, setCategory] = useState('');
  const [endsAtInput, setEndsAtInput] = useState('');

  const handleCreatePoll = async () => {
    if (!question || !options || !category || !endsAtInput) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const parsedDate = parseEndDate(endsAtInput);
    if (!parsedDate) {
      Alert.alert(
        'Invalid date',
        'Please use format MM/DD/YYYY HH:MM AM/PM (e.g. 12/31/2025 11:59 PM)'
      );
      return;
    }

    const endsAtIso = parsedDate.toISOString();

    try {
      const response = await fetch(`${API_BASE}/api/polls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          options: options.split(',').map((opt) => opt.trim()),
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
        setEndsAtInput('');
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
        placeholder="End Date (MM/DD/YYYY HH:MM AM/PM)"
        value={endsAtInput}
        onChangeText={setEndsAtInput}
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
