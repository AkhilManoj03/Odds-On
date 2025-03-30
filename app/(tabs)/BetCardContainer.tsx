import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import BetCard from "./BetCard";
import { useLiveBets } from "@/hooks/useBets";
import { useFriends } from "@/hooks/useFriends";
import { updateLiveBet } from "@/hooks/useBets";
import BetCardModal from "./BetCardModal";

interface BetCardContainerProps {
  userId: string | undefined; // Accept userId as a prop
}

const BetCardContainer: React.FC<BetCardContainerProps> = ({userId}) => {
  const { liveBets } = useLiveBets();
  const { friends } = useFriends();
  const [selectedBet, setSelectedBet] = useState<typeof liveBets[0] | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const friendIds = friends.map(friend => friend.id);

  const filteredBets = liveBets.filter(bet => friendIds.includes(bet.poster) && bet.acceptor === null);

  const handleCardPress = (bet: typeof liveBets[0]) => {
    setSelectedBet(bet);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedBet(null);
  };

  const handleAccept = async () => {
    console.log("Accepting bet:", selectedBet);
    if (selectedBet) {
      await updateLiveBet(selectedBet.id, userId);
      handleCloseModal();
    }
  };

  return (
    <View style={styles.gridContainer}>
      {filteredBets.map((bet, index) => (
        <BetCard
          key={index}
          sender={bet.poster_email.split('@')[0].charAt(0).toUpperCase() + bet.poster_email.split('@')[0].slice(1)}
          playerName={bet.name}
          points={bet.points}
          p_money={bet.p_money}
          odds={bet.odds}
          side={bet.side}
          onPress={() => handleCardPress(bet)}
        />
      ))}
      <BetCardModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onAccept={handleAccept}
        sender={selectedBet?.poster_email || ""}
        playerName={selectedBet?.name || ""}
        points={selectedBet?.points || 0}
        odds={selectedBet?.odds || 0}
        side={selectedBet?.side || "OVR"}
        p_money={selectedBet?.p_money || 0}
        a_money={(selectedBet?.odds || 0) >= 0 ? 
          Math.round((selectedBet?.p_money || 0) / ((selectedBet?.odds || 0) / 100)): 
          Math.abs((selectedBet?.p_money || 0) *((selectedBet?.odds || 0) / 100))
        }
        userId={userId}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    padding: 30,
    justifyContent: "flex-start",
    width: "100%"
  },
});

export default BetCardContainer;