// app/(tabs)/PlayerCardModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { postBet, getBetById } from '@/hooks/useBets'; // Import the new function
import { useAuth } from '@/hooks/useAuth';
import MySlider from "./MySlider";

interface Game {
  id: string;
  name: string;
  points: number;
  odds: number;
  coefficients: number[];
  min_line: number;
  max_line: number;
}

interface GameCardModalProps {
  game: Game;
  onClose: () => void;
}

const GameCardModal: React.FC<GameCardModalProps> = ({ game, onClose }) => {
  const [entryFee, setEntryFee] = useState<string>("");
  const { session } = useAuth();
  const [odds, setOdds] = useState<number>(game.odds);
  const [points, setPoints] = useState<number>(game.points);
  const [side, setSide] = useState<'OVR' | 'UND'>('OVR');

  const calculateOdds = (value: number, side: 'OVR' | 'UND') => {
    const [a, b, c, d] = game.coefficients;
    if (side === 'OVR') {
      if (value < game.points) {
        return -1 * (a * value**3 + b * value**2 + c * value + d + 200);
      } else {
        return -1 * (a * value**3 + b * value**2 + c * value + d);
      }
    } else {
      if (value < game.points) {
        return a * value**3 + b * value**2 + c * value + d + 200;
      } else {
        return a * value**3 + b * value**2 + c * value + d;
      }
    }
  };

  const handlePostBet = async () => {
    const p_money = parseFloat(entryFee);
    
    if (session && session.user.id) {
      await postBet(game.name, points, Math.round(odds), side, p_money, session.user.id);
      onClose();
    } else {
      console.error('User is not logged in');
    }
  };

  const handleSideChange = (selectedSide: 'OVR' | 'UND') => {
    setSide(selectedSide);
    setOdds(calculateOdds(points, selectedSide));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.playerName}>{game.name}</Text>

      <Text style={styles.sliderLabel}>Set your money line</Text>
      <MySlider
        minimumValue={game.min_line}
        maximumValue={game.max_line}
        step={1}
        sliderValue={points}
        onValueChange={(value) => {
          setPoints(value);
          setOdds(calculateOdds(value, side));
        }} 
      />
      <Text style={styles.lineText}>Line: {points} </Text>
      <Text style={styles.oddsText}>Odds: {odds > 0 ? `+${Math.round(odds)}` : `${Math.round(odds)}`}</Text>

      <View style={styles.sideSelectionContainer}>
        <TouchableOpacity
          style={[styles.sideButton, { backgroundColor: side === 'OVR' ? '#1F8A70' : '#FFFFFF' }]}
          onPress={() => handleSideChange('OVR')}
        >
          <Text style={{ color: side === 'OVR' ? '#FFFFFF' : '#1F8A70' }}>Over</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sideButton, { backgroundColor: side === 'UND' ? '#1F8A70' : '#FFFFFF' }]}
          onPress={() => handleSideChange('UND')}
        >
          <Text style={{ color: side === 'UND' ? '#FFFFFF' : '#1F8A70' }}>Under</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.entryFeeContainer}>
        <Text>Entry Fee:</Text>
        <TextInput
          style={styles.entryFeeInput}
          value={entryFee}
          onChangeText={setEntryFee}
          keyboardType="numeric"
          placeholder="$"
        />
      </View>

      <TouchableOpacity style={styles.postBetButton} onPress={handlePostBet}>
        <Text style={styles.postBetButtonText}>Post Bet</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  playerName: {
    fontSize: 30,
    fontWeight: "bold",
  },
  opponent: {
    fontSize: 18,
    marginBottom: 20,
  },
  sliderLabel: {
    marginVertical: 10,
    fontSize: 16,
  },
  slider: {
    width: "100%",
  },
  lineText: {
    fontSize: 20,
    marginVertical: 10,
    color: "#007AFF",
  },
  oddsText: {
    fontSize: 20,
    marginVertical: 10,
    color: "#007AFF",
  },
  sideSelectionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 20,
  },
  sideButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 5, 
  },
  entryFeeContainer: {
    width: "100%",
    marginVertical: 20,
  },
  entryFeeInput: {
    borderWidth: 1,
    borderColor: "#007AFF",
    borderRadius: 5,
    padding: 10,
    width: "100%",
    textAlign: "center",
  },
  postBetButton: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    marginVertical: 10,
  },
  postBetButtonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#D9D9D9",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  closeButtonText: {
    color: "#000",
  },
});

export default GameCardModal;