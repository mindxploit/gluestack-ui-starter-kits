import { Image } from "@/components/ui/image";
import { Input, InputSlot } from "@/components/ui/input";
import { InputField } from "@/components/ui/input";
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useState } from "react";

import { Dimensions, Pressable } from 'react-native';
import Animated, {
  Easing,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  ReduceMotion,
} from 'react-native-reanimated';
import { Button, ButtonIcon, ButtonText } from "../ui/button";
import { Directions, Gesture, GestureDetector, GestureEvent, PanGestureHandler, State } from "react-native-gesture-handler";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useSafeAreaInsets } from "react-native-safe-area-context";


interface AvatarChatProps {
  avatar: {
    name: string;
    description: string;
    video: string;
  };
  suggestions: string[];
}
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const AvatarChat = ({ avatar, suggestions }: AvatarChatProps) => {
  const anim = useSharedValue(1);
  const dragY = useSharedValue(0);

  const tap = Gesture.Fling()
    .onBegin(() => {
      anim.value === 0 && toggleChat();
    }).runOnJS(true);

  const dragGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (event.translationY > 0) {
        dragY.value = event.translationY;
        if (event.translationY > 200) {
          anim.value = 0
        }
      }
    }).runOnJS(true)
    .onEnd((event) => {
      // If dragged down far enough, toggle chat
      if (event.translationY > 100) {
        anim.value = 0
      }
      // Reset drag position
      dragY.value = withTiming(0);
    }).runOnJS(true);

  const toggleChat = () => {
    anim.value = anim.value === 0 ? 1 : 0;
  }

  const chatStyle = useAnimatedStyle(() => {
    const config = {
      easing: Easing.inOut(Easing.quad),
      reduceMotion: ReduceMotion.System,
    }
    const width = withTiming(anim.value === 0 ? 100 : SCREEN_WIDTH - (dragY.value * 0.6), config);
    const height = withTiming(anim.value === 0 ? 120 : SCREEN_HEIGHT - dragY.value, config);
    const bottom = withTiming(anim.value === 0 ? 100 : 0, config);
    const right = withTiming(anim.value === 0 ? 0 : 0, config);
    const radius = withTiming(anim.value === 0 ? 20 : 20, config);

    return {
      width,
      height,
      bottom,
      right,
      borderRadius: radius,
    };
  });

  const hiddenStyle = useAnimatedStyle(() => {
    const opacity = withTiming(anim.value === 1 ? 1 : 0);
    return {
      opacity,
    };
  });

  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const heightWithoutTabBar = SCREEN_HEIGHT - tabBarHeight

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(tap, dragGesture)}>
        <Animated.View style={[styles.chatContainer, chatStyle]}>
          <Image alt={avatar.name} source={avatar.video} className="w-full h-full absolute object-cover" />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // offset based on the bottom tabs margin
            keyboardVerticalOffset={-tabBarHeight}>

            <Animated.View style={hiddenStyle}>
              <VStack space="md" className="w-full px-4 pb-4" style={{ marginBottom: tabBarHeight, justifyContent: 'center', height: heightWithoutTabBar }}>
                <HStack className="justify-between">
                  <Animated.View style={[hiddenStyle, { marginTop: insets.top }]}>
                    <BlurView intensity={90} style={styles.blurContainer}>
                      <Badge action="neutral" variant="solid" size="lg" className="rounded-full">
                        <BadgeText size="lg" className="font-bold">
                          {avatar.name}
                        </BadgeText>
                      </Badge>
                    </BlurView>
                  </Animated.View>

                  <Animated.View style={[hiddenStyle, { marginTop: insets.top }]}>
                    <Pressable onPress={toggleChat}>
                      <BlurView intensity={30} style={styles.blurContainer}>
                        <Button variant="solid" size="xs" className="rounded-full bg-transparent opacity-70" onPress={toggleChat}>
                          <FontAwesome name="chevron-down" size={16} color="white" />
                        </Button>
                      </BlurView>
                    </Pressable>
                  </Animated.View>
                </HStack>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContainer}
                >
                  {suggestions.map((suggestion, index) => (
                    // @ts-ignore
                    <BlurView intensity={90} style={[styles.blurContainer, { alignSelf: "flex-end" }]}>
                      <Badge action="neutral" variant="outline" size="lg" className="bg-transparent rounded-full">
                        <BadgeText size="sm">
                          <Text>{suggestion}</Text>
                        </BadgeText>
                      </Badge>
                    </BlurView>
                  ))}
                </ScrollView>

                {/* @ts-ignore */}
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
            </Animated.View>
          </KeyboardAvoidingView>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT
  },
  blurContainer: {
    borderRadius: 100,
    overflow: 'hidden',
  },
  scrollContainer: {
    gap: 5,
  },
  chatContainer: {
    overflow: 'hidden',
  },
});
