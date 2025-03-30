import * as React from "react";
import { Float } from "react-native/Libraries/Types/CodegenTypes";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { Colors } from "../colors";

interface BetCardModalProps {
  visible: boolean;
  onClose: () => void;
  onAccept?: () => void;
  sender: string;
  playerName: string;
  p_money: Float;
  a_money: Float;
  points: Float;
  odds: Float;
  side: 'OVR' | 'UND';
  userId: string | undefined;
}

const BetCardModal: React.FC<BetCardModalProps> = ({
  visible,
  onClose,
  onAccept,
  playerName,
  sender,
  p_money,
  a_money,
  points,
  odds,
  side,
  userId,
}) => {

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay} >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Image
                source={{
                  uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/close-icon.png",
                }}
                style={styles.closeIcon}
                accessibilityLabel="Close"
              />
            </TouchableOpacity>

            {/* Player Info Section */}
            <Text style={styles.playerName}>{playerName}</Text>

            {/* Stats Section */}
            <View style={styles.statsContainer}>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Line</Text>
                <Text style={styles.statValue}>{points}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Odds</Text>
                <Text style={styles.statValue}>{odds}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Entry Fee</Text>
                <Text style={styles.statValue}>{a_money}</Text>
              </View>
              <View style={styles.statsRow}>
                <Text style={styles.statLabel}>Payout</Text>
                <Text style={styles.statValue}>{p_money}</Text>
              </View>
            </View>

            {/* Accept Button */}
            <TouchableOpacity style={styles.buttonContainer} onPress={onAccept}>
              <Text style={styles.buttonText}>Accept Bet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  container: {
    maxWidth: 326,
    overflow: "hidden",
  },
  card: {
    borderRadius: 20,
    borderColor: Colors.lightGray,
    borderWidth: 1,
    backgroundColor: Colors.white,
    width: "100%",
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  playerName: {
    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: 24,
    fontWeight: "700",
    color: Colors.black,
    textAlign: "center",
    marginBottom: 10,
  },
  statsContainer: {
    width: "100%",
    marginVertical: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statLabel: {
    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: 16,
    fontWeight: "400",
    color: Colors.darkGreen,
  },
  statValue: {
    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: 16,
    fontWeight: "700",
    color: Colors.black,
  },
  buttonContainer: {
    backgroundColor: Colors.primaryGreen,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: {
    color: Colors.white,
    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default BetCardModal;
