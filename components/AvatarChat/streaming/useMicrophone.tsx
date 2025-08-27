import { useEffect, useState } from "react";
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

  const sendInChunks = async (interval: number) => {
    if (recording && isRecording) {
      setTimeout(async () => {
        await stopAndSendRecording();
      }, interval);
    } else {
      startRecording();
    }
  }

  useEffect(() => {
    sendInChunks(3000);
  }, [recording]);

  const startRecording = async () => {
    if (recording) {
      await stopAndSendRecording();
      await startRecording();
    }

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

  const sendRecording = async () => {
    if (!recording) return;
    const uri = recording.getURI();

    if (uri) {
      // Convert audio file to base64
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send the base64 audio data
      onAudioData(base64Audio);

      // Clean up 
      await FileSystem.deleteAsync(uri, { idempotent: true });
      setRecording(null);
    }
  }

  const stopAndSendRecording = async () => {
    try {
      if (!recording) return;
      console.log('stopping and sending recording ...');
      console.log(recording.getURI());

      await recording.stopAndUnloadAsync();
      setIsRecording(false);

      await sendRecording();

    } catch (error) {
      console.error('Error stopping recording:', error);
      // Even on error, clear the recording object
      setRecording(null);
    }
  };

  return {
    isRecording,
    isPermissionGranted,
    startRecording,
    stopAndSendRecording,
    requestPermissions,
  };
};