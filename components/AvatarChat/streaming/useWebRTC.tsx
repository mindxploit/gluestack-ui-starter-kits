import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  MediaStream,
  mediaDevices,
} from 'react-native-webrtc';

// Define type for signaling messages
interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate";
  sdp?: string;
  candidate?: any; // RTCIceCandidateInit equivalent for react-native-webrtc
}

export function useStreamWebRTC(agentId: number, sessionId: string) {
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamTextResponse, setStreamTextResponse] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  const stopStream = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }
    setRemoteStream(null);
    setIsStreaming(false);
    setIsConnecting(false);
  };
  // Process WebRTC signaling
  const processSignaling = async (message: SignalingMessage) => {
    if (!peerConnection) return;

    try {
      if (message.type === "offer" && message.sdp) {
        await peerConnection.setRemoteDescription(
          new RTCSessionDescription({
            type: "offer",
            sdp: message.sdp,
          })
        );
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        // Return answer to be sent to server
        return {
          type: "answer",
          sdp: answer.sdp,
        };
      } else if (message.type === "ice-candidate" && message.candidate) {
        await peerConnection.addIceCandidate(
          new RTCIceCandidate(message.candidate)
        );
      }
    } catch (error) {
      console.error("Error processing signaling:", error);
    }
  };

  // Setup WebRTC connection
  const setupStream = async (msgId: string) => {
    try {
      console.log("Setting up WebRTC stream... with msgId:", msgId);
      stopStream();
      setIsConnecting(true);

      // Create new RTCPeerConnection with STUN and TURN servers
      const pc = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
          // Restore TURN server
          {
            urls: "turn:openrelay.metered.ca:80",
            username: "openrelayproject",
            credential: "openrelayproject",
          },
        ],
      });

      // --- Data Channel Trick ---
      // Create a dummy data channel before creating the offer (needed for compatibility)
      try {
        pc.createDataChannel("dummy");
        console.log("Dummy data channel created.");
      } catch (e) {
        console.error("Failed to create dummy data channel:", e);
      }
      // ---------------------------------


      // Handle incoming tracks
      (pc as any).ontrack = (event: any) => {
        if (event.streams && event.streams.length > 0) {
          const stream = event.streams[0];
          setRemoteStream(stream);
          setIsConnecting(false);
          // console.log("Remote stream set successfully");
        }

        // Handle track events
        event.track.onmute = () => {
          // console.log(`${event.track.kind} track muted`);
        };
        event.track.onunmute = () => {
          // console.log(`${event.track.kind} track unmuted`);
        };
        event.track.onended = () => {
          // console.log(`${event.track.kind} track ended`);
        };
      };

      // Handle data channel messages - exact same as web version
      (pc as any).ondatachannel = (event: any) => {
        console.log("Data channel opened:", event.channel.label);

        // see if video is actually playing
        if (event.channel.label === "isPlaybackStarted") {
          event.channel.onmessage = (event: any) => {
            if (event.data === "true") {
              console.log("Playback started");
              setIsStreaming(true);
            }
          };
        }

        if (event.channel.label === "isPlaybackFinished") {
          event.channel.onmessage = (event: any) => {
            if (event.data === "true") {
              console.log("Playback finished");
              stopStream();
            }
          };
        }
      };

      // Collect candidates (trickle ICE is implicitly handled by the server)
      (pc as any).onicecandidate = (event: any) => {
        if (event.candidate) {
        } else {
          console.log("ICE gathering complete");
        }
      };

      // Handle connection state changes
      (pc as any).onconnectionstatechange = () => {
        console.log("Connection state:", (pc as any).connectionState);
        switch ((pc as any).connectionState) {
          case "connected":
            setIsConnecting(false);
            break;
          case "disconnected":
          case "failed":
          case "closed":
            stopStream();
            break;
        }
      };

      setPeerConnection(pc);

      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      console.log("Created offer with audio and video support");

      try {
        await pc.setLocalDescription(offer);
      } catch (error) {
        console.error("Error setting local description:", error);
        // Handle the error appropriately, maybe stop the setup process
        setIsConnecting(false);
        pc.close();
        return; // Stop execution if setLocalDescription fails
      }


      try {
        const finalSdp = pc.localDescription?.sdp;
        const finalType = pc.localDescription?.type;

        if (!finalSdp || !finalType) {
          throw new Error(
            `Invalid local description after ICE gathering wait: SDP length ${finalSdp?.length}, type ${finalType}`
          );
        }

        console.log("Sending WebRTC offer to server:", {
          msg_id: msgId,
          session_id: sessionId,
          client_id: agentId ?? 101,
          sdp_length: finalSdp?.length,
        });

        const { data } = await axios.post(`https://inference.cogit-lab.com/inferenceRT/handle_live`, {
          sdp: finalSdp,
          type: finalType,
          msg_id: msgId,
          session_id: sessionId,
          client_id: agentId ?? 101,
        });

        await pc.setRemoteDescription(data.webrtc_offer);
        console.log("Connection established successfully 💪🏻");
      } catch (error: any) {
        console.error("Error sending offer to server:", error);
        if (error.response) {
          console.error("Server response:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            headers: error.response.headers
          });
        } else if (error.request) {
          console.error("Request made but no response received:", error.request);
        } else {
          console.error("Error setting up request:", error.message);
        }
        pc.close();
        setIsStreaming(false);
        setIsConnecting(false);
      }
    } catch (error) {
      console.error("Error setting up WebRTC:", error);
      setIsStreaming(false);
      setIsConnecting(false);
    }
  };



  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return {
    remoteStream,
    isStreaming,
    setupStream,
    stopStream,
    isConnecting,
    processSignaling,
    streamTextResponse,
    setStreamTextResponse,
    isAudioMuted,
    setIsAudioMuted,
  };
}
