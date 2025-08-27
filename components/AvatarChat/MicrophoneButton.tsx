import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { useMicrophone } from './streaming/useMicrophone';

interface MicrophoneButtonProps {
  onAudioData: (audioData: string) => void;
  disabled?: boolean;
  size?: number;
}

export const MicrophoneButton: React.FC<MicrophoneButtonProps> = ({
  onAudioData,
  disabled = false,
  size = 60,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const {
    isRecording,
    isPermissionGranted,
    startRecording,
    stopRecording,
    requestPermissions,
    cleanup,
  } = useMicrophone({
    onAudioData,
  });

  // Animation for recording state
  useEffect(() => {
    if (isRecording) {
      // Pulsing animation while recording
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      // Reset animation
      scale.value = withTiming(1, { duration: 200 });
      opacity.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Request permissions on mount
  useEffect(() => {
    requestPermissions();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handlePressIn = async () => {
    if (disabled) return;

    if (!isPermissionGranted) {
      await requestPermissions();
      return;
    }

    await startRecording();
  };

  const handlePressOut = async () => {
    if (disabled) return;
    await stopRecording();
  };

  const getButtonColor = () => {
    if (disabled) return 'gray'; // gray-400
    if (isRecording) return 'purple'; // red-500
    return 'purple'; // blue-500
  };

  const getIconName = () => {
    if (!isPermissionGranted) return 'mic-off';
    if (isRecording) return 'stop';
    return 'mic';
  };

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={{
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={[
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: getButtonColor(),
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
            },
            animatedStyle,
          ]}
        >
          <MaterialIcons
            name={getIconName()}
            size={size * 0.4}
            color="white"
          />
        </Animated.View>
      </Pressable>
    </View>
  );
};
