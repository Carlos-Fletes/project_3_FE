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
            <Ionicons name="wallet" size={14} color="#7C6FD8" style={styles.balanceIcon} />
            <Text style={styles.balanceText}>{user?.obrobucks || 0}</Text>
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
            <Ionicons name="person" size={16} color="#999" />
            <Text style={styles.inactiveTabText}>Profile</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.inactiveTab}
          onPress={() => navigation.navigate('Gambling')}>
          <View style={styles.tabContent}>
            <Text style={styles.inactiveTabText}>🎰 Casino</Text>
          </View>
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
                <Ionicons name="heart-outline" size={18} color="#999" />
                <Text style={styles.footerCount}>45</Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="chatbubble-outline" size={18} color="#999" />
                <Text style={styles.footerCount}>12</Text>
              </View>
              <View style={styles.footerItem}>
                <Ionicons name="share-outline" size={18} color="#999" />
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
    backgroundColor: '#f5f5f7',
  },
  content: {
    padding: 0,
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
  logoSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
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
  balanceIcon: {
    marginTop: 1,
  },
  balanceText: {
    fontWeight: '900',
    color: '#7C6FD8',
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
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileInitial: {
    color: '#7C6FD8',
    fontWeight: '900',
    fontSize: 16,
  },
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
  activeTabText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  inactiveTab: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  inactiveTabText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '600',
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
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#7C6FD8',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 16,
    color: '#333',
    letterSpacing: 0.3,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#7C6FD8',
  },
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
  newPollText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 0.5,
  },
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
  casinoButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  trendingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  link: {
    color: '#7C6FD8',
    fontWeight: '700',
    fontSize: 14,
  },
  trendingCount: {
    color: '#999',
    fontSize: 13,
    fontWeight: '600',
  },
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
    fontWeight: '900',
    fontSize: 16,
  },
  username: {
    fontWeight: '900',
    fontSize: 16,
    color: '#333',
  },
  handle: {
    color: '#999',
    fontSize: 13,
    fontWeight: '600',
  },
  moreButton: {
    fontSize: 24,
    color: '#999',
    fontWeight: '700',
  },
  pollQuestion: {
    fontSize: 17,
    marginBottom: 20,
    color: '#333',
    lineHeight: 24,
    fontWeight: '600',
  },
  pollOption: {
    marginBottom: 16,
    backgroundColor: '#f5f5f7',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  optionText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '600',
  },
  optionPercent: {
    fontWeight: '900',
    color: '#7C6FD8',
    fontSize: 15,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#7C6FD8',
    borderRadius: 4,
    marginBottom: 8,
  },
  betAmount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    fontWeight: '600',
  },
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
  yesButton: {
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  noButton: {
    backgroundColor: '#e74c3c',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#e74c3c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
  },
  potentialPayout: {
    fontSize: 13,
    color: '#999',
    marginBottom: 16,
    fontWeight: '600',
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerCount: {
    fontSize: 13,
    color: '#999',
    fontWeight: '600',
  },
  totalPool: {
    marginLeft: 'auto',
    color: '#2ecc71',
    fontWeight: '900',
    fontSize: 14,
  },
});