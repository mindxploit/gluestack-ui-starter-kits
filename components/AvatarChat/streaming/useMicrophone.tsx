import { useEffect, useState, useRef, useCallback } from "react";
import { Audio } from "expo-av";
import * as FileSystem from 'expo-file-system';

export const useMicrophone = ({ onAudioData }: { onAudioData: (audioData: string) => void }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  // Use refs to avoid stale closures and manage intervals
  const recordingRef = useRef<Audio.Recording | null>(null);
  const chunkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRecordingRef = useRef(false);

  // Update refs when state changes
  useEffect(() => {
    recordingRef.current = recording;
    isRecordingRef.current = isRecording;
  }, [recording, isRecording]);

  const requestPermissions = async () => {
    const { status } = await Audio.requestPermissionsAsync();
    setIsPermissionGranted(status === 'granted');
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      await startNewRecordingChunk()
      setIsRecording(true);

      startChunkSendingTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const startChunkSendingTimer = useCallback(() => {
    // Clear any existing timer
    if (chunkIntervalRef.current) {
      clearInterval(chunkIntervalRef.current);
    }

    // Send chunks every second
    chunkIntervalRef.current = setInterval(async () => {
      if (isRecordingRef.current && recordingRef.current) {
        await sendCurrentChunk();
      }
    }, 1000);
  }, []);

  const sendCurrentChunk = async () => {
    if (!recordingRef.current) return;

    try {
      // Stop current recording to get the chunk
      await recordingRef.current.stopAndUnloadAsync();

      const uri = recordingRef.current.getURI();
      if (uri) {
        // Convert to base64 and send
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        onAudioData(base64Audio);

        // Clean up the chunk file
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }

      // Start a new recording immediately for the next chunk
      await startNewRecordingChunk();
    } catch (error) {
      console.error('Error sending chunk:', error);
      // Try to restart recording on error
      await startNewRecordingChunk();
    }
  };

  const startNewRecordingChunk = async () => {
    try {
      const { recording: newRecording } = await Audio.Recording.createAsync({
        android: {
          extension: '.pcm',
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
        },
        ios: {
          extension: '.pcm',
          outputFormat: Audio.IOSOutputFormat.LINEARPCM,
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 16000,
          numberOfChannels: 1,
          bitRate: 256000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/pcm',
          bitsPerSecond: 256000,
        },
      });

      setRecording(newRecording);
    } catch (error) {
      console.error('Error starting new chunk recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      // Clear the chunking timer
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
        chunkIntervalRef.current = null;
      }

      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();

        // Send the final chunk
        const uri = recordingRef.current.getURI();
        if (uri) {
          const base64Audio = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          onAudioData(base64Audio);
          await FileSystem.deleteAsync(uri, { idempotent: true });
        }
      }

      setIsRecording(false);
      setRecording(null);
    } catch (error) {
      console.error('Error stopping recording:', error);
      setIsRecording(false);
      setRecording(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (chunkIntervalRef.current) {
        clearInterval(chunkIntervalRef.current);
      }
    };
  }, []);

  return {
    isRecording,
    isPermissionGranted,
    startRecording,
    stopRecording,
    requestPermissions,
  };
};