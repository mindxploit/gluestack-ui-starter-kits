import { View, StyleSheet } from "react-native";

import { Heading } from "@/components/ui/heading";
import CarouselAvatars from "@/components/ui/carousel";
import { Button, ButtonGroup, ButtonText } from "@/components/ui/button";
import { useState } from "react";
import { ScrollView } from "@/components/ui/scroll-view";
import { Card } from "@/components/ui/card";
import { AvatarBadge, AvatarGroup } from "@/components/ui/avatar";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallbackText } from "@/components/ui/avatar";
import { AvatarImage } from "@/components/ui/avatar";
import { HStack } from "@/components/ui/hstack";
import { Divider } from "@/components/ui/divider";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

const mockAvatars = [
  { name: "Lisa", image: "https://api.cogit-lab.com/documents/img_avatar/e25ebe40-952b-449a-8f32-6b5774775bb4_cropped_resized.png" },
  { name: "Zia Sofia", image: "https://api.cogit-lab.com/documents/img_avatar/f050269a-f64d-4dc3-b835-cef9d1a37c70_cropped_resized.png" },
  { name: "Sara", image: "https://api.cogit-lab.com/documents/img_avatar/cb4e55ee-ad50-4595-80a6-702df27f0555_cropped_resized.png" },
  { name: "Ava", image: "https://api.cogit-lab.com/documents/img_avatar/6d51b08c-fe30-4936-9c1b-10a5e33f1f0a_cropped_resized.png" }
];

export default function Tab() {
  const categories = ["all", "VIP", "Fitness", "Coaching", "Business", "Health", "Lifestyle", "Education", "Adult"];
  const [selectedCategory, setSelectedCategory] = useState("all");
  return (
    <View style={styles.container}>
      <Heading size="5xl" className="my-2 mb-4 font-medium">Find the perfect <Heading size="5xl" className="text-purple-300 font-semibold cursive">avatar</Heading> for you.</Heading>

      <ScrollView className="w-full mx-2" horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 40 }}>
        {categories.map((category) => (
          <Button className="px-2" size="lg" variant="link" onPress={() => setSelectedCategory(category)}>
            <ButtonText className={selectedCategory === category ? "uppercase font-extrabold" : "text-primary-200 uppercase"}>{category}</ButtonText>
          </Button>
        ))}
      </ScrollView>
      <CarouselAvatars />

      <Card size="sm" variant="elevated" className="w-full mt-5 pt-2 pb-5 border border-x-0 border-bottom-0 border-top-1 border-background-100">
        <Heading size="md" className="mb-4 font-medium text-left opacity-70">Recent conversations</Heading>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 13 }}>
          {mockAvatars.map((avatar) => (
            <VStack className="items-center" space="xs">
              <Avatar size="lg" className="shadow-md">
                <AvatarFallbackText>{avatar.name}</AvatarFallbackText>
                <AvatarImage source={{ uri: avatar.image }} />
                {/* <AvatarBadge /> */}
              </Avatar>
              <Text size="sm" className="text-center">{avatar.name}</Text>
            </VStack>
          ))}
        </ScrollView>
      </Card>
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
