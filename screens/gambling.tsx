import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert, Image, Modal, TextInput } from 'react-native';
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

const API_URL = 'https://betsocial-fde6ef886274.herokuapp.com';

export default function Gambling() {
  const navigation = useNavigation<GamblingScreenNavigationProp>();
  const { user, refreshUser } = useUser();
  const { width } = useWindowDimensions();
  const isWide = width > 800;

  const [isOpening, setIsOpening] = useState(false);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentReward, setCurrentReward] = useState<FentReward | null>(null);
  const [currentWinAmount, setCurrentWinAmount] = useState(0);
  const [currentProfit, setCurrentProfit] = useState(0);

  // Game modals
  const [showCoinFlipModal, setShowCoinFlipModal] = useState(false);
  const [showDiceRollModal, setShowDiceRollModal] = useState(false);
  const [showSlotMachineModal, setShowSlotMachineModal] = useState(false);

  // Game states
  const [betAmount, setBetAmount] = useState('100');
  const [coinChoice, setCoinChoice] = useState<'heads' | 'tails'>('heads');
  const [coinResult, setCoinResult] = useState<string | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [slotReels, setSlotReels] = useState<string[]>(['', '', '']);
  const [isPlaying, setIsPlaying] = useState(false);

  const openLootBox = async (cost: number, boxType: string) => {
    if (!user || !user.id) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    const currentBalance = user.obrobucks || 0;
    if (currentBalance < cost) {
      Alert.alert('Insufficient Funds', `You need ${cost} ObroBucks but only have ${currentBalance}.`);
      return;
    }

    setIsOpening(true);
    
    try {
      let multiplier;
      let maxMultiplier;
      
      if (boxType === 'Bronze') {
        maxMultiplier = 2.5;
        multiplier = Math.random() * maxMultiplier;
      } else if (boxType === 'Silver') {
        maxMultiplier = 3.5;
        multiplier = Math.random() * maxMultiplier;
      } else if (boxType === 'Gold') {
        maxMultiplier = 5.0;
        multiplier = Math.random() * maxMultiplier;
      } else {
        multiplier = Math.random() * 3.0;
      }
      
      const winAmount = Math.round(cost * multiplier);
      
      const response = await fetch(`${API_URL}/api/gambling/open-lootbox`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          cost: cost,
          winAmount: winAmount
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to open loot box');
      }

      const profit = data.profit;
      setLastWin(profit);
      await refreshUser();

      if (winAmount === 0) {
        Alert.alert(
          '💔 Total Loss!',
          `You lost everything!\nCost: ${cost} ObroBucks\nWon: 0 ObroBucks\n\nNew balance: ${data.newBalance} ObroBucks`
        );
      } else if (profit > 0) {
        Alert.alert(
          '🎉 Winner!',
          `You won ${winAmount} ObroBucks!\nCost: ${cost} ObroBucks\nProfit: +${profit} ObroBucks\n\nNew balance: ${data.newBalance} ObroBucks`
        );
      } else {
        Alert.alert(
          '😢 Better luck next time!',
          `You won ${winAmount} ObroBucks.\nCost: ${cost} ObroBucks\nLoss: ${profit} ObroBucks\n\nNew balance: ${data.newBalance} ObroBucks`
        );
      }
      
    } catch (error: any) {
      console.error('Error opening loot box:', error);
      Alert.alert('Error', error.message || 'Failed to open loot box. Please try again.');
    } finally {
      setIsOpening(false);
    }
  };

  const playCoinFlip = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Please log in to play.');
      return;
    }

    const bet = parseInt(betAmount);
    if (isNaN(bet) || bet <= 0) {
      Alert.alert('Invalid Bet', 'Please enter a valid bet amount.');
      return;
    }

    if ((user.obrobucks || 0) < bet) {
      Alert.alert('Insufficient Funds', `You need ${bet} ObroBucks but only have ${user.obrobucks || 0}.`);
      return;
    }

    setIsPlaying(true);
    setCoinResult(null);

    try {
      const response = await fetch(`${API_URL}/api/gambling/coin-flip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          betAmount: bet,
          choice: coinChoice
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to play coin flip');
      }

      // Animate the flip
      setTimeout(() => {
        setCoinResult(data.result);
        setLastWin(data.profit);
        refreshUser();
        
        setTimeout(() => {
          Alert.alert(
            data.won ? '🎉 You Won!' : '😢 You Lost!',
            `The coin landed on: ${data.result.toUpperCase()}\n\nBet: ${bet} ObroBucks\nWon: ${data.winAmount} ObroBucks\nProfit: ${data.profit > 0 ? '+' : ''}${data.profit} ObroBucks\n\nNew balance: ${data.newBalance} ObroBucks`
          );
          setShowCoinFlipModal(false);
          setCoinResult(null);
        }, 1500);
      }, 1000);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to play coin flip.');
    } finally {
      setIsPlaying(false);
    }
  };

  const playDiceRoll = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Please log in to play.');
      return;
    }

    const bet = parseInt(betAmount);
    if (isNaN(bet) || bet <= 0) {
      Alert.alert('Invalid Bet', 'Please enter a valid bet amount.');
      return;
    }

    if ((user.obrobucks || 0) < bet) {
      Alert.alert('Insufficient Funds', `You need ${bet} ObroBucks but only have ${user.obrobucks || 0}.`);
      return;
    }

    setIsPlaying(true);
    setDiceResult(null);

    try {
      const response = await fetch(`${API_URL}/api/gambling/dice-roll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          betAmount: bet
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to play dice roll');
      }

      // Animate the roll
      setTimeout(() => {
        setDiceResult(data.diceResult);
        setLastWin(data.profit);
        refreshUser();
        
        setTimeout(() => {
          Alert.alert(
            data.won ? '🎉 You Won!' : '😢 You Lost!',
            `You rolled a: ${data.diceResult}\n${data.won ? 'Win on 4-6!' : 'Need 4-6 to win'}\n\nBet: ${bet} ObroBucks\nWon: ${data.winAmount} ObroBucks\nProfit: ${data.profit > 0 ? '+' : ''}${data.profit} ObroBucks\n\nNew balance: ${data.newBalance} ObroBucks`
          );
          setShowDiceRollModal(false);
          setDiceResult(null);
        }, 1500);
      }, 1000);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to play dice roll.');
    } finally {
      setIsPlaying(false);
    }
  };

  const playSlotMachine = async () => {
    if (!user || !user.id) {
      Alert.alert('Error', 'Please log in to play.');
      return;
    }

    const bet = parseInt(betAmount);
    if (isNaN(bet) || bet <= 0) {
      Alert.alert('Invalid Bet', 'Please enter a valid bet amount.');
      return;
    }

    if ((user.obrobucks || 0) < bet) {
      Alert.alert('Insufficient Funds', `You need ${bet} ObroBucks but only have ${user.obrobucks || 0}.`);
      return;
    }

    setIsPlaying(true);
    setSlotReels(['?', '?', '?']);

    try {
      const response = await fetch(`${API_URL}/api/gambling/slot-machine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          betAmount: bet
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to play slot machine');
      }

      // Animate the spin
      setTimeout(() => {
        const symbolEmojis: {[key: string]: string} = {
          'cherry': '🍒',
          'lemon': '🍋',
          'orange': '🍊',
          'diamond': '💎',
          'seven': '7️⃣'
        };
        
        const reelSymbols = data.reels.map((symbol: string) => symbolEmojis[symbol] || '❓');
        setSlotReels(reelSymbols);
        setLastWin(data.profit);
        refreshUser();
        
        setTimeout(() => {
          let resultMessage = '';
          if (data.resultType === 'jackpot') {
            resultMessage = '🎰 JACKPOT! 777!';
          } else if (data.resultType === 'big_win') {
            resultMessage = '💎 BIG WIN! Triple Diamonds!';
          } else if (data.resultType === 'triple_match') {
            resultMessage = '🎉 Triple Match!';
          } else if (data.resultType === 'double_match') {
            resultMessage = '👍 Double Match!';
          } else {
            resultMessage = '😢 No Match';
          }

          Alert.alert(
            resultMessage,
            `${reelSymbols.join(' ')}\n\nMultiplier: ${data.multiplier}x\nBet: ${bet} ObroBucks\nWon: ${data.winAmount} ObroBucks\nProfit: ${data.profit > 0 ? '+' : ''}${data.profit} ObroBucks\n\nNew balance: ${data.newBalance} ObroBucks`
          );
          setShowSlotMachineModal(false);
          setSlotReels(['', '', '']);
        }, 1500);
      }, 1500);

    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to play slot machine.');
    } finally {
      setIsPlaying(false);
    }
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
              <Text style={styles.boxDescription}>Win 0-250 ObroBucks</Text>
              <Text style={styles.boxCost}>Cost: 100 ObroBucks</Text>
              <TouchableOpacity
                style={[styles.openButton, styles.bronzeButton, isOpening && styles.buttonDisabled]}
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
              <Text style={styles.boxDescription}>Win 0-875 ObroBucks</Text>
              <Text style={styles.boxCost}>Cost: 250 ObroBucks</Text>
              <TouchableOpacity
                style={[styles.openButton, styles.silverButton, isOpening && styles.buttonDisabled]}
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
              <Text style={styles.boxDescription}>Win 0-2,500 ObroBucks</Text>
              <Text style={styles.boxCost}>Cost: 500 ObroBucks</Text>
              <TouchableOpacity
                style={[styles.openButton, styles.goldButton, isOpening && styles.buttonDisabled]}
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
            <TouchableOpacity style={styles.gameCard} onPress={() => setShowCoinFlipModal(true)}>
              <Text style={styles.gameEmoji}>🪙</Text>
              <Text style={styles.gameTitle}>Coin Flip</Text>
              <Text style={styles.gameDescription}>Double or nothing!</Text>
              <View style={styles.playBadge}>
                <Text style={styles.playText}>Play Now</Text>
              </View>
            </TouchableOpacity>

            {/* Dice Roll */}
            <TouchableOpacity style={styles.gameCard} onPress={() => setShowDiceRollModal(true)}>
              <Text style={styles.gameEmoji}>🎲</Text>
              <Text style={styles.gameTitle}>Dice Roll</Text>
              <Text style={styles.gameDescription}>Roll 4-6 to win!</Text>
              <View style={styles.playBadge}>
                <Text style={styles.playText}>Play Now</Text>
              </View>
            </TouchableOpacity>

            {/* Slots */}
            <TouchableOpacity style={styles.gameCard} onPress={() => setShowSlotMachineModal(true)}>
              <Text style={styles.gameEmoji}>🎰</Text>
              <Text style={styles.gameTitle}>Slot Machine</Text>
              <Text style={styles.gameDescription}>Match symbols to win!</Text>
              <View style={styles.playBadge}>
                <Text style={styles.playText}>Play Now</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How It Works</Text>
          <Text style={styles.infoText}>
            • Loot boxes: Random multiplier (0x-5x based on tier)
          </Text>
          <Text style={styles.infoText}>
            • Coin Flip: 50/50 chance to double your bet
          </Text>
          <Text style={styles.infoText}>
            • Dice Roll: Roll 4-6 to double your bet
          </Text>
          <Text style={styles.infoText}>
            • Slot Machine: Match symbols for big multipliers
          </Text>
          <Text style={styles.warningText}>
            ⚠️ Gamble responsibly! This is just for fun.
          </Text>
        </View>
      </View>

      {/* Coin Flip Modal */}
      <Modal
        visible={showCoinFlipModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCoinFlipModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.gameModalContent}>
            <Text style={styles.gameModalTitle}>🪙 Coin Flip</Text>
            <Text style={styles.gameModalSubtitle}>Choose heads or tails, then flip!</Text>
            
            {coinResult && (
              <View style={styles.coinDisplay}>
                <Text style={styles.coinResultText}>{coinResult.toUpperCase()}</Text>
              </View>
            )}
            
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={[styles.choiceButton, coinChoice === 'heads' && styles.choiceButtonSelected]}
                onPress={() => setCoinChoice('heads')}
              >
                <Text style={styles.choiceButtonText}>HEADS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceButton, coinChoice === 'tails' && styles.choiceButtonSelected]}
                onPress={() => setCoinChoice('tails')}
              >
                <Text style={styles.choiceButtonText}>TAILS</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.betInput}
              placeholder="Bet Amount"
              keyboardType="numeric"
              value={betAmount}
              onChangeText={setBetAmount}
            />
            
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.buttonDisabled]}
              onPress={playCoinFlip}
              disabled={isPlaying}
            >
              <Text style={styles.playButtonText}>{isPlaying ? 'Flipping...' : 'Flip Coin'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCoinFlipModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Dice Roll Modal */}
      <Modal
        visible={showDiceRollModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDiceRollModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.gameModalContent}>
            <Text style={styles.gameModalTitle}>🎲 Dice Roll</Text>
            <Text style={styles.gameModalSubtitle}>Roll 4, 5, or 6 to win!</Text>
            
            {diceResult && (
              <View style={styles.diceDisplay}>
                <Text style={styles.diceResultText}>{diceResult}</Text>
              </View>
            )}
            
            <TextInput
              style={styles.betInput}
              placeholder="Bet Amount"
              keyboardType="numeric"
              value={betAmount}
              onChangeText={setBetAmount}
            />
            
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.buttonDisabled]}
              onPress={playDiceRoll}
              disabled={isPlaying}
            >
              <Text style={styles.playButtonText}>{isPlaying ? 'Rolling...' : 'Roll Dice'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowDiceRollModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Slot Machine Modal */}
      <Modal
        visible={showSlotMachineModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSlotMachineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.gameModalContent}>
            <Text style={styles.gameModalTitle}>🎰 Slot Machine</Text>
            <Text style={styles.gameModalSubtitle}>Match 3 for big wins!</Text>
            
            <View style={styles.slotDisplay}>
              <View style={styles.slotReel}>
                <Text style={styles.slotSymbol}>{slotReels[0] || '❓'}</Text>
              </View>
              <View style={styles.slotReel}>
                <Text style={styles.slotSymbol}>{slotReels[1] || '❓'}</Text>
              </View>
              <View style={styles.slotReel}>
                <Text style={styles.slotSymbol}>{slotReels[2] || '❓'}</Text>
              </View>
            </View>
            
            <TextInput
              style={styles.betInput}
              placeholder="Bet Amount"
              keyboardType="numeric"
              value={betAmount}
              onChangeText={setBetAmount}
            />
            
            <TouchableOpacity
              style={[styles.playButton, isPlaying && styles.buttonDisabled]}
              onPress={playSlotMachine}
              disabled={isPlaying}
            >
              <Text style={styles.playButtonText}>{isPlaying ? 'Spinning...' : 'Spin!'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowSlotMachineModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
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
  buttonDisabled: {
    opacity: 0.5,
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
  playBadge: {
    backgroundColor: '#2ecc71',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  playText: {
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
  gameModalContent: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    maxWidth: 400,
    width: '100%',
  },
  gameModalTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  gameModalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  coinDisplay: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  coinResultText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  diceDisplay: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 3,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  diceResultText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#333',
  },
  slotDisplay: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  slotReel: {
    width: 80,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 3,
    borderColor: '#7C6FD8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotSymbol: {
    fontSize: 48,
  },
  choiceContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
  },
  choiceButtonSelected: {
    backgroundColor: '#7C6FD8',
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  betInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#7C6FD8',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  playButton: {
    width: '100%',
    backgroundColor: '#2ecc71',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
});