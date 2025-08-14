import { Image } from "@/components/ui/image";
import { Input, InputSlot } from "@/components/ui/input";
import { InputField } from "@/components/ui/input";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Easing } from "react-native";
import { BlurView } from "expo-blur";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState } from "react";

import { Dimensions, Pressable } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  ReduceMotion,
} from 'react-native-reanimated';
import { Button, ButtonText } from "../ui/button";


interface AvatarChatProps {
  avatar: {
    name: string;
    description: string;
    video: string;
  };
  suggestions: string[];
}
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function AvatarChat({ avatar = {
  name: 'Jesus',
  description: 'The Son of God',
  video: 'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fi.pinimg.com%2Foriginals%2Fa8%2Fc2%2Ffc%2Fa8c2fc1833d28007d3507652a70ea78c.jpg&f=1&nofb=1&ipt=574b6a1bcf2d54761387582b704a975c861c7cb5a4e11c50707079cc11ed5b90',
}, suggestions = ["Who is God?", "Why am I here?", "What is money?", "What is the meaning of life?"] }: AvatarChatProps) {
  const anim = useSharedValue(0);

  const toggleChat = () => {
    anim.value = anim.value === 0 ? 1 : 0;
  }

  const chatStyle = useAnimatedStyle(() => {
    // const config = {
    //   easing: Easing.inOut(Easing.quad),
    //   reduceMotion: ReduceMotion.System,
    // }
    const width = withTiming(anim.value === 0 ? 80 : SCREEN_WIDTH);
    const height = withTiming(anim.value === 0 ? 80 : SCREEN_HEIGHT);
    const bottom = withTiming(anim.value === 0 ? 100 : 0);
    const right = withTiming(anim.value === 0 ? 0 : 0);
    const radius = withTiming(anim.value === 0 ? 20 : 0);

    return {
      width,
      height,
      bottom,
      right,
      borderRadius: radius,
    };
  });

  const tabBarHeight = useBottomTabBarHeight();

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleChat}>

        <Animated.View style={[styles.chatContainer, chatStyle]}>

          <Image alt={avatar.name} source={avatar.video} className="w-full h-full absolute object-cover" />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // offset based on the tabs margin
            keyboardVerticalOffset={-tabBarHeight}>
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
          </KeyboardAvoidingView>
        </Animated.View>
      </Pressable>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  blurContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  scrollContainer: {
    gap: 5,
  },
  chatContainer: {
    position: 'absolute',
    overflow: 'hidden',
    borderRadius: 100,
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
});
