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
import { Button, ButtonText } from "../ui/button";
import { Directions, Gesture, GestureDetector } from "react-native-gesture-handler";


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
  const anim = useSharedValue(0);

  const toggleChat = () => {
    anim.value = anim.value === 0 ? 1 : 0;
  }

  const chatStyle = useAnimatedStyle(() => {
    const config = {
      easing: Easing.inOut(Easing.quad),
      reduceMotion: ReduceMotion.System,
    }
    const width = withTiming(anim.value === 0 ? 80 : SCREEN_WIDTH, config);
    const height = withTiming(anim.value === 0 ? 80 : SCREEN_HEIGHT, config);
    const bottom = withTiming(anim.value === 0 ? 100 : 0, config);
    const right = withTiming(anim.value === 0 ? 0 : 0, config);
    const radius = withTiming(anim.value === 0 ? 20 : 0, config);

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
    const display = withTiming(anim.value === 1 ? 'flex' : 'none');
    return {
      opacity,
      display,
    };
  });

  const tabBarHeight = useBottomTabBarHeight();

  const flingGesture = Gesture.Tap()
    .onBegin(() => {
      console.log('tap started');
      toggleChat();
    })

  return (
    <View style={styles.container}>
      <Pressable onPress={toggleChat}>
        <Animated.View style={[styles.chatContainer, chatStyle]}>

          <Image alt={avatar.name} source={avatar.video} className="w-full h-full absolute object-cover" />

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            // offset based on the tabs margin
            keyboardVerticalOffset={-tabBarHeight}>
            <Animated.View style={hiddenStyle}>
              <VStack space="md" className="w-full p-4" style={{ marginBottom: tabBarHeight }}>
                <ScrollView
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.scrollContainer}
                >
                  {suggestions.map((suggestion, index) => (
                    // @ts-ignore
                    <BlurView intensity={90} style={styles.blurContainer}>
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
      </Pressable >
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
