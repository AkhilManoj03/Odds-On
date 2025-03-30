// app/(tabs)/MyBetCard.tsx
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import { Colors } from "../colors"; // Import colors if you have defined them

interface MyBetCardProps {
  sender: string;
  playerName: string;
  points: Float;
  odds: Float;
  p_money: Float;
  side: 'OVR' | 'UND';
  winner?: string; // Optional winner prop
  onPress: () => void;
}

const MyBetCard: React.FC<MyBetCardProps> = ({
  sender,
  playerName,
  points,
  odds,
  p_money,
  side,
  winner, // Destructure the winner prop
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.content}>
        <Text style={styles.senderText} numberOfLines={1}>{sender}</Text>
        <Text style={styles.playerNameText} numberOfLines={1}>{playerName}</Text>
        <Text style={styles.statLineText} numberOfLines={1}>
          {side} | {points} points
        </Text>
        {winner && ( // Conditionally render the winner if provided
          <Text style={styles.winnerText} numberOfLines={1}>
            Winner: {winner}
          </Text>
        )}
        <View style={styles.valueContainer}>
          <Text style={[
            styles.valueText,
            { color: odds >= 0 ? Colors.primaryGreen : Colors.primaryRed }
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
    backgroundColor: Colors.white, // Use white for the card background
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
    color: Colors.darkGreen, // Use dark green for sender text
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
    color: Colors.black, // Use black for stat line text
  },
  winnerText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: Colors.primaryRed, // Use primary red for winner text
    marginTop: 5, // Add some margin for spacing
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  valueText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
  },
});

export default MyBetCard;