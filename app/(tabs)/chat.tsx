import { View, StyleSheet } from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { AvatarChat } from "@/components/AvatarChat";

export default function Tab() {
  const avatar = {
    name: 'Agentica',
    description: 'Cogit AI Representative',
    video: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fa8%2Fc2%2Ffc%2Fa8c2fc1833d28007d3507652a70ea78c.jpg&f=1&nofb=1&ipt=574b6a1bcf2d54761387582b704a975c861c7cb5a4e11c50707079cc11ed5b90',
    clientId: 20
  }
  const suggestions = [
    "Who is Cogit AI?",
    "Who is Agentica?",
  ]
  return (
    <View style={styles.container}>
      <AvatarChat avatar={avatar} suggestions={suggestions} />
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  blurContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  scrollContainer: {
    gap: 5,
  },
});
