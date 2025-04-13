import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

interface GameCardProps {
  name: string;
  points: number;
  odds: number;
  onPress?: () => void;
}

export default function GameCard({ name, points, odds, onPress }: GameCardProps) {
  const router = useRouter();
  const formattedOdds = odds >= 0 ? `+${odds}` : odds.toString();

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
    >
      <View style={styles.content}>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.bottomRow}>
          <View style={styles.overUnderContainer}>
            <Text style={styles.points}>{points}</Text>
          </View>
          <Text style={[styles.odds, odds >= 0 ? styles.positiveOdds : styles.negativeOdds]}>
            {formattedOdds}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
    width: 150,
    height: 200,
    padding: 12,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  nameContainer: {
    flex: 1,
    marginBottom: 16,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    lineHeight: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 50,
  },
  overUnderContainer: {
    flex: 1,
  },
  overUnderLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  points: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#007AFF',
  },
  odds: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
  positiveOdds: {
    color: '#34C759',
  },
  negativeOdds: {
    color: '#FF3B30',
  },
});