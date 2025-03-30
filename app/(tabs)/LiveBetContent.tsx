import * as React from "react";
import {
  View,
  Image,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Text,
  TextInput,
  Dimensions,
} from "react-native";

interface LiveBetContentProps {
  visible: boolean;
  onClose: () => void;
}

const LiveBetContent: React.FC<LiveBetContentProps> = ({ visible, onClose }) => {
  const [entryFee, setEntryFee] = React.useState("");

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <Image
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/f16048050c4e179a055fdd3d62578f08b36da066?placeholderIfAbsent=true&apiKey=a228db302d0d4171b008b6c0e8c57fec",
            }}
            style={styles.mainImage}
          />

          <View style={styles.entryFeeContainer}>
            <Text style={styles.entryFeeLabel}>Entry Fee:</Text>
            <TextInput
              style={styles.entryFeeInput}
              value={entryFee}
              onChangeText={setEntryFee}
              keyboardType="numeric"
              placeholder="Enter amount"
            />
          </View>

          <TouchableOpacity style={styles.acceptButton}>
            <Text style={styles.acceptButtonText}>Accept Bet</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: width * 0.9,
    maxWidth: 380,
    backgroundColor: "white",
    borderRadius: 30,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  closeButtonContainer: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
  },
  mainImage: {
    aspectRatio: 0.75,
    width: "100%",
    borderRadius: 20,
    marginTop: 15,
    maxWidth: 300,
  },
  entryFeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  entryFeeLabel: {
    fontFamily: "Inter, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: 18,
    fontWeight: "600",
    marginRight: 10,
  },
  entryFeeInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  acceptButton: {
    backgroundColor: "#4A90E2",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 25,
    marginBottom: 10,
  },
  acceptButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LiveBetContent;