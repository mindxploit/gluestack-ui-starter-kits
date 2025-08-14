import { Image } from "@/components/ui/image";
import { Input, InputSlot } from "@/components/ui/input";
import { InputField } from "@/components/ui/input";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { BlurView } from "expo-blur";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";



export default function Tab() {
  const tabBarHeight = useBottomTabBarHeight();
  const suggestions = [
    "Who is God?",
    "Why am I here?",
    "What is money?",
    "What is the meaning of life?",
  ]
  return (
    <View style={styles.container}>
      <Image alt="jesus" source={"https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fa8%2Fc2%2Ffc%2Fa8c2fc1833d28007d3507652a70ea78c.jpg&f=1&nofb=1&ipt=574b6a1bcf2d54761387582b704a975c861c7cb5a4e11c50707079cc11ed5b90"} className="w-full h-full absolute object-cover" />

      <VStack space="md" className="w-full p-4" style={{ marginBottom: tabBarHeight }}>
        <ScrollView
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContainer}
        >
          {suggestions.map((suggestion, index) => (
            <BlurView key={index} intensity={90} style={styles.blurContainer}>
              <Badge action="neutral" variant="outline" size="lg" className="bg-transparent rounded-full">
                <BadgeText size="sm">
                  <Text>{suggestion}</Text>
                </BadgeText>
              </Badge>
            </BlurView>
          ))}
        </ScrollView>

        <BlurView intensity={90} style={styles.blurContainer}>
          <Input variant="rounded" size="xl" isDisabled={false} isInvalid={false} isReadOnly={false} className="border-background-300">
            <InputField
              placeholder='Ask me anything...'
            />
            <InputSlot className="px-3">
              <MaterialIcons name="send" size={24} className="text-background-300" />
            </InputSlot>
          </Input>
        </BlurView>
      </VStack>
    </View>
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
