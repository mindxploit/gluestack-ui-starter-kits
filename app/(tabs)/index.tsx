import { View, Text, StyleSheet } from "react-native";

import { Heading } from "@/components/ui/heading";
import CarouselAvatars from "@/components/ui/carousel";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { useState } from "react";
import { Box } from "@/components/ui/box";
import { ScrollView } from "@/components/ui/scroll-view";

export default function Tab() {
  const categories = ["all", "VIP", "Fitness", "Coaching", "Business", "Health", "Lifestyle", "Education", "Adult"];
  const [selectedCategory, setSelectedCategory] = useState("all");
  return (
    <View style={styles.container}>
      <Heading size="5xl" className="my-2 mb-4 font-medium">Find the perfect <Text className="text-purple-300 font-semibold cursive">avatar</Text> for you.</Heading>

      <ScrollView className="w-full mx-2" horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40 }}>
        {categories.map((category) => (
          <Button className="px-2" size="lg" variant="link" onPress={() => setSelectedCategory(category)}>
            <ButtonText className={selectedCategory === category ? "uppercase font-extrabold" : "text-primary-200 uppercase"}>{category}</ButtonText>
          </Button>
        ))}
      </ScrollView>
      <CarouselAvatars />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingVertical: 10,
  },
});
