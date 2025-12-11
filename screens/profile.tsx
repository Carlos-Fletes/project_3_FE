import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  EditProfile: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Profile'
>;

const API_BASE = 'https://betsocial-fde6ef886274.herokuapp.com';

type Bet = {
  id: number;
  pollId: number;
  optionText: string;
  amount: number;
  potentialPayout: number;
  createdAt: string;
  isWinner: boolean | null;
  pollQuestion: string;
  pollStatus: string;
  pollEndsAt: string | null;
};


export default function Profile() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, logout } = useUser();
  const [bets, setBets] = useState<Bet[]>([]);
  const [loadingBets, setLoadingBets] = useState(false);

  useEffect(() => {
    const loadBets = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingBets(true);
        const res = await fetch(`${API_BASE}/api/betting/user/${user.id}`);
        const data = await res.json();
        setBets(data);
      } catch (e) {
        console.error('Error loading bets:', e);
      } finally {
        setLoadingBets(false);
      }
    };

    loadBets();
  }, [user?.id]);

  const handleLogout = async () => {
    try {
      await logout();
      navigation.reset({
        index: 0,
        routes: [{ name: 'SignIn' }],
      });
    } catch (error) {
      console.log('Error logging out:', error);
    }
  };

  const activeBets = bets.filter(bet => bet.pollStatus !== 'CLOSED');
  const completedBets = bets.filter(bet => bet.pollStatus === 'CLOSED');
  const wonBets = completedBets.filter(bet => bet.isWinner === true);
  const lostBets = completedBets.filter(bet => bet.isWinner === false);

  const totalWinnings = wonBets.reduce((sum, bet) => sum + (bet.potentialPayout || 0), 0);
  const totalLosses = lostBets.reduce((sum, bet) => sum + bet.amount, 0);
  const netProfit = totalWinnings - totalLosses;
  const handleDeleteAccount = () => {
    if (!user) return;

    Alert.alert(
      'Delete Account',
      'This will permanently delete your account and data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(
                `${API_BASE_URL}/api/users/${user.id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );

              if (!res.ok) {
                console.log('Delete failed with status', res.status);
                Alert.alert('Error', 'Could not delete your account.');
                return;
              }

              await logout();

              navigation.reset({
                index: 0,
                routes: [{ name: 'SignIn' }],
              });
            } catch (error) {
              console.log('Error deleting account:', error);
              Alert.alert(
                'Error',
                'Something went wrong deleting your account.'
              );
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Home')}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri:
                user?.profile_picture_url ||
                'https://cdn-icons-png.flaticon.com/512/847/847969.png',
            }}
            style={styles.avatar}
          />
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
          </View>
        </View>

        <Text style={styles.name}>{user?.name || 'Loading...'}</Text>
        <Text style={styles.username}>@{user?.username || 'loading'}</Text>

        {/* Bio */}
        {user?.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="wallet" size={24} color="#7C6FD8" />
          </View>
          <Text style={styles.statValue}>{user?.obrobucks || 0}</Text>
          <Text style={styles.statLabel}>ObroBucks</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="trending-up" size={24} color="#2ecc71" />
          </View>
          <Text style={[styles.statValue, netProfit >= 0 ? { color: '#2ecc71' } : { color: '#e74c3c' }]}>
            {netProfit >= 0 ? '+' : ''}{netProfit}
          </Text>
          <Text style={styles.statLabel}>Net Profit</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIconContainer}>
            <Ionicons name="stats-chart" size={24} color="#FFA500" />
          </View>
          <Text style={styles.statValue}>{bets.length}</Text>
          <Text style={styles.statLabel}>Total Bets</Text>
        </View>
      </View>

      {/* Bet History Section */}
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>📊 Bet History</Text>

        {loadingBets && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#7C6FD8" />
          </View>
        )}

        {!loadingBets && bets.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="newspaper-outline" size={48} color="#999" />
            <Text style={styles.emptyText}>No bets yet</Text>
            <Text style={styles.emptySubtext}>Place your first bet to see it here!</Text>
          </View>
        )}

        {!loadingBets && activeBets.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Active Bets ({activeBets.length})</Text>
            {activeBets.map((bet) => (
              <View key={bet.id} style={styles.betCard}>
                <View style={styles.betHeader}>
                  <View style={[styles.betStatusBadge, styles.betStatusActive]}>
                    <Text style={styles.betStatusText}>ACTIVE</Text>
                  </View>
                  <Text style={styles.betDate}>{new Date(bet.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.betQuestion}>{bet.pollQuestion}</Text>
                <View style={styles.betDetails}>
                  <View style={styles.betDetailRow}>
                    <Text style={styles.betDetailLabel}>Your Pick:</Text>
                    <Text style={styles.betDetailValue}>{bet.optionText}</Text>
                  </View>
                  <View style={styles.betDetailRow}>
                    <Text style={styles.betDetailLabel}>Bet Amount:</Text>
                    <Text style={styles.betDetailValue}>{bet.amount} ObroBucks</Text>
                  </View>
                  <View style={styles.betDetailRow}>
                    <Text style={styles.betDetailLabel}>Potential Win:</Text>
                    <Text style={[styles.betDetailValue, { color: '#2ecc71' }]}>
                      {bet.potentialPayout} ObroBucks
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}

        {!loadingBets && completedBets.length > 0 && (
          <>
            <Text style={styles.subsectionTitle}>Completed Bets ({completedBets.length})</Text>
            {completedBets.map((bet) => (
              <View key={bet.id} style={styles.betCard}>
                <View style={styles.betHeader}>
                  <View style={[
                    styles.betStatusBadge,
                    bet.isWinner ? styles.betStatusWon : styles.betStatusLost
                  ]}>
                    <Text style={styles.betStatusText}>
                      {bet.isWinner ? '🏆 WON' : '❌ LOST'}
                    </Text>
                  </View>
                  <Text style={styles.betDate}>{new Date(bet.createdAt).toLocaleDateString()}</Text>
                </View>
                <Text style={styles.betQuestion}>{bet.pollQuestion}</Text>
                <View style={styles.betDetails}>
                  <View style={styles.betDetailRow}>
                    <Text style={styles.betDetailLabel}>Your Pick:</Text>
                    <Text style={styles.betDetailValue}>{bet.optionText}</Text>
                  </View>
                  <View style={styles.betDetailRow}>
                    <Text style={styles.betDetailLabel}>Bet Amount:</Text>
                    <Text style={styles.betDetailValue}>{bet.amount} ObroBucks</Text>
                  </View>
                  <View style={styles.betDetailRow}>
                    <Text style={styles.betDetailLabel}>
                      {bet.isWinner ? 'Won:' : 'Lost:'}
                    </Text>
                    <Text style={[
                      styles.betDetailValue,
                      { color: bet.isWinner ? '#2ecc71' : '#e74c3c', fontWeight: '900' }
                    ]}>
                      {bet.isWinner ? `+${bet.potentialPayout}` : `-${bet.amount}`} ObroBucks
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Edit Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={handleDeleteAccount}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Delete Account</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    backgroundColor: '#7C6FD8',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 40,
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 24,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#7C6FD8',
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2ecc71',
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  username: {
    color: '#999',
    fontSize: 16,
    marginBottom: 16,
    fontWeight: '600',
  },
  bio: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f5f5f7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#333',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  betCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  betHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  betStatusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  betStatusActive: {
    backgroundColor: '#E3F2FD',
  },
  betStatusWon: {
    backgroundColor: '#E8F5E9',
  },
  betStatusLost: {
    backgroundColor: '#FFEBEE',
  },
  betStatusText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#333',
  },
  betDate: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  betQuestion: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  betDetails: {
    gap: 8,
  },
  betDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  betDetailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  betDetailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '700',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    marginTop: 32,
    gap: 12,
  },
  button: {
    backgroundColor: '#7C6FD8',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    shadowColor: '#e74c3c',
  },
  deleteButton: {
    backgroundColor: '#c0392b', // slightly deeper red than logout
    shadowColor: '#c0392b',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});
