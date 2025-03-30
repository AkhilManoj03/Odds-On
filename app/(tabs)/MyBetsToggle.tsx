import * as React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

interface MyBetsToggleProps {
  activeTab: "active" | "completed"; // Specific tab types for MyBetsToggle
  onTabChange: (tab: "active" | "completed") => void; // Specific tab types for MyBetsToggle
}

const MyBetsToggle: React.FC<MyBetsToggleProps> = ({ activeTab, onTabChange }) => {
  return (
    <View style={styles.toggleContainer}>
      <View style={styles.toggleBackground}>
        <View
          style={[
            styles.activeTabIndicator,
            activeTab === "active" ? styles.activeTabLeft : styles.activeTabRight,
          ]}
        />
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange("active")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "active" && styles.activeTabText,
            ]}
          >
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tabButton}
          onPress={() => onTabChange("completed")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "completed" && styles.activeTabText,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  toggleContainer: {
    width: "100%",
    maxWidth: 356,
    height: 81,
    position: "relative",
  },
  toggleBackground: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    backgroundColor: "#D9D9D9",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "relative",
  },
  activeTabIndicator: {
    width: 158,
    height: 59,
    borderRadius: 50,
    position: "absolute",
    backgroundColor: "#FFFFFF",
    top: 11,
  },
  activeTabLeft: {
    left: 12,
  },
  activeTabRight: {
    right: 12,
  },
  tabButton: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  tabText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "700",
  },
  activeTabText: {
    // You can add specific styling for the active tab text if needed
  },
});

export default MyBetsToggle;
