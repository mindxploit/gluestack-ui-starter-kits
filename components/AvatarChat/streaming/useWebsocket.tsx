import { useApiAvatarsAdk } from "@/apis/useAvatarsChatApi";
import { useCallback, useEffect, useRef, useState } from "react";

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
const useWebsocket = (
  userId: string | null,
  agentId: string | null,
  initialSessionId: string | null,
  setMessages: React.Dispatch<React.SetStateAction<IChat>>,
  addMessageToChat: (message: string, fromMe: boolean) => void,
  addMessageToQueue: (message: string, fromMe: boolean) => void,
) => {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessageId, setLastMessageId] = useState<string | null>(null);
  const { startWsSession, closeWsSession } = useApiAvatarsAdk();

  const socketUrl = "wss://api.cogit-lab.com/inferenceRT/ws/" + sessionId + "/" + agentId;
  const websocket = useRef<WebSocket | null>(null);

  // Initialize session ID
  useEffect(() => {
    if (!initialSessionId) {
      // Generate a random session ID for React Native
      const newSessionId = Math.round(Math.random() * 10000).toString();
      setSessionId(newSessionId);
    } else {
      setSessionId(initialSessionId);
    }
  }, [initialSessionId]);

  const connectSocket = useCallback(() => {
    if (!sessionId || !agentId) {
      return;
    }

    // Close existing connection before creating new one -- could be removed?
    // websocket.current?.close();
    // if (websocket.current && websocket.current.readyState === WebSocket.OPEN) {
    //   return
    // }

    // Create new socket connection
    websocket.current = new WebSocket(socketUrl);
    console.log("🔗 [Socket] Attemping to connect to server, sessionId:", sessionId, "agentId:", agentId);
    console.log("🔗 [Socket] websocket obj:", websocket.current);

    // Handle connection
    websocket.current.onopen = () => {
      console.log("👍🏻 [Socket] Connected to server");
      startWsSession(sessionId, agentId);
      setIsConnected(true);
    };

    // Handle disconnection
    websocket.current.onclose = () => {
      console.log("🔗 [Socket] Disconnected from server");
      setIsConnected(false);
    };

    // Handle incoming messages
    websocket.current.onmessage = (event: MessageEvent) => {
      const messageFromServer = JSON.parse(event.data);
      // Check if turn is complete
      if (messageFromServer.turn_complete && messageFromServer.turn_complete === true) {
        setLastMessageId(messageFromServer.id_msg);
      }

      // Handle user input text (transcribed from audio)
      if (messageFromServer.mime_type === "text/plain/input") {
        console.log("📝 [Socket] User input text:", messageFromServer.data);
        addMessageToChat(messageFromServer.data, true);
      }

      // Handle text response from agent
      if (messageFromServer.mime_type === "text/plain/output") {
        console.log("📝 [Socket] Agent response:", messageFromServer.data);

        // Handle video mode (queue messages)
        addMessageToQueue(messageFromServer.data, false);
        // Handle text mode (stream messages)
        // setMessages((prevChat: IChat) => {
        //   const lastMessage = prevChat.messages[prevChat.messages.length - 1];

        //   // Append to last message if it's from agent
        //   if (lastMessage && lastMessage.fromMe === false) {
        //     return {
        //       ...prevChat,
        //       messages: prevChat.messages.map((message: IChatMessage, index: number) => {
        //         if (index === prevChat.messages.length - 1) {
        //           return {
        //             ...message,
        //             message: message.message + messageFromServer.data,
        //           };
        //         }
        //         return message;
        //       }),
        //     };
        //   } else {
        //     // Create new message from agent
        //     return {
        //       ...prevChat,
        //       messages: [
        //         ...prevChat.messages,
        //         {
        //           id: messageFromServer.id_msg,
        //           message: messageFromServer.data,
        //           fromMe: false,
        //           sendAt: new Date(),
        //         },
        //       ],
        //     };
        //   }
        // });
      }
    };

    // Handle errors
    websocket.current.onerror = (error: any) => {
      console.error("❌ [Socket] Error:", error);
    };

  }, [sessionId, agentId, userId, setMessages, addMessageToChat, addMessageToQueue]);

  // Connect when session ID is available
  useEffect(() => {
    if (sessionId && agentId) {
      connectSocket();
    }
  }, [sessionId, agentId, connectSocket]);

  // Send text message
  const onTextSubmit = useCallback((message: string) => {
    if (!message.trim() || !websocket.current) {
      return false;
    }

    // Add user message to chat
    addMessageToChat(message, true);

    // Send message to server
    websocket.current.send(JSON.stringify({
      mime_type: "text/plain",
      data: message,
      sessionId,
      agentId,
      userId
    }));

    return true;
  }, [sessionId, agentId, userId, addMessageToChat]);

  // Cleanup function
  const cleanup = useCallback(() => {
    console.log("🧹 [Socket] Starting cleanup...");

    if (websocket.current) {
      websocket.current.close();
      websocket.current = null;
    }

    setIsConnected(false);
    console.log("✅ [Socket] Cleanup completed");
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🔄 [Socket] Component unmounting, performing cleanup...");
      cleanup();
    };
  }, [cleanup]);

  return {
    onTextSubmit,
    cleanup,
    isConnected,
    sessionId,
    userId,
    lastMessageId,
  };
};

export { useWebsocket };