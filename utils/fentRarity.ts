// Fent rarity system for loot box rewards

export interface FentReward {
  imageSource: any;
  rarity: string;
  message: string;
  tier: number;
}

// Import all fent images
const fentImages = {
  1: require('../assets/fent/1.png'),
  2: require('../assets/fent/2.png'),
  3: require('../assets/fent/3.png'),
  4: require('../assets/fent/4.png'),
  5: require('../assets/fent/5.png'),
  6: require('../assets/fent/6.png'),
  7: require('../assets/fent/7.png'),
  8: require('../assets/fent/8.webp'),
  9: require('../assets/fent/9.png'),
  10: require('../assets/fent/10.jpg'),
};

const rarityTiers = [
  { tier: 1, maxPercent: 10, rarity: 'Common', message: 'Better luck next time!' },
  { tier: 2, maxPercent: 20, rarity: 'Common', message: 'Not bad, but not great!' },
  { tier: 3, maxPercent: 30, rarity: 'Uncommon', message: 'Getting warmer!' },
  { tier: 4, maxPercent: 40, rarity: 'Uncommon', message: 'Decent pull!' },
  { tier: 5, maxPercent: 50, rarity: 'Rare', message: 'Nice! Above average!' },
  { tier: 6, maxPercent: 60, rarity: 'Rare', message: 'Great pull!' },
  { tier: 7, maxPercent: 70, rarity: 'Epic', message: 'Excellent! Very lucky!' },
  { tier: 8, maxPercent: 80, rarity: 'Epic', message: 'Amazing win!' },
  { tier: 9, maxPercent: 90, rarity: 'Legendary', message: 'INCREDIBLE! Almost perfect!' },
  { tier: 10, maxPercent: 100, rarity: 'Legendary', message: '🔥 LEGENDARY! Maximum winnings! 🔥' },
];

/**
 * Calculate which fent image to show based on winnings percentage
 * @param winAmount - Amount won from the loot box
 * @param maxPossible - Maximum possible winnings (usually cost * 3)
 * @returns FentReward object with image, rarity, and message
 */
export function getFentReward(winAmount: number, maxPossible: number): FentReward {
  // Calculate percentage of max possible winnings
  const percentage = (winAmount / maxPossible) * 100;
  
  // Find the appropriate tier
  let tier = 1;
  for (const rarityTier of rarityTiers) {
    if (percentage <= rarityTier.maxPercent) {
      tier = rarityTier.tier;
      break;
    }
  }
  
  // If percentage is over 100%, it's definitely legendary tier 10
  if (percentage > 100) {
    tier = 10;
  }
  
  // Ensure tier is within bounds
  if (tier < 1) tier = 1;
  if (tier > 10) tier = 10;
  
  const tierData = rarityTiers[tier - 1];
  
  return {
    imageSource: fentImages[tier as keyof typeof fentImages],
    rarity: tierData.rarity,
    message: tierData.message,
    tier,
  };
}

/**
 * Get rarity color for styling
 */
export function getRarityColor(rarity: string): string {
  switch (rarity) {
    case 'Common':
      return '#95a5a6';
    case 'Uncommon':
      return '#27ae60';
    case 'Rare':
      return '#3498db';
    case 'Epic':
      return '#9b59b6';
    case 'Legendary':
      return '#f39c12';
    default:
      return '#95a5a6';
  }
}
