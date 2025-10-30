import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export default function Home() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Welcome to BetSocial 🎯</Text>
      <Text style={styles.subtitle}>Bet your reputation. Predict the future.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create a Poll</Text>
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>+ New Poll</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Your Stats</Text>
        <Text style={styles.text}>Active Bets: 3</Text>
        <Text style={styles.text}>Clout: 💰 450</Text>
        <Text style={styles.text}>Win Rate: 68%</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Trending Topics</Text>
        <Text style={styles.text}>#TechStocks (234 bets)</Text>
        <Text style={styles.text}>#SportsPredict (189 bets)</Text>
        <Text style={styles.text}>#WeatherBets (156 bets)</Text>
      </View>

      <Text style={styles.footer}>More features coming soon 🚀</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ECE9FF',
    alignItems: 'center',
    paddingVertical: 50,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#4B3EFF',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 15,
    color: '#444',
    marginBottom: 4,
  },
  button: {
    backgroundColor: '#6B4EFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  footer: {
    marginTop: 30,
    fontSize: 14,
    color: '#777',
  },
});
