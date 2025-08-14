import { Button, ButtonText } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Heading } from "@/components/ui/heading";
import { HStack } from "@/components/ui/hstack";
import { ScrollView, StyleSheet } from "react-native";
import { VStack } from "@/components/ui/vstack";
import { View } from "@/components/ui/view";
import { Avatar, AvatarFallbackText, AvatarImage, AvatarGroup } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

export default function Tab() {
  const tabBarHeight = useBottomTabBarHeight();
  const mockAvatars = [
    {
      name: "Liam Johnson",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    },
    {
      name: "Olivia Brown",
      image: "https://images.unsplash.com/photo-1603415526960-f7e0328c63b1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",

    },
    {
      name: "Noah Williams",
      image: "https://images.unsplash.com/photo-1614289371518-722f2615943d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80",
    },
    {
      name: "Emma Davis",
      image: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80",
    },
  ];
  return (
    <View style={styles.container}>
      <ScrollView className="w-full p-5 py-10">
        <Heading size="4xl" className="mb-5">Discover your perfect avatar</Heading>
        <VStack space="md">
          <Card size="md" variant="elevated">
            <Heading size="lg" className="mb-1">Fitness</Heading>
            <AvatarGroup className="justify-center items-center">
              {mockAvatars.map((avatar) => (
                <Avatar size="xl">
                  <AvatarFallbackText>{avatar.name}</AvatarFallbackText>
                  <AvatarImage source={{ uri: avatar.image }} />
                </Avatar>
              ))}
            </AvatarGroup>
          </Card>

          <Card size="md" variant="elevated">
            <Heading size="lg" className="mb-1">Lifestyle</Heading>
            <AvatarGroup>
              {mockAvatars.map((avatar) => (
                <Avatar size="xl">
                  <AvatarFallbackText>{avatar.name}</AvatarFallbackText>
                  <AvatarImage source={{ uri: avatar.image }} />
                </Avatar>
              ))}
            </AvatarGroup>
          </Card>

          <Card size="md" variant="elevated">
            <Heading size="lg" className="mb-1">VIP</Heading>
            <AvatarGroup>
              {mockAvatars.map((avatar) => (
                <Avatar size="xl">
                  <AvatarFallbackText>{avatar.name}</AvatarFallbackText>
                  <AvatarImage source={{ uri: avatar.image }} />
                </Avatar>
              ))}
            </AvatarGroup>
          </Card>

          <Card size="md" variant="elevated">
            <Heading size="lg" className="mb-1">Coaching</Heading>
            <AvatarGroup>
              {mockAvatars.map((avatar) => (
                <Avatar size="xl">
                  <AvatarFallbackText>{avatar.name}</AvatarFallbackText>
                  <AvatarImage source={{ uri: avatar.image }} />
                </Avatar>
              ))}
            </AvatarGroup>
          </Card>
        </VStack>
      </ScrollView>
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
