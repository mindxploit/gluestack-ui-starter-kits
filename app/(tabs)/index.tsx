import { View, Text, StyleSheet } from "react-native";

import { Heading } from "@/components/ui/heading";
import CarouselComponent from "@/components/ui/carousel";

export default function Tab() {
  const _renderItem = ({ item, index }: { item: any, index: number }) => {
    return (
      <View>
        <Text>{item.title}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text>Home</Text>
      <CarouselComponent />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
