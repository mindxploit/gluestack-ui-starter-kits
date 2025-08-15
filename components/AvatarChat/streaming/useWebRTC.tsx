"use client";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

// Define type for signaling messages
interface SignalingMessage {
  type: "offer" | "answer" | "ice-candidate";
  sdp?: string;
  candidate?: RTCIceCandidateInit;
}

export function useStreamWebRTC(agentId: number) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [peerConnection, setPeerConnection] =
    useState<RTCPeerConnection | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [streamTextResponse, setStreamTextResponse] = useState<string | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const storedSessionId = localStorage.getItem("sessionId");
    if (storedSessionId) {
      setSessionId(storedSessionId);
    } else {
      // Simple timestamp + random number based ID
      const newId = Date.now().toString() + Math.floor(Math.random() * 1000000);
      localStorage.setItem("sessionId", newId);
      setSessionId(newId);
    }
  }, []);

  useEffect(() => {
    if (videoRef.current && isStreaming) {
      videoRef.current.muted = isAudioMuted;
    }
  }, [isAudioMuted, videoRef.current, isStreaming]);

  const playFallbackVideo = () => {
    if (videoRef.current) {
      console.log("Playing fallback video");
      videoRef.current.srcObject = null;
      setIsStreaming(false);
    }
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
      // Clear existing stream before setting up a new one to show poster
      if (peerConnection) {
        peerConnection.close();
      }
      playFallbackVideo();
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

      // --- Safari Data Channel Trick ---
      // Create a dummy data channel before creating the offer
      try {
        pc.createDataChannel("dummy");
        console.log("Dummy data channel created.");
      } catch (e) {
        console.error("Failed to create dummy data channel:", e);
      }
      // ---------------------------------

      // --- Explicitly add transceivers before offer --- Forces Safari/IOS to use the correct transceivers
      pc.addTransceiver("audio", { direction: "recvonly" });
      pc.addTransceiver("video", { direction: "recvonly" });
      console.log("Audio and video transceivers added.");
      // ------------------------------------------------

      // Handle incoming tracks
      pc.ontrack = (event) => {
        if (!videoRef.current) return;
        console.log("ontrack event received, streams:", event.streams);
        videoRef.current.srcObject = event.streams[0];
        // Ensure playsInline is a boolean for React/iOS
        videoRef.current.playsInline = true;
        videoRef.current.muted = isAudioMuted;
        videoRef.current.volume = 1;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current
            ?.play()
            .then(() => {
              setIsStreaming(true);
              setIsConnecting(false);
              console.log("Playback started");
            })
            .catch((err) => {
              console.error("Failed to play:", err);
              setIsStreaming(false);
              setIsConnecting(false);
            });
        };
        event.track.onmute = () => {
          console.log(`${event.track.kind} track muted`);
        };
        event.track.onunmute = () =>
          console.log(`${event.track.kind} track unmuted`);
      };

      // Handle data channel messages
      pc.ondatachannel = (event) => {
        console.log("Data channel opened:", event.channel.label);

        if (event.channel.label === "isPlaybackFinished") {
          event.channel.onmessage = (event) => {
            console.log("Playback finished:", event.data);
            if (event.data === "true") {
              playFallbackVideo();
            }
          };
        }

        if (event.channel.label === "chat") {
          event.channel.onmessage = (event) => {
            console.log("Data channel message received:", event.data);
            setStreamTextResponse(event.data);
          };
        }
      };

      // Collect candidates (trickle ICE is implicitly handled by the server)
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          // console.log(
          //   "Local ICE candidate gathered:",
          //   event.candidate.candidate.substring(0, 30) + "..."
          // );
          // Server handles trickle ICE
        } else {
          // Null candidate signifies completion - this might be captured by the promise below
          // console.log(
          //   "Null ICE candidate received (event listener should handle completion)."
          // );
        }
      };

      // Handle connection state changes
      pc.onconnectionstatechange = () => {
        console.log("Connection state:", pc.connectionState);
        switch (pc.connectionState) {
          case "connected":
            setIsConnecting(false);
            break;
          case "disconnected":
            playFallbackVideo();
          case "failed":
            playFallbackVideo();
          case "closed":
            setIsStreaming(false);
            setIsConnecting(false);
            break;
        }
      };

      setPeerConnection(pc);

      // Create offer
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true,
      });

      // console.log("Setting local description...");
      try {
        await pc.setLocalDescription(offer);
        // console.log("Local description set successfully.");
        // console.log(
        //   "SDP length *immediately* after setLocalDescription:",
        //   pc.localDescription?.sdp?.length
        // );
        // console.log(
        //   "ICE Gathering State *immediately* after setLocalDescription:",
        //   pc.iceGatheringState
        // );
      } catch (error) {
        console.error("Error setting local description:", error);
        // Handle the error appropriately, maybe stop the setup process
        setIsConnecting(false);
        pc.close();
        return; // Stop execution if setLocalDescription fails
      }

      // --- iOS Safari SDP Fix: Wait after setLocalDescription ---
      // console.log(
      //   "Waiting for ICE gathering to complete before sending offer..."
      // );
      // await iceGatheringCompletePromise;
      // console.log(
      //   "ICE gathering finished or timed out. Proceeding to send offer."
      // );
      // -------------------------------------------------------

      try {
        const finalSdp = pc.localDescription?.sdp;
        const finalType = pc.localDescription?.type;

        console.log("Final SDP length after wait:", finalSdp?.length);

        if (!finalSdp || !finalType) {
          throw new Error(
            `Invalid local description after ICE gathering wait: SDP length ${finalSdp?.length}, type ${finalType}`
          );
        }

        const { data } = await axios.post(`https://inference.cogit-lab.com/inferenceRT/handle_live`, {
          sdp: finalSdp,
          type: finalType,
          msg_id: msgId,
          session_id: sessionId,
          client_id: agentId ?? 101,
        });

        await pc.setRemoteDescription(data.webrtc_offer);
        console.log("Connection established successfully");
      } catch (error) {
        console.error("Error sending offer to server:", error);
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

  const stopStream = () => {
    if (peerConnection) {
      peerConnection.close();
      setPeerConnection(null);
    }

    playFallbackVideo();
    setIsStreaming(false);
    setIsConnecting(false); // Ensure connecting is false on stop
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopStream();
    };
  }, []);

  return {
    videoRef,
    isStreaming,
    setupStream,
    stopStream,
    isConnecting,
    processSignaling,
    streamTextResponse,
    setStreamTextResponse,
    isAudioMuted,
    setIsAudioMuted,
    sessionId,
  };
}
