import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  Gambling: undefined;
  CreatePoll: undefined;
};

export type PollStatus = 'PENDING' | 'ACTIVE' | 'CLOSED';

export type Poll = {
  id: number;
  question: string;
  status: PollStatus;
  category: string | null;
  total_bets: number;
  created_at: string;
  ends_at: string | null;
  options: string[];
  created_by: string | null;
  created_by_username?: string | null;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;

const API_BASE = 'https://betsocial-fde6ef886274.herokuapp.com';

// Timer Component
function PollTimer({ endsAt }: { endsAt: string | null }) {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!endsAt) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const end = new Date(endsAt).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Poll Ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h remaining`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m remaining`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s remaining`);
      } else {
        setTimeLeft(`${seconds}s remaining`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endsAt]);

  if (!endsAt) return null;

  return (
    <View style={styles.timerContainer}>
      <Ionicons name="time-outline" size={14} color="#666" />
      <Text style={styles.timerText}>{timeLeft}</Text>
    </View>
  );
}

type PollCardProps = { 
  poll: Poll;
  onBetPlaced: () => void;
  onPollDeleted: () => void;
};

function PollCard({ poll, onBetPlaced, onPollDeleted }: PollCardProps) {
  const { user, refreshUser } = useUser();
  const [betAmount, setBetAmount] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pollStats, setPollStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  // Fetch poll betting stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/betting/stats/${poll.id}`);
        const data = await res.json();
        setPollStats(data);
      } catch (e) {
        console.error('Error fetching poll stats:', e);
      }
    };
    fetchStats();
  }, [poll.id]);

  // Fetch winner if poll is closed
  useEffect(() => {
    const fetchWinner = async () => {
      if (poll.status === 'CLOSED') {
        try {
          const res = await fetch(`${API_BASE}/api/polls/${poll.id}/winner`);
          const data = await res.json();
          setWinner(data);
        } catch (e) {
          console.error('Error fetching winner:', e);
        }
      }
    };
    fetchWinner();
  }, [poll.id, poll.status]);

  const placeBet = async (option: string) => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Please log in to place a bet.');
      return;
    }

    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid bet amount.');
      return;
    }

    if ((user.obrobucks || 0) < amount) {
      Alert.alert('Insufficient Funds', `You need ${amount} ObroBucks but only have ${user.obrobucks || 0}.`);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/betting/place`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          pollId: poll.id,
          optionText: option,
          amount: amount
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place bet');
      }

      setBetAmount('');
      setSelectedOption(null);
      await refreshUser();
      onBetPlaced();

      Alert.alert(
        '🎉 Bet Placed!',
        `You bet ${amount} ObroBucks on "${option}"\n\nPotential Payout: ${data.potentialPayout} ObroBucks\nNew Balance: ${data.newBalance} ObroBucks`
      );

    } catch (error: any) {
      console.error('Error placing bet:', error);
      Alert.alert('Error', error.message || 'Failed to place bet.');
    } finally {
      setLoading(false);
    }
  };

  const resolvePoll = async () => {
    if (!selectedOption) {
      Alert.alert('Select Winner', 'Please select the winning option first.');
      return;
    }

    Alert.alert(
      'Confirm Winner',
      `Declare "${selectedOption}" as the winner? This will close the poll and pay out winners.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/api/polls/${poll.id}/resolve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ winningOption: selectedOption })
              });

              const data = await response.json();

              if (!response.ok) {
                throw new Error(data.error || 'Failed to resolve poll');
              }

              Alert.alert(
                '✅ Poll Resolved!',
                `Winner: ${selectedOption}\nWinners paid: ${data.winnersCount}\nTotal payout: ${data.totalPaidOut} ObroBucks`
              );

              onBetPlaced(); // Refresh polls

            } catch (error: any) {
              console.error('Error resolving poll:', error);
              Alert.alert('Error', error.message || 'Failed to resolve poll.');
            }
          }
        }
      ]
    );
  };

  const deletePoll = async () => {
    Alert.alert(
      'Delete Poll',
      'Are you sure you want to delete this poll? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE}/api/polls/${poll.id}`, {
                method: 'DELETE'
              });

              if (!response.ok) {
                throw new Error('Failed to delete poll');
              }

              Alert.alert('Success', 'Poll deleted successfully');
              onPollDeleted();

            } catch (error: any) {
              console.error('Error deleting poll:', error);
              Alert.alert('Error', error.message || 'Failed to delete poll.');
            }
          }
        }
      ]
    );
  };

  const calculatePotentialPayout = (option: string) => {
    if (!pollStats || !betAmount) return 0;
    
    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) return 0;

    return amount * 2;
  };

  const displayName = poll.created_by_username || 'Anonymous';
  const handle =
    poll.created_by_username != null
      ? `@${poll.created_by_username}`
      : `Poll #${poll.id}`;
  const initials =
    displayName
      .split(' ')
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .join('')
      .slice(0, 2) || 'U';

  const isCreator = user?.id === poll.created_by;
  const isClosed = poll.status === 'CLOSED';

  return (
    <View style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View>
            <Text style={styles.username}>{displayName}</Text>
            <Text style={styles.handle}>{handle} · just now</Text>
          </View>
        </View>
        
        {isCreator && (
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <Text style={styles.moreButton}>⋯</Text>
          </TouchableOpacity>
        )}
        
        {showMenu && isCreator && (
          <View style={styles.menuDropdown}>
            {!isClosed && (
              <TouchableOpacity style={styles.menuItem} onPress={resolvePoll}>
                <Ionicons name="checkmark-circle-outline" size={18} color="#2ecc71" />
                <Text style={styles.menuText}>Resolve Poll</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.menuItem} onPress={deletePoll}>
              <Ionicons name="trash-outline" size={18} color="#e74c3c" />
              <Text style={[styles.menuText, { color: '#e74c3c' }]}>Delete Poll</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <Text style={styles.pollQuestion}>{poll.question}</Text>

      {/* Poll Timer */}
      <PollTimer endsAt={poll.ends_at} />

      {/* Closed Poll Banner */}
      {isClosed && winner?.resolved && (
        <View style={styles.closedBanner}>
          <Ionicons name="trophy" size={16} color="#FFD700" />
          <Text style={styles.closedText}>Winner: {winner.winningOption}</Text>
        </View>
      )}

      {poll.options.map((opt, idx) => {
        const optStats = pollStats?.optionStats?.[opt];
        const percentage = optStats?.percentage || 0;
        const totalBet = optStats?.total || 0;
        const isSelected = selectedOption === opt;
        const isWinningOption = isClosed && winner?.winningOption === opt;

        return (
          <TouchableOpacity
            key={idx}
            style={[
              styles.pollOption,
              isSelected && styles.pollOptionSelected,
              isWinningOption && styles.pollOptionWinner
            ]}
            onPress={() => !isClosed && setSelectedOption(opt)}
            activeOpacity={0.7}
            disabled={isClosed}
          >
            <View style={styles.optionContent}>
              <Text style={styles.optionText}>
                {opt} {isWinningOption && '🏆'}
              </Text>
              <Text style={styles.optionPercent}>{percentage.toFixed(1)}%</Text>
            </View>
            <View style={[styles.progressBar, { width: `${percentage}%` }]} />
            <Text style={styles.betAmount}>${totalBet} bet</Text>
          </TouchableOpacity>
        );
      })}

      {!isClosed && (
        <>
          <View style={styles.betSection}>
            <TextInput
              style={styles.betInput}
              placeholder="Bet amount"
              placeholderTextColor="#999"
              keyboardType="numeric"
              value={betAmount}
              onChangeText={setBetAmount}
            />
            <TouchableOpacity
              style={[styles.placeBetButton, (!selectedOption || loading) && styles.buttonDisabled]}
              onPress={() => selectedOption && placeBet(selectedOption)}
              disabled={!selectedOption || loading}
            >
              <Text style={styles.buttonText}>{loading ? 'Placing...' : 'Place Bet'}</Text>
            </TouchableOpacity>
          </View>

          {selectedOption && betAmount && (
            <Text style={styles.potentialPayout}>
              Potential payout: {calculatePotentialPayout(selectedOption)} ObroBucks
            </Text>
          )}
        </>
      )}

      <View style={styles.postFooter}>
        <View style={styles.footerItem}>
          <Ionicons name="heart-outline" size={18} color="#999" />
          <Text style={styles.footerCount}>0</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="chatbubble-outline" size={18} color="#999" />
          <Text style={styles.footerCount}>0</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="share-outline" size={18} color="#999" />
          <Text style={styles.footerCount}>0</Text>
        </View>
        <Text style={styles.totalPool}>Total Pool: ${poll.total_bets}</Text>
      </View>
    </View>
  );
}

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useUser();
  const { width } = useWindowDimensions();
  const isWide = width > 800;

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loadingPolls, setLoadingPolls] = useState(false);

  const loadPolls = async () => {
    try {
      setLoadingPolls(true);
      const res = await fetch(`${API_BASE}/api/polls`);
      const data: Poll[] = await res.json();
      setPolls(data);
    } catch (e) {
      console.error('Error loading polls', e);
    } finally {
      setLoadingPolls(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header - same as before */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>BetSocial</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.balanceBox}>
            <Ionicons name="wallet" size={14} color="#7C6FD8" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>{user?.obrobucks || 0}</Text>
          </View>
          <TouchableOpacity style={styles.profileCircle} onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileInitial}>
              {user?.first_name?.[0] || user?.name?.[0] || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs - same as before */}
      <View style={styles.navTabs}>
        <TouchableOpacity style={styles.activeTab}>
          <View style={styles.tabContent}>
            <Ionicons name="home" size={16} color="#fff" />
            <Text style={styles.activeTabText}>Feed</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab} onPress={() => navigation.navigate('Profile')}>
          <View style={styles.tabContent}>
            <Ionicons name="person" size={16} color="#999" />
            <Text style={styles.inactiveTabText}>Profile</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity style={styles.inactiveTab} onPress={() => navigation.navigate('Gambling')}>
          <View style={styles.tabContent}>
            <Text style={styles.inactiveTabText}>🎰 Casino</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Main Layout - same as before with sidebar */}
      <View style={[styles.mainLayout, isWide && styles.rowLayout]}>
        <View style={[styles.sidebar, isWide && styles.sidebarWide]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create a Poll</Text>
            <TouchableOpacity style={styles.newPollButton} onPress={() => navigation.navigate('CreatePoll')}>
              <Text style={styles.newPollText}>+ New Poll</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <TouchableOpacity style={styles.casinoButton} onPress={() => navigation.navigate('Gambling')}>
              <Text style={styles.casinoButtonText}>🎰 Visit Casino</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Your Stats</Text>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Active Bets</Text>
              <Text style={styles.statValue}>3</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Total Winnings</Text>
              <Text style={styles.statValue}>/C/450</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Win Rate</Text>
              <Text style={styles.statValue}>68%</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Trending Topics</Text>
            <View style={styles.trendingRow}>
              <Text style={styles.link}>#TechStocks</Text>
              <Text style={styles.trendingCount}>234 bets</Text>
            </View>
            <View style={styles.trendingRow}>
              <Text style={styles.link}>#SportsPredict</Text>
              <Text style={styles.trendingCount}>189 bets</Text>
            </View>
            <View style={styles.trendingRow}>
              <Text style={styles.link}>#WeatherBets</Text>
              <Text style={styles.trendingCount}>156 bets</Text>
            </View>
          </View>
        </View>

        {/* Feed */}
        <View style={[styles.feed, isWide && styles.feedWide]}>
          {loadingPolls && <Text style={{ color: '#666', marginBottom: 12 }}>Loading polls…</Text>}
          {!loadingPolls && polls.length === 0 && (
            <Text style={{ color: '#666', marginBottom: 12 }}>No polls yet. Create one!</Text>
          )}
          {!loadingPolls && polls.map((poll) => (
            <PollCard key={poll.id} poll={poll} onBetPlaced={loadPolls} onPollDeleted={loadPolls} />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... keep all your existing styles from before ...
  container: { flex: 1, backgroundColor: '#f5f5f7' },
  content: { padding: 0 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 50,
    backgroundColor: '#7C6FD8',
  },
  logoSection: { flexDirection: 'row', alignItems: 'center' },
  logo: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 0.5 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  balanceBox: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  balanceIcon: { marginTop: 1 },
  balanceText: { fontWeight: '900', color: '#7C6FD8', fontSize: 14 },
  tabContent: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: { color: '#7C6FD8', fontWeight: '900', fontSize: 16 },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
    paddingBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#7C6FD8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  activeTabText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  inactiveTab: { paddingVertical: 10, paddingHorizontal: 20 },
  inactiveTabText: { color: '#999', fontSize: 14, fontWeight: '600' },
  mainLayout: { flexDirection: 'column', padding: 16 },
  rowLayout: { flexDirection: 'row', alignItems: 'flex-start' },
  sidebar: { flex: 1, marginBottom: 20 },
  sidebarWide: { width: '22%', maxWidth: 280, marginRight: 16 },
  feed: { flex: 1 },
  feedWide: { flex: 1 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#7C6FD8',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '900', marginBottom: 16, color: '#333', letterSpacing: 0.3 },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  statValue: { fontSize: 14, fontWeight: '900', color: '#7C6FD8' },
  newPollButton: {
    backgroundColor: '#7C6FD8',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  newPollText: { color: '#fff', fontWeight: '900', fontSize: 14, letterSpacing: 0.5 },
  casinoButton: {
    backgroundColor: '#FFA500',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  casinoButtonText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  trendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  link: { color: '#7C6FD8', fontWeight: '700', fontSize: 14 },
  trendingCount: { color: '#999', fontSize: 13, fontWeight: '600' },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#7C6FD8',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B8B8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOrange: { backgroundColor: '#FFB366' },
  avatarText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  username: { fontWeight: '900', fontSize: 16, color: '#333' },
  handle: { color: '#999', fontSize: 13, fontWeight: '600' },
  moreButton: { fontSize: 24, color: '#999', fontWeight: '700' },
  
  // NEW STYLES for timer, menu, and winner
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#f5f5f7',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  menuDropdown: {
    position: 'absolute',
    right: 0,
    top: 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 160,
    zIndex: 1000,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  closedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FFF8DC',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  closedText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#B8860B',
  },
  
  pollQuestion: { fontSize: 17, marginBottom: 20, color: '#333', lineHeight: 24, fontWeight: '600' },
  pollOption: {
    marginBottom: 16,
    backgroundColor: '#f5f5f7',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pollOptionSelected: { borderColor: '#7C6FD8', backgroundColor: '#f0f0ff' },
  pollOptionWinner: { borderColor: '#FFD700', backgroundColor: '#FFFACD' },
  optionContent: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  optionText: { fontSize: 15, color: '#333', fontWeight: '600' },
  optionPercent: { fontWeight: '900', color: '#7C6FD8', fontSize: 15 },
  progressBar: { height: 8, backgroundColor: '#7C6FD8', borderRadius: 4, marginBottom: 8 },
  betAmount: { fontSize: 12, color: '#999', textAlign: 'right', fontWeight: '600' },
  betSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    gap: 10,
  },
  betInput: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    fontWeight: '600',
  },
  placeBetButton: {
    backgroundColor: '#7C6FD8',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: { opacity: 0.4 },
  buttonText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  potentialPayout: { fontSize: 14, color: '#2ecc71', marginBottom: 16, fontWeight: '900' },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  footerCount: { fontSize: 13, color: '#999', fontWeight: '600' },
  totalPool: { marginLeft: 'auto', color: '#2ecc71', fontWeight: '900', fontSize: 14 },
});