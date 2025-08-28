import { Image } from "@/components/ui/image";
import { Input, InputSlot } from "@/components/ui/input";
import { InputField } from "@/components/ui/input";
import { View, Text, StyleSheet, ScrollView, Platform, KeyboardAvoidingView } from "react-native";
import { BlurView } from "expo-blur";
import { VStack } from "@/components/ui/vstack";
import { Badge, BadgeText } from "@/components/ui/badge";
import { HStack } from "@/components/ui/hstack";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useEffect, useState } from "react";

import 'react-native-get-random-values';
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
import { useWebsocket } from "./streaming/useWebsocket";
import { v4 as uuidv4 } from 'uuid';
import * as Animatable from 'react-native-animatable';
import { useStreamWebRTC } from "./streaming/useWebRTC";
import { RTCView } from 'react-native-webrtc';
import { ResizeMode, Video } from "expo-av";
import { MicrophoneButton } from "./MicrophoneButton";



interface AvatarChatProps {
  avatar: {
    name: string;
    description: string;
    video: string;
    clientId: number;
  };
  suggestions: string[];
}
export type IChatMessage = {
  id: string;
  message: string;
  sendAt: Date;
  fromMe: boolean;
};

export type IChat = {
  id: number;
  avatar_agent_id: string;
  image: string;
  name: string;
  messages: IChatMessage[];
  unreads?: number;
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const userId = "1";
const sessionId = "1754562753365441185";

// we should get that from the backend
const avatarId = "3ddba8f5-0d2c-4932-a172-09986ee12c3c";

export const AvatarChat = ({ avatar, suggestions }: AvatarChatProps) => {
  const [chat, setChat] = useState<IChat>({ id: 0, avatar_agent_id: "", image: "", name: "", messages: [] });
  const [messageQueue, setMessageQueue] = useState<IChatMessage[]>([]);
  const [inputValue, setInputValue] = useState<string>("");
  const [displayedMessage, setDisplayedMessage] = useState<string>("");
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  const addMessageToChat = (message: string, fromMe: boolean) => {
    setChat((prevChat) => {
      if (!prevChat) return prevChat;
      return {
        ...prevChat,
        messages: [...prevChat.messages, { id: uuidv4(), message, sendAt: new Date(), fromMe }],
      };
    });
  };

  const addMessageToQueue = (message: string, fromMe: boolean) => {
    setMessageQueue((prevQueue) => [...prevQueue, { id: uuidv4(), message, sendAt: new Date(), fromMe }]);
  };

  const { remoteStream, isStreaming, setupStream } = useStreamWebRTC(avatar.clientId, sessionId);
  const { onTextSubmit, onAudioSubmit, lastMessageId } = useWebsocket(userId, avatarId, sessionId, setChat, addMessageToChat, addMessageToQueue, isStreaming);

  useEffect(() => {
    processNextMessage();
  }, [messageQueue, isAnimating, isStreaming]);

  const processNextMessage = () => {
    if (messageQueue.length > 0 && !isAnimating && isStreaming) {
      setDisplayedMessage(messageQueue.slice(0, 3).map((message) => message.message).join(''));
      setMessageQueue((prevMessageQueue) => prevMessageQueue.slice(3));
      setIsAnimating(true);
    }
  }

  useEffect(() => {
    if (lastMessageId) {
      console.log("Calling webRTC setupStream", lastMessageId);
      setupStream(lastMessageId);
    }
  }, [lastMessageId]);

  // Animations
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
  const heightWithoutInsets = SCREEN_HEIGHT - tabBarHeight - insets.top - insets.bottom
  const videoUrl = "https://api.cogit-lab.com/documents/idle_video/3ddba8f5-0d2c-4932-a172-09986ee12c3c_cropped_resized_idle.mp4"

  return (
    <View style={styles.container}>
      <GestureDetector gesture={Gesture.Exclusive(tap, dragGesture)}>
        <Animated.View style={[styles.chatContainer, chatStyle]}>
          {isStreaming && remoteStream && (
            <RTCView
              streamURL={remoteStream.toURL()}
              style={{ width: '100%', height: '100%', position: 'absolute', zIndex: 99 }}
              objectFit="cover"
            />
          )}
          {/* video fallback bg */}
          <Video
            source={{ uri: videoUrl }}
            shouldPlay={true}
            isLooping={true}
            isMuted={true}
            resizeMode={ResizeMode.COVER}
            style={{
              width: SCREEN_WIDTH,
              height: SCREEN_HEIGHT,
              position: 'absolute',
              zIndex: 1,
            }}
          />

          <Animated.View style={[hiddenStyle, { zIndex: 100 }]}>
            <VStack space="md" className="w-full px-4 pb-4" style={{ marginBottom: tabBarHeight, justifyContent: 'center', height: heightWithoutTabBar }}>
              <HStack className="justify-between" style={{ marginTop: insets.top }}>
                <Animated.View style={[hiddenStyle]}>
                  <BlurView intensity={90} style={styles.blurContainer}>
                    <Badge action="neutral" variant="solid" size="lg" className="rounded-full">
                      <BadgeText size="lg" className="font-bold">
                        {avatar.name}
                      </BadgeText>
                    </Badge>
                  </BlurView>
                </Animated.View>

                <Animated.View style={[hiddenStyle]}>
                  <Pressable onPress={toggleChat}>
                    <BlurView intensity={30} style={styles.blurContainer}>
                      <Button variant="solid" size="xs" className="rounded-full bg-transparent opacity-70" onPress={toggleChat}>
                        <FontAwesome name="chevron-down" size={16} color="white" />
                      </Button>
                    </BlurView>
                  </Pressable>
                </Animated.View>
              </HStack>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'position' : 'height'}
                keyboardVerticalOffset={0}
              >
                <VStack style={{ height: heightWithoutInsets }} space="md" className="pb-2">
                  {/* TODO: add back message display with timing later on */}
                  {/* {displayedMessage && (
                    <Animatable.View style={styles.messageQueue} animation="fadeIn" key={displayedMessage} duration={1000} onAnimationEnd={() => setIsAnimating(false)}>
                      <BlurView intensity={90} style={[styles.blurContainer]}>
                        <Badge action="neutral" variant="solid" size="lg" className="rounded-full bg-transparent">
                          <BadgeText size="lg" className="font-bold">
                            {displayedMessage}
                          </BadgeText>
                        </Badge>
                      </BlurView>
                    </Animatable.View>
                  )} */}
                  <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                  >
                    {suggestions.map((suggestion, index) => (
                      // @ts-ignore
                      <BlurView onPress={() => {
                        onTextSubmit(suggestion)
                        setInputValue("")
                      }} intensity={90} style={[styles.blurContainer, { alignSelf: "flex-end" }]}>
                        <Badge action="neutral" variant="outline" size="lg" className="bg-transparent rounded-full">
                          <BadgeText size="sm">
                            <Text>{suggestion}</Text>
                          </BadgeText>
                        </Badge>
                      </BlurView>
                    ))}
                  </ScrollView>

                  {/* Chat Input Section */}
                  <HStack space="md" className="items-center">
                    {/* @ts-ignore */}
                    <BlurView intensity={90} style={[styles.blurContainer, { flex: 1 }]}>
                      <Input variant="rounded" size="xl" isDisabled={false} isInvalid={false} isReadOnly={false} className="border-background-300">
                        <InputField
                          placeholder='Ask me anything...'
                          onSubmitEditing={() => {
                            onTextSubmit(inputValue)
                            setInputValue("")
                          }}
                          onChangeText={(text) => setInputValue(text)}
                          value={inputValue}
                        />
                        <InputSlot className="px-3">
                          <MaterialIcons name="send" size={24} className="text-background-300" />
                        </InputSlot>
                      </Input>
                    </BlurView>

                    <MicrophoneButton
                      onAudioData={(audioData) => {
                        onAudioSubmit(audioData);
                      }}
                      size={50}
                    />
                  </HStack>
                </VStack>
              </KeyboardAvoidingView>
            </VStack>
          </Animated.View>
        </Animated.View>
      </GestureDetector>
    </View >
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
  messageQueue: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
    marginTop: 430,
  }
});
