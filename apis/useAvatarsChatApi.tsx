import axios from "axios";

export const useApiAvatarsAdk = () => {
  const startWsSession = async (sessionId: string, agentId: string) => {
    const response = await axios.post(`https://inference.cogit-lab.com/inferenceRT/initialize_websocket`, {
      session_id: sessionId,
      agent_id: agentId,
    });
    return response.data;
  };

  const closeWsSession = async (sessionId: string) => {
    const response = await axios.post(`https://inference.cogit-lab.com/inferenceRT/close_websocket`, {
      session_id: sessionId,
    });
    return response.data;
  };

  const getAvatars = async (params: {
    sort_by?: "id" | "user_id" | "avatar_agent_id" | "name" | "voice_provider" | "instructions" | "source_url" | "thumbnail" | "idle_video" | "driver_url" | "preview_url" | "preview_thumbnail" | "instructions" | "document_paths" | "llm_version" | "preview_text" | "knowledge_info" | "url_scraping" | "created_at" | "updated_at";
    sort_order?: string | null;
    page?: number;
    per_page?: number;
  }) => {
    const response = await axios.get(`/avatars_vx`, {
      params,
    });
    return response.data;
  };

  const getAvatar = async (avatarId: string) => {
    const response = await axios.get(`/avatars_vx/${avatarId}`);
    return response.data;
  };

  return {
    getAvatars,
    getAvatar,
    startWsSession,
    closeWsSession,
  };
};
