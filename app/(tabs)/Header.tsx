import * as React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useAuth } from "@/hooks/useAuth";
import { useBalance } from "@/hooks/useBalance";
import { useRouter } from "expo-router";

interface HeaderProps {
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLogout }) => {
  const { session } = useAuth();
  const { balance, loading: balanceLoading } = useBalance();
  const router = useRouter();

  function capitalizeFirstLetter(arg0: string): React.ReactNode {
    return arg0?.charAt(0).toUpperCase() + arg0?.slice(1);
  }

  return (
    <View style={styles.header}>
      <View style={styles.balanceContainer}>
        <View>
          <Text style={styles.balanceText}>
            {balanceLoading ? 'Loading...' : `$${balance?.toFixed(2) || '0.00'}`}
          </Text>
        </View>
      </View>
      <View>
        <Text style={styles.greetingText}>
          Hello, {capitalizeFirstLetter(session?.user?.email?.split('@')[0] || 'Guest')}
        </Text>
      </View>
      <TouchableOpacity onPress={onLogout}>
        <Image
          source={{
            uri: "https://cdn.builder.io/api/v1/image/assets/TEMP/8f2063306459832da9ff55d07b255e81c2e56812",
          }}
          style={styles.logoutIcon}
          accessibilityLabel="Logout"
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingTop: 40,
    paddingRight: 12,
    paddingBottom: 10,
    paddingLeft: 12,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  balanceContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  balanceText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "400",
  },
  greetingText: {
    color: "#000",
    fontSize: 24,
    fontWeight: "700",
  },
  logoutIcon: {
    width: 35,
    height: 35,
  },
});

export default Header;