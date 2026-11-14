import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, User, Check, CheckCheck, Clock } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import api from '../../services/api';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConversation, setActiveConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoadingConv, setIsLoadingConv] = useState(true);
  const [socket, setSocket] = useState<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Setup Socket.IO connection
  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);

    if (user) {
      s.emit('join_user', user.id);
    }

    s.on('new_message', (msg: any) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      s.disconnect();
    };
  }, [user]);

  // Fetch conversations
  const fetchConversations = () => {
    setIsLoadingConv(true);
    api
      .get('/chat/conversations')
      .then((res) => {
        setConversations(res.data || []);
        if (res.data?.length > 0 && !activeConversation) {
          selectConversation(res.data[0]);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoadingConv(false));
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const selectConversation = (conv: any) => {
    setActiveConversation(conv);
    if (socket) {
      socket.emit('join_conversation', conv.id);
    }

    api
      .get(`/chat/conversations/${conv.id}/messages`)
      .then((res) => setMessages(res.data || []))
      .catch(() => {});
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversation) return;

    const text = inputText.trim();
    setInputText('');

    try {
      const res = await api.post(`/chat/conversations/${activeConversation.id}/messages`, {
        text,
      });

      if (socket) {
        socket.emit('send_message', {
          conversationId: activeConversation.id,
          message: res.data,
        });
      } else {
        setMessages((prev) => [...prev, res.data]);
      }
    } catch (err) {
      console.error('Failed to send message', err);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-warm-border shadow-sm overflow-hidden flex flex-col h-[calc(100vh-10rem)] min-h-[500px]">
      <div className="flex-1 flex overflow-hidden">
        {/* Left Conversations Sidebar */}
        <div className="w-80 border-r border-warm-border flex flex-col">
          <div className="p-4 border-b border-warm-border">
            <h2 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-agri-dark" />
              <span>Direct Messages</span>
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {isLoadingConv ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading chats...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active conversations yet. Conversations initiate when placing bids or orders.
              </div>
            ) : (
              conversations.map((c) => {
                const isSelected = activeConversation?.id === c.id;
                return (
                  <div
                    key={c.id}
                    onClick={() => selectConversation(c)}
                    className={`p-3.5 cursor-pointer transition flex items-center gap-3 ${
                      isSelected ? 'bg-agri-50/70 border-l-4 border-agri-dark' : 'hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={c.otherUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Chat'}
                      alt={c.otherUser?.name}
                      className="w-10 h-10 rounded-full border border-slate-200 bg-white shrink-0"
                    />
                    <div className="overflow-hidden flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {c.otherUser?.name}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(c.lastMessageAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Active Message Thread */}
        <div className="flex-1 flex flex-col bg-[#fdfdfc]">
          {activeConversation ? (
            <>
              {/* Chat Thread Header */}
              <div className="p-4 bg-white border-b border-warm-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={activeConversation.otherUser?.avatarUrl || 'https://api.dicebear.com/7.x/bottts/svg?seed=Chat'}
                    alt={activeConversation.otherUser?.name}
                    className="w-9 h-9 rounded-full border border-slate-200"
                  />
                  <div>
                    <h3 className="font-extrabold text-xs text-slate-900">
                      {activeConversation.otherUser?.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase">
                      {activeConversation.otherUser?.role} • Direct Trade Channel
                    </p>
                  </div>
                </div>

                {activeConversation.listing && (
                  <span className="text-xs font-bold text-agri-800 bg-agri-100 px-2.5 py-1 rounded-lg">
                    {activeConversation.listing.cropName} (₹{activeConversation.listing.pricePerKg}/kg)
                  </span>
                )}
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    No messages in this conversation yet. Send a greeting to initiate trade discussion.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isMe = m.senderId === user?.id;
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isMe
                              ? 'bg-agri-dark text-white rounded-br-none'
                              : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                          }`}
                        >
                          <p>{m.text}</p>
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1">
                          {new Date(m.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Box */}
              <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-warm-border flex gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message regarding produce quality, delivery, or pricing..."
                  className="flex-1 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-agri-leaf"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-agri-dark hover:bg-agri-forest shadow transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MessageSquare className="w-12 h-12 mb-2 text-slate-300" />
              <p className="text-xs font-bold text-slate-700">Select a Conversation</p>
              <p className="text-[11px] text-slate-400">Choose a chat from the left to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
