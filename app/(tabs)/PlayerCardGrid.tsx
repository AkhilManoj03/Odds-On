import * as React from "react";
import { View, StyleSheet, Modal } from "react-native";
import PlayerCard from "./PlayerCard";
import PlayerCardModal from "./PlayerCardModal";

interface Player {
  id: string;
  name: string;
  opponent: string;
  points: number;
  imageUrl: string;
}

interface PlayerCardGridProps {
  players: Player[];
}

const PlayerCardGrid: React.FC<PlayerCardGridProps> = ({ players }) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedPlayer, setSelectedPlayer] = React.useState<Player | null>(null);

  const handleCardPress = (player: Player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedPlayer(null);
  };

  return (
    <View style={styles.gridContainer}>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          name={player.name}
          points={player.points}
          imageUrl={player.imageUrl}
          onPress={() => handleCardPress(player)}
        />
      ))}
      {selectedPlayer && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <PlayerCardModal player={selectedPlayer} betId={selectedPlayer.id} onClose={closeModal} />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  gridContainer: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    paddingHorizontal: 0,
    justifyContent: "center",
  },
});

export default PlayerCardGrid;
