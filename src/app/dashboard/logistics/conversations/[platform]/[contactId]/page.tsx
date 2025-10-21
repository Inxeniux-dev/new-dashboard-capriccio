"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRequireAuth } from "@/contexts/AuthContext";
import ChatWindow from "@/components/Chat/ChatWindow";
import apiClient from "@/lib/api-client";
import type { Conversation, Platform } from "@/types/api";
import { ArrowLeft } from "lucide-react";

export default function ConversationDetailPage() {
  const { loading } = useRequireAuth(["logistics", "logistica", "admin"]);
  const params = useParams();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loadingConversation, setLoadingConversation] = useState(true);

  useEffect(() => {
    if (params?.platform && params?.contactId) {
      loadConversation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params?.platform, params?.contactId]);

  const loadConversation = async () => {
    try {
      setLoadingConversation(true);
      const platform = params?.platform as Platform;
      const contactId = params?.contactId as string;

      console.log("Loading conversation for:", { platform, contactId });

      // Try to get the conversation details
      try {
        const response = await apiClient.conversations.getByPlatformAndContact(platform, contactId);

        if (response.data?.conversation) {
          setConversation(response.data.conversation);
        } else if (response.data?.messages) {
          // Create a conversation object from the response
          const conversationData: Conversation = {
            id: `${platform}-${contactId}`,
            platform,
            contact_id: contactId,
            contact_name: contactId,
            contact_phone: "",
            last_message: response.data.messages[0]?.message_content || "",
            last_message_time: response.data.messages[0]?.timestamp || new Date().toISOString(),
            unread_count: 0,
            conversation_status: "active",
            ai_enabled: false,
            assigned_to: null,
            metadata: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setConversation(conversationData);
        }
      } catch (error) {
        console.error("Error loading conversation details:", error);

        // Create a basic conversation object as fallback
        const fallbackConversation: Conversation = {
          id: `${platform}-${contactId}`,
          platform,
          contact_id: contactId,
          contact_name: decodeURIComponent(contactId),
          contact_phone: "",
          last_message: "",
          last_message_time: new Date().toISOString(),
          unread_count: 0,
          conversation_status: "active",
          ai_enabled: false,
          assigned_to: null,
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setConversation(fallbackConversation);
      }
    } catch (error) {
      console.error("Error in loadConversation:", error);
    } finally {
      setLoadingConversation(false);
    }
  };

  if (loading || loadingConversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando conversación...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar la conversación</p>
          <button
            onClick={() => router.push("/dashboard/logistics/conversations")}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            <ArrowLeft size={18} />
            Volver a conversaciones
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col p-6">
      <div className="mb-4 flex items-center gap-4">
        <button
          onClick={() => router.push("/dashboard/logistics/conversations")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Conversación</h1>
          <p className="text-gray-600">
            {conversation.contact_name} - {conversation.platform}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ChatWindow
          conversation={conversation}
          onBack={() => router.push("/dashboard/logistics/conversations")}
        />
      </div>
    </div>
  );
}