import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert, Image, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';
import { getFentReward, getRarityColor, type FentReward } from '../utils/fentRarity';

type RootStackParamList = {
  SignIn: undefined;
  Home: undefined;
  Profile: undefined;
  Gambling: undefined;
};

type GamblingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Gambling'>;

export default function Gambling() {
  const navigation = useNavigation<GamblingScreenNavigationProp>();
  const { user } = useUser();
  const { width } = useWindowDimensions();
  const isWide = width > 800;

  const [isOpening, setIsOpening] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState<FentReward | null>(null);
  const [currentWinAmount, setCurrentWinAmount] = useState(0);
  const [currentProfit, setCurrentProfit] = useState(0);

  const openLootBox = (cost: number, boxType: string) => {
    console.log(`Attempting to open ${boxType} box with cost ${cost}`);
    console.log(`User ObroBucks: ${user?.obrobucks}`);
    
    if (!user || user.obrobucks < cost) {
      Alert.alert('Insufficient Funds', `You need ${cost} ObroBucks but only have ${user?.obrobucks || 0}!`);
      return;
    }

    setIsOpening(true);
    
    // fake "opening" animation for now
    setTimeout(() => {
      // get a random reward between 0.5x and 3x the cost
      const multiplier = Math.random() * 2.5 + 0.5;
      const winAmount = Math.round(cost * multiplier);
      const maxPossible = cost * 3; // Maximum possible is 3x the cost
      
      const profit = winAmount - cost;
      setLastWin(profit);
      setCurrentWinAmount(winAmount);
      setCurrentProfit(profit);
      
      // Get the fent reward based on winnings
      const reward = getFentReward(winAmount, maxPossible);
      setCurrentReward(reward);
      
      setIsOpening(false);
      setShowRewardModal(true);
    }, 1500);
  };

  const playCoinFlip = () => {
    Alert.alert(
      'Coin Flip',
      'Coming soon! This feature is under development.',
      [{ text: 'OK' }]
    );
  };

  const playDiceRoll = () => {
    Alert.alert(
      'Dice Roll',
      'Coming soon! This feature is under development.',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🎰 Casino</Text>
        </View>
        <View style={styles.balanceBox}>
          <Text style={styles.balanceText}>💰 {user?.obrobucks || 0} ObroBucks</Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={[styles.mainContent, isWide && styles.mainContentWide]}>
        {/* Banner */}
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>🎲 Try Your Luck!</Text>
          <Text style={styles.bannerSubtitle}>
            Open loot boxes or play games to win more ObroBucks
          </Text>
          {lastWin !== null && (
            <Text style={[styles.lastWinText, lastWin > 0 ? styles.profit : styles.loss]}>
              Last result: {lastWin > 0 ? '+' : ''}{lastWin} ObroBucks
            </Text>
          )}
        </View>

        {/* Loot Boxes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Loot Boxes</Text>
          
          <View style={[styles.boxesContainer, isWide && styles.boxesContainerWide]}>
            {/* Bronze Box */}
            <View style={styles.lootBox}>
              <View style={[styles.boxIcon, styles.bronzeBox]}>
                <Text style={styles.boxEmoji}>📦</Text>
              </View>
              <Text style={styles.boxTitle}>Bronze Box</Text>
              <Text style={styles.boxDescription}>Win 50-300 ObroBucks</Text>
              <Text style={styles.boxCost}>Cost: 100 ObroBucks</Text>
              <TouchableOpacity
                style={[styles.openButton, styles.bronzeButton]}
                onPress={() => openLootBox(100, 'Bronze')}
                disabled={isOpening}
              >
                <Text style={styles.buttonText}>
                  {isOpening ? 'Opening...' : 'Open Box'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Silver Box */}
            <View style={styles.lootBox}>
              <View style={[styles.boxIcon, styles.silverBox]}>
                <Text style={styles.boxEmoji}>📦</Text>
              </View>
              <Text style={styles.boxTitle}>Silver Box</Text>
              <Text style={styles.boxDescription}>Win 125-750 ObroBucks</Text>
              <Text style={styles.boxCost}>Cost: 250 ObroBucks</Text>
              <TouchableOpacity
                style={[styles.openButton, styles.silverButton]}
                onPress={() => openLootBox(250, 'Silver')}
                disabled={isOpening}
              >
                <Text style={styles.buttonText}>
                  {isOpening ? 'Opening...' : 'Open Box'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Gold Box */}
            <View style={styles.lootBox}>
              <View style={[styles.boxIcon, styles.goldBox]}>
                <Text style={styles.boxEmoji}>📦</Text>
              </View>
              <Text style={styles.boxTitle}>Gold Box</Text>
              <Text style={styles.boxDescription}>Win 250-1500 ObroBucks</Text>
              <Text style={styles.boxCost}>Cost: 500 ObroBucks</Text>
              <TouchableOpacity
                style={[styles.openButton, styles.goldButton]}
                onPress={() => openLootBox(500, 'Gold')}
                disabled={isOpening}
              >
                <Text style={styles.buttonText}>
                  {isOpening ? 'Opening...' : 'Open Box'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Games Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 Gambling Games</Text>
          
          <View style={[styles.gamesContainer, isWide && styles.gamesContainerWide]}>
            {/* Coin Flip */}
            <TouchableOpacity style={styles.gameCard} onPress={playCoinFlip}>
              <Text style={styles.gameEmoji}>🪙</Text>
              <Text style={styles.gameTitle}>Coin Flip</Text>
              <Text style={styles.gameDescription}>Double or nothing!</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </TouchableOpacity>

            {/* Dice Roll */}
            <TouchableOpacity style={styles.gameCard} onPress={playDiceRoll}>
              <Text style={styles.gameEmoji}>🎲</Text>
              <Text style={styles.gameTitle}>Dice Roll</Text>
              <Text style={styles.gameDescription}>Roll high to win big!</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </TouchableOpacity>

            {/* Slots */}
            <TouchableOpacity 
              style={styles.gameCard} 
              onPress={() => Alert.alert('Slots', 'Coming soon!')}
            >
              <Text style={styles.gameEmoji}>🎰</Text>
              <Text style={styles.gameTitle}>Slot Machine</Text>
              <Text style={styles.gameDescription}>Spin to win jackpots!</Text>
              <View style={styles.comingSoonBadge}>
                <Text style={styles.comingSoonText}>Coming Soon</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How It Works</Text>
          <Text style={styles.infoText}>
            • Open loot boxes for a chance to multiply your ObroBucks
          </Text>
          <Text style={styles.infoText}>
            • Each box has different risk/reward ratios
          </Text>
          <Text style={styles.infoText}>
            • More games coming soon!
          </Text>
          <Text style={styles.warningText}>
            ⚠️ Gamble responsibly! This is just for fun.
          </Text>
        </View>
      </View>

      {/* Reward Modal */}
      <Modal
        visible={showRewardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowRewardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {currentReward && (
              <>
                <Text style={styles.modalTitle}>
                  {currentProfit > 0 ? '🎉 Congratulations!' : '😢 Better luck next time!'}
                </Text>
                
                {/* Fent Image */}
                <View style={[styles.fentImageContainer, { borderColor: getRarityColor(currentReward.rarity) }]}>
                  <Image 
                    source={currentReward.imageSource} 
                    style={styles.fentImage}
                    resizeMode="contain"
                  />
                </View>
                
                {/* Rarity Badge */}
                <View style={[styles.rarityBadge, { backgroundColor: getRarityColor(currentReward.rarity) }]}>
                  <Text style={styles.rarityText}>{currentReward.rarity} (Tier {currentReward.tier})</Text>
                </View>
                
                {/* Message */}
                <Text style={styles.rewardMessage}>{currentReward.message}</Text>
                
                {/* Winnings Info */}
                <View style={styles.winningsInfo}>
                  <Text style={styles.winningsLabel}>You won:</Text>
                  <Text style={styles.winningsAmount}>{currentWinAmount} ObroBucks</Text>
                  <Text style={[styles.profitText, currentProfit > 0 ? styles.profitPositive : styles.profitNegative]}>
                    {currentProfit > 0 ? '+' : ''}{currentProfit} ObroBucks
                  </Text>
                </View>
                
                {/* Close Button */}
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowRewardModal(false)}
                >
                  <Text style={styles.closeButtonText}>Awesome!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#7C6FD8',
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  backButton: {
    color: '#7C6FD8',
    fontSize: 16,
    fontWeight: '600',
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    color: '#7C6FD8',
    fontSize: 22,
    fontWeight: 'bold',
  },
  balanceBox: {
    backgroundColor: '#FFA500',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  balanceText: {
    fontWeight: 'bold',
    color: '#fff',
    fontSize: 14,
  },
  mainContent: {
    padding: 16,
  },
  mainContentWide: {
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  banner: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  lastWinText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
  },
  profit: {
    color: '#2ecc71',
  },
  loss: {
    color: '#e74c3c',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  boxesContainer: {
    gap: 16,
  },
  boxesContainerWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  lootBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  boxIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  boxEmoji: {
    fontSize: 40,
  },
  bronzeBox: {
    backgroundColor: '#CD7F32',
  },
  silverBox: {
    backgroundColor: '#C0C0C0',
  },
  goldBox: {
    backgroundColor: '#FFD700',
  },
  boxTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  boxDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  boxCost: {
    fontSize: 14,
    color: '#7C6FD8',
    fontWeight: '600',
    marginBottom: 16,
  },
  openButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  bronzeButton: {
    backgroundColor: '#CD7F32',
  },
  silverButton: {
    backgroundColor: '#C0C0C0',
  },
  goldButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  gamesContainer: {
    gap: 16,
  },
  gamesContainerWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gameCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  gameEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  comingSoonBadge: {
    backgroundColor: '#7C6FD8',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
  warningText: {
    fontSize: 13,
    color: '#e74c3c',
    marginTop: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  fentImageContainer: {
    width: 280,
    height: 280,
    borderRadius: 16,
    borderWidth: 4,
    padding: 8,
    backgroundColor: '#f8f9fa',
    marginBottom: 16,
    overflow: 'hidden',
  },
  fentImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
  rarityBadge: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginBottom: 12,
  },
  rarityText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  rewardMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  winningsInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    width: '100%',
  },
  winningsLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  winningsAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  profitText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profitPositive: {
    color: '#2ecc71',
  },
  profitNegative: {
    color: '#e74c3c',
  },
  closeButton: {
    backgroundColor: '#7C6FD8',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});