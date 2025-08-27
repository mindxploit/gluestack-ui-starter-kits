import { useState } from "react";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';

export const useMicrophone = ({ onAudioData }: { onAudioData: (audioData: string) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setIsPermissionGranted(status === 'granted');
  };

  const startRecording = async () => {
    // If already recording, do nothing
    if (isRecording) return;

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.pcm',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000, // 16-bit * 16kHz * 1 channel
        },
        ios: {
          extension: '.pcm',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000, // 16-bit * 16kHz * 1 channel
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/pcm',
          bitsPerSecond: 256000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setIsRecording(true);
      setRecording(recording);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      // Get the recording URI
      const uri = recording.getURI();

      if (uri) {
        // Convert audio file to base64
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Send the base64 audio data
        onAudioData(base64Audio);

        // Clean up the temporary file
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      // Clear the recording object
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      // Even on error, clear the recording object
      setRecording(null);
    }
  };

  const cleanup = async () => {
    console.log('🧹 Cleaning up microphone...');
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    } finally {
      setRecording(null);
      setIsRecording(false);
    }
  }

  return {
    isRecording,
    isPermissionGranted,
    startRecording,
    stopRecording,
    requestPermissions,
    cleanup,
  };
};