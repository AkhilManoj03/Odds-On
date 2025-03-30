import * as React from "react";
import { View, StyleSheet, Image, TouchableOpacity } from "react-native";

interface BottomNavBarProps {
  onNavigate: (index: number) => void;
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ onNavigate }) => {
  return (
    <View style={styles.navContainer}>
      <TouchableOpacity onPress={() => onNavigate(0)}>
        <View style={styles.redCardContainer}>
          <Image
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/7ae73a0fcd12d22ab9ffbd3e53094e34d2754837",
            }}
            style={styles.redCardImage}
            accessibilityLabel="Red Card"
          />
          <Image
            source={{
              uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/d76cd12a3ee07ae7d6abdcfb5c0f2ef38ea702ae",
            }}
            style={styles.profileIcon}
            accessibilityLabel="Head Profile"
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate(1)}>
        <Image
          source={{
            uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/0aa33368f2bfd33bf0471fd39681f1874d54e752",
          }}
          style={styles.navIcon}
          accessibilityLabel="My Bets"
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onNavigate(2)}>
        <Image
          source={{
            uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/062c0ca1b975d6a4b973a908bfe5e1b55fdd6857",
          }}
          style={styles.navIcon}
          accessibilityLabel="Users"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  navContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: 80,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "white",
  },
  redCardContainer: {
    position: "relative",
    width: 50,
    height: 50,
  },
  redCardImage: {
    width: "100%",
    height: "100%",
  },
  profileIcon: {
    width: 24,
    height: 24,
    position: "absolute",
    left: 7,
    top: 11,
  },
  navIcon: {
    width: 50,
    height: 50,
  },
});

export default BottomNavBar;
