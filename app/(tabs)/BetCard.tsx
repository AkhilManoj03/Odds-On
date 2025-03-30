import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

interface BetCardProps {
  sender: string;
  playerName: string;
  p_money: Float;
  points: Float;
  odds: Float;
  side: 'OVR' | 'UND';
  onPress: () => void;
}

const BetCard: React.FC<BetCardProps> = ({
  sender,
  playerName,
  p_money,
  points,
  odds,
  side,
  onPress,
}) => {
  // Parse the statLine to separate points and odds

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.senderText} numberOfLines={1}>{sender}</Text>
        <Text style={styles.playerNameText} numberOfLines={0}>{playerName}</Text>
        <Text style={styles.statLineText} numberOfLines={1}>
          {side} | {points} points
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <Text style={[
            styles.valueText,
            { color: odds >= 0 ? '#28a745' : '#dc3545' }
          ]} numberOfLines={1}>
            {odds >= 0 ? '+' : ''}{odds}
          </Text>
          <Text style={styles.valueText} numberOfLines={1}>
            ${p_money}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

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
    width: 150,
    height: 200,
  },
  content: {
    padding: 12,
    height: '100%',
    justifyContent: 'space-between',
    flexGrow: 1,
  },
  senderText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  playerNameText: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  statLineText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#000',
  },
  valueText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});

export default BetCard;