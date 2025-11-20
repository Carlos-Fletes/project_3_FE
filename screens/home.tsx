import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  Gambling: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useUser();
  const { width } = useWindowDimensions();
  const isWide = width > 800;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>BetSocial</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.balanceBox}>
            <Ionicons name="wallet" size={14} color="#fff" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>{user?.obrobucks || 0} ObroBucks</Text>
          </View>
          <TouchableOpacity 
            style={styles.profileCircle}
            onPress={() => navigation.navigate('Profile')}>
            <Text style={styles.profileInitial}>
              {user?.first_name?.[0] || user?.name?.[0] || 'U'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.navTabs}>
        <TouchableOpacity style={styles.activeTab}>
          <View style={styles.tabContent}>
            <Ionicons name="home" size={16} color="#fff" />
            <Text style={styles.activeTabText}>Feed</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.inactiveTab}
          onPress={() => navigation.navigate('Profile')}>
          <View style={styles.tabContent}>
            <Ionicons name="person" size={16} color="#666" />
            <Text style={styles.inactiveTabText}>Profile</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.inactiveTab}
          onPress={() => navigation.navigate('Gambling')}>
          <Text style={styles.inactiveTabText}>🎰 Casino</Text>
        </TouchableOpacity>
      </View>

      {/* Main Layout */}
      <View style={[styles.mainLayout, isWide && styles.rowLayout]}>
        {/* Sidebar */}
        <View style={[styles.sidebar, isWide && styles.sidebarWide]}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create a Poll</Text>
            <TouchableOpacity style={styles.newPollButton}>
              <Text style={styles.newPollText}>+ New Poll</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Actions</Text>
            <TouchableOpacity 
              style={styles.casinoButton}
              onPress={() => navigation.navigate('Gambling')}>
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
          {/* First Poll Card */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>SC</Text>
                </View>
                <View>
                  <Text style={styles.username}>Sarah Chen</Text>
                  <Text style={styles.handle}>@sarahc_tech · 2h ago</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.moreButton}>⋯</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pollQuestion}>Will Bitcoin reach $70,000 by the end of this month? 🚀</Text>

            <View style={styles.pollOption}>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>Yes, it will!</Text>
                <Text style={styles.optionPercent}>63%</Text>
              </View>
              <View style={[styles.progressBar, { width: '63%' }]} />
              <Text style={styles.betAmount}>$2,463 bet</Text>
            </View>

            <View style={styles.pollOption}>
              <View style={styles.optionContent}>
                <Text style={styles.optionText}>No way</Text>
                <Text style={styles.optionPercent}>37%</Text>
              </View>
              <View style={[styles.progressBar, { width: '37%' }]} />
              <Text style={styles.betAmount}>$1,434 bet</Text>
            </View>

            <View style={styles.betSection}>
              <TextInput 
                style={styles.betInput}
                placeholder="Bet amount"
                placeholderTextColor="#999"
              />
              <TouchableOpacity style={styles.yesButton}>
                <Text style={styles.buttonText}>Bet YES</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.noButton}>
                <Text style={styles.buttonText}>Bet NO</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.potentialPayout}>Potential payout: $0</Text>

            <View style={styles.postFooter}>
              <View style={styles.footerItem}>
                <Ionicons name="heart-outline" size={18} color="#666" />
                <Text style={styles.footerCount}>45</Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="chatbubble-outline" size={18} color="#666" />
                <Text style={styles.footerCount}>12</Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="share-outline" size={18} color="#666" />
                <Text style={styles.footerCount}>8</Text>
              </View>
              <Text style={styles.totalPool}>Total Pool: $3,897</Text>
            </View>
          </View>

          {/* Second Poll Card */}
          <View style={styles.postCard}>
            <View style={styles.postHeader}>
              <View style={styles.userInfo}>
                <View style={[styles.avatar, styles.avatarOrange]}>
                  <Text style={styles.avatarText}>MR</Text>
                </View>
                <View>
                  <Text style={styles.username}>Mike Rodriguez</Text>
                  <Text style={styles.handle}>@mike_sports · 4h ago</Text>
                </View>
              </View>
              <TouchableOpacity>
                <Text style={styles.moreButton}>⋯</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.pollQuestion}>Superbowl this year? 🏈</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C6FD8',
  },
  content: {
    padding: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    color: '#7C6FD8',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  balanceBox: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  balanceIcon: {
    marginTop: 1,
  },
  balanceText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  navTabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 8,
  },
  activeTab: {
    backgroundColor: '#7C6FD8',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  activeTabText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  inactiveTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  inactiveTabText: {
    color: '#666',
    fontSize: 14,
  },
  mainLayout: {
    flexDirection: 'column',
    padding: 16,
  },
  rowLayout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  sidebar: {
    flex: 1,
    marginBottom: 20,
  },
  sidebarWide: {
    width: '22%',
    maxWidth: 280,
    marginRight: 16,
  },
  feed: {
    flex: 1,
  },
  feedWide: {
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#666',
  },
  statValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#7C6FD8',
  },
  newPollButton: {
    backgroundColor: '#7C6FD8',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  newPollText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  casinoButton: {
    backgroundColor: '#FFA500',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  casinoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  trendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  link: {
    color: '#7C6FD8',
    fontWeight: '600',
    fontSize: 14,
  },
  trendingCount: {
    color: '#999',
    fontSize: 13,
  },
  postCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#B8B8FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarOrange: {
    backgroundColor: '#FFB366',
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  handle: {
    color: '#999',
    fontSize: 13,
  },
  moreButton: {
    fontSize: 20,
    color: '#999',
  },
  pollQuestion: {
    fontSize: 16,
    marginBottom: 16,
    color: '#333',
    lineHeight: 22,
  },
  pollOption: {
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    position: 'relative',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  optionPercent: {
    fontWeight: 'bold',
    color: '#7C6FD8',
    fontSize: 14,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#7C6FD8',
    borderRadius: 3,
    marginBottom: 6,
  },
  betAmount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
  },
  betSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
    gap: 8,
  },
  betInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 10,
    borderRadius: 8,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  yesButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  noButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  potentialPayout: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerCount: {
    fontSize: 13,
    color: '#666',
  },
  totalPool: {
    marginLeft: 'auto',
    color: '#2ecc71',
    fontWeight: '600',
    fontSize: 14,
  },
});