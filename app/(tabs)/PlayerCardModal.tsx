// app/(tabs)/PlayerCardModal.tsx
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import Slider from '@miblanchard/react-native-slider';
import { postBet, getBetById } from '@/hooks/useBets'; // Import the new function
import { useAuth } from '@/hooks/useAuth';
import MySlider from "./MySlider";

interface Player {
  name: string;
  opponent: string;
  points: number;
}

interface PlayerCardModalProps {
  player: Player;
  betId: string; // Accept betId prop
  onClose: () => void;
}

const PlayerCardModal: React.FC<PlayerCardModalProps> = ({ player, betId, onClose }) => {
  const [entryFee, setEntryFee] = useState<string>("");
  const { session } = useAuth();
  const [coefficients, setCoefficients] = useState<number[]>([]); // State for coefficients
  const [odds, setOdds] = useState<number>(100); 
  const [points, setPoints] = useState<number>(player.points);
  const [side, setSide] = useState<'OVR' | 'UND'>('OVR'); // State for selected side

  const calculateOdds = (value: number, side: 'OVR' | 'UND') => {
    // Function to calculate odds based on slider value using a piecewise function
    console.log('Coefficients:', coefficients);
    const a = coefficients[0];
    const b = coefficients[1];
    const c = coefficients[2];
    const d = coefficients[3];
    if (side === 'OVR') {
      console.log('Calculating odds for OVR');
      if (value < player.points) {
        console.log('Value is less than player points');
        return -1 * (a * value**3 + b * value**2 + c * value + d + 200);
      } else {
        console.log('Value is greater than or equal to player points');
        return -1 * (a * value**3 + b * value**2 + c * value + d);
      }
    } else {
      console.log('Calculating odds for UND');
      if (value < player.points) {
        console.log('Value is less than player points');
        return a * value**3 + b * value**2 + c * value + d + 200;
      } else {
        console.log('Value is greater than or equal to player points');
        return a * value**3 + b * value**2 + c * value + d;
      }
    }
 
  };

  useEffect(() => {
    const fetchBetData = async () => {
      try {
        const betData = await getBetById(betId); // Fetch bet data by ID
        setCoefficients(betData.coefficients); // Set coefficients from fetched data
      } catch (error) {
        console.error('Error fetching bet data:', error);
      }
    };

    fetchBetData();
  }, [betId]);

  const handlePostBet = async () => {
    const p_money = parseFloat(entryFee); // Convert entry fee to number
    
    if (session && session.user.id) {
      await postBet(player.name, points, Math.round(odds), side, p_money, session.user.id); // Use coefficients for odds
      onClose(); // Close the modal after posting the bet
    } else {
      console.error('User is not logged in');
    }
  };

  const handleSideChange = (selectedSide: 'OVR' | 'UND') => {
    setSide(selectedSide); // Update the selected side
    setOdds(-1 * odds); // Recalculate odds based on the current points
  };

  return (
    <View style={styles.container}>
      <Text style={styles.playerName}>{player.name}</Text>

      <Text style={styles.sliderLabel}>Set your money line</Text>
      <MySlider
        minimumValue={0}
        maximumValue={49}
        step={1}
        sliderValue={points} // Use player's points as the initial value
        onValueChange={(value) => {
          setPoints(value);
          setOdds(calculateOdds(value, side)); // Update odds when slider value changes
        }} 
      />
      <Text style={styles.lineText}>Line: {points} pts</Text>
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

export default PlayerCardModal;