import * as React from "react";
import { View, StyleSheet, Modal } from "react-native";
import GameCard from "./GameCard";
import GameCardModal from "./GameCardModal";

interface Game {
  id: string;
  name: string;
  points: number;
  odds: number;
  coefficients: number[];
  min_line: number;
  max_line: number;
}

interface GameCardGridProps {
  games: Game[];
}

const GameCardGrid: React.FC<GameCardGridProps> = ({ games }) => {
  const [modalVisible, setModalVisible] = React.useState(false);
  const [selectedGame, setSelectedGame] = React.useState<Game | null>(null);

  const handleCardPress = (game: Game) => {
    setSelectedGame(game);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedGame(null);
  };

  return (
    <View style={styles.gridContainer}>
      {games.map((game) => (
        <GameCard
          name={game.name}
          points={game.points}
          odds={game.odds} // Assuming opponent is used for outcome in this context
          onPress={() => handleCardPress(game)}
        />
      ))}
      {selectedGame && (
        <Modal
          visible={modalVisible}
          animationType="slide"
          onRequestClose={closeModal}
        >
          <GameCardModal game={selectedGame} onClose={closeModal} />
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

export default GameCardGrid;
