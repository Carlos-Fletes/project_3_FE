import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Alert, Modal, TextInput, LinearGradient } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useUser } from '../contexts/UserContext';

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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButtonContainer}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.logoSection}>
          <Text style={styles.logo}>🎰 CASINO</Text>
        </View>
        <View style={styles.balanceBox}>
          <Text style={styles.balanceLabel}>Balance</Text>
          <Text style={styles.balanceAmount}>{user?.obrobucks || 0}</Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Stats Banner */}
        <View style={styles.statsBanner}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user?.obrobucks || 0}</Text>
            <Text style={styles.statLabel}>Total Balance</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, lastWin !== null && (lastWin > 0 ? styles.statWin : styles.statLoss)]}>
              {lastWin !== null ? (lastWin > 0 ? `+${lastWin}` : lastWin) : '---'}
            </Text>
            <Text style={styles.statLabel}>Last Result</Text>
          </View>
        </View>

        {/* Loot Boxes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎁 MYSTERY BOXES</Text>
          
          <View style={[styles.boxesContainer, isWide && styles.boxesContainerWide]}>
            {/* Bronze Box */}
            <TouchableOpacity 
              style={[styles.lootBox, styles.bronzeBox]}
              onPress={() => openLootBox(100, 'Bronze')}
              disabled={isOpening}
              activeOpacity={0.8}
            >
              <View style={styles.boxHeader}>
                <Text style={styles.boxTier}>BRONZE</Text>
                <View style={styles.boxBadge}>
                  <Text style={styles.boxBadgeText}>0-2.5x</Text>
                </View>
              </View>
              <Text style={styles.boxEmoji}>📦</Text>
              <Text style={styles.boxPrize}>0 - 250</Text>
              <Text style={styles.boxPrizeLabel}>ObroBucks</Text>
              <View style={styles.boxCostContainer}>
                <Text style={styles.boxCostAmount}>100</Text>
                <Text style={styles.boxCostLabel}>to open</Text>
              </View>
              <View style={[styles.openButton, isOpening && styles.buttonDisabled]}>
                <Text style={styles.openButtonText}>{isOpening ? '...' : 'OPEN'}</Text>
              </View>
            </TouchableOpacity>

            {/* Silver Box */}
            <TouchableOpacity 
              style={[styles.lootBox, styles.silverBox]}
              onPress={() => openLootBox(250, 'Silver')}
              disabled={isOpening}
              activeOpacity={0.8}
            >
              <View style={styles.boxHeader}>
                <Text style={styles.boxTier}>SILVER</Text>
                <View style={[styles.boxBadge, styles.silverBadge]}>
                  <Text style={styles.boxBadgeText}>0-3.5x</Text>
                </View>
              </View>
              <Text style={styles.boxEmoji}>📦</Text>
              <Text style={styles.boxPrize}>0 - 875</Text>
              <Text style={styles.boxPrizeLabel}>ObroBucks</Text>
              <View style={styles.boxCostContainer}>
                <Text style={styles.boxCostAmount}>250</Text>
                <Text style={styles.boxCostLabel}>to open</Text>
              </View>
              <View style={[styles.openButton, isOpening && styles.buttonDisabled]}>
                <Text style={styles.openButtonText}>{isOpening ? '...' : 'OPEN'}</Text>
              </View>
            </TouchableOpacity>

            {/* Gold Box */}
            <TouchableOpacity 
              style={[styles.lootBox, styles.goldBox]}
              onPress={() => openLootBox(500, 'Gold')}
              disabled={isOpening}
              activeOpacity={0.8}
            >
              <View style={styles.boxHeader}>
                <Text style={styles.boxTier}>GOLD</Text>
                <View style={[styles.boxBadge, styles.goldBadge]}>
                  <Text style={styles.boxBadgeText}>0-5x</Text>
                </View>
              </View>
              <Text style={styles.boxEmoji}>📦</Text>
              <Text style={styles.boxPrize}>0 - 2,500</Text>
              <Text style={styles.boxPrizeLabel}>ObroBucks</Text>
              <View style={styles.boxCostContainer}>
                <Text style={styles.boxCostAmount}>500</Text>
                <Text style={styles.boxCostLabel}>to open</Text>
              </View>
              <View style={[styles.openButton, isOpening && styles.buttonDisabled]}>
                <Text style={styles.openButtonText}>{isOpening ? '...' : 'OPEN'}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Games Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎮 CLASSIC GAMES</Text>
          
          <View style={[styles.gamesContainer, isWide && styles.gamesContainerWide]}>
            {/* Coin Flip */}
            <TouchableOpacity 
              style={styles.gameCard} 
              onPress={() => setShowCoinFlipModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.gameEmoji}>🪙</Text>
              <Text style={styles.gameTitle}>COIN FLIP</Text>
              <Text style={styles.gameOdds}>50/50</Text>
              <Text style={styles.gameDescription}>Double or Nothing</Text>
            </TouchableOpacity>

            {/* Dice Roll */}
            <TouchableOpacity 
              style={styles.gameCard} 
              onPress={() => setShowDiceRollModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.gameEmoji}>🎲</Text>
              <Text style={styles.gameTitle}>DICE ROLL</Text>
              <Text style={styles.gameOdds}>50/50</Text>
              <Text style={styles.gameDescription}>Roll 4-6 to Win</Text>
            </TouchableOpacity>

            {/* Slots */}
            <TouchableOpacity 
              style={styles.gameCard} 
              onPress={() => setShowSlotMachineModal(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.gameEmoji}>🎰</Text>
              <Text style={styles.gameTitle}>SLOTS</Text>
              <Text style={styles.gameOdds}>UP TO 10x</Text>
              <Text style={styles.gameDescription}>Match & Win Big</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Modals remain the same */}
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
                <Text style={[styles.choiceButtonText, coinChoice === 'heads' && styles.choiceButtonTextSelected]}>HEADS</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceButton, coinChoice === 'tails' && styles.choiceButtonSelected]}
                onPress={() => setCoinChoice('tails')}
              >
                <Text style={[styles.choiceButtonText, coinChoice === 'tails' && styles.choiceButtonTextSelected]}>TAILS</Text>
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.betInput}
              placeholder="Bet Amount"
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
              placeholderTextColor="#999"
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  scrollView: {
    flex: 1,
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
  backButtonContainer: {
    padding: 8,
  },
  backButton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  logoSection: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
  },
  balanceBox: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 10,
    color: '#7C6FD8',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  balanceAmount: {
    fontSize: 18,
    color: '#7C6FD8',
    fontWeight: '900',
  },
  statsBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#7C6FD8',
    marginBottom: 4,
  },
  statWin: {
    color: '#2ecc71',
  },
  statLoss: {
    color: '#e74c3c',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7C6FD8',
    marginBottom: 16,
    letterSpacing: 1,
  },
  boxesContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  boxesContainerWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  lootBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
    minWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  bronzeBox: {
    borderTopWidth: 4,
    borderTopColor: '#CD7F32',
  },
  silverBox: {
    borderTopWidth: 4,
    borderTopColor: '#C0C0C0',
  },
  goldBox: {
    borderTopWidth: 4,
    borderTopColor: '#FFD700',
  },
  boxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  boxTier: {
    fontSize: 11,
    fontWeight: '900',
    color: '#7C6FD8',
    letterSpacing: 1,
  },
  boxBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  silverBadge: {
    backgroundColor: '#f5f5f5',
  },
  goldBadge: {
    backgroundColor: '#FFF8DC',
  },
  boxBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#666',
  },
  boxEmoji: {
    fontSize: 48,
    marginVertical: 8,
  },
  boxPrize: {
    fontSize: 22,
    fontWeight: '900',
    color: '#333',
    marginTop: 8,
  },
  boxPrizeLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
    marginBottom: 12,
  },
  boxCostContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  boxCostAmount: {
    fontSize: 18,
    fontWeight: '900',
    color: '#7C6FD8',
  },
  boxCostLabel: {
    fontSize: 10,
    color: '#999',
  },
  openButton: {
    backgroundColor: '#7C6FD8',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
  },
  openButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 14,
    letterSpacing: 1,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  gamesContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  gamesContainerWide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  gameCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    minWidth: 0,
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  gameEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  gameTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#333',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  gameOdds: {
    fontSize: 16,
    fontWeight: '900',
    color: '#7C6FD8',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
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
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  gameModalTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#7C6FD8',
    marginBottom: 8,
  },
  gameModalSubtitle: {
    fontSize: 14,
    color: '#999',
    marginBottom: 24,
    textAlign: 'center',
  },
  coinDisplay: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#7C6FD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 4,
    borderColor: '#fff',
  },
  coinResultText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
  },
  diceDisplay: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: '#7C6FD8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  diceResultText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#7C6FD8',
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
    backgroundColor: '#f5f5f7',
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
    width: '100%',
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#f5f5f7',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  choiceButtonSelected: {
    backgroundColor: '#7C6FD8',
    borderColor: '#7C6FD8',
  },
  choiceButtonText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#999',
  },
  choiceButtonTextSelected: {
    color: '#fff',
  },
  betInput: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#7C6FD8',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
    backgroundColor: '#f5f5f7',
    fontWeight: '700',
  },
  playButton: {
    width: '100%',
    backgroundColor: '#7C6FD8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#7C6FD8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  playButtonText: {
    color: '#fff',
    fontWeight: '900',
    fontSize: 16,
    letterSpacing: 1,
  },
  cancelButton: {
    width: '100%',
    paddingVertical: 12,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '600',
  },
});