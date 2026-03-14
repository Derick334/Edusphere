import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Send, Users, School, BookOpen, 
  Loader2, Plus, Search, Image, Paperclip
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Chat() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeRoom, setActiveRoom] = useState(null);
  const [rooms, setRooms] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom);
      
      // Subscribe to new messages
      const unsubscribe = base44.entities.ChatMessage.subscribe((event) => {
        if (event.data.room_id === activeRoom.id) {
          if (event.type === 'create') {
            setMessages(prev => [...prev, event.data]);
          }
        }
      });

      return () => unsubscribe();
    }
  }, [activeRoom]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      const students = await base44.entities.Student.filter({ user_id: userData.id });
      if (students.length > 0) {
        setProfile(students[0]);
        
        // Create default rooms based on student's school and class
        const defaultRooms = [
          {
            id: `school_${students[0].school_id || 'general'}`,
            name: 'School Chat',
            type: 'school',
            icon: School
          },
          {
            id: `class_${students[0].grade_class || 'general'}`,
            name: students[0].grade_class || 'Class Chat',
            type: 'class',
            icon: Users
          },
          {
            id: 'general_study',
            name: 'Study Group',
            type: 'subject',
            icon: BookOpen
          }
        ];
        setRooms(defaultRooms);
        setActiveRoom(defaultRooms[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (room) => {
    try {
      const roomMessages = await base44.entities.ChatMessage.filter(
        { room_id: room.id },
        'created_date',
        50
      );
      setMessages(roomMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending || !activeRoom) return;

    setSending(true);
    try {
      await base44.entities.ChatMessage.create({
        sender_id: user.id,
        sender_name: profile?.full_name || user.full_name,
        sender_role: 'student',
        room_type: activeRoom.type,
        room_id: activeRoom.id,
        message: newMessage.trim()
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const groupMessagesByDate = (messages) => {
    const groups = {};
    messages.forEach(msg => {
      const date = formatDate(msg.created_date);
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
    });
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="h-[calc(100vh-4rem)] flex">
      {/* Sidebar - Chat Rooms */}
      <div className="w-72 border-r border-slate-200 bg-white hidden lg:block">
        <div className="p-4 border-b border-slate-200">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Chats
          </h2>
        </div>
        
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="p-2 space-y-1">
            {rooms.map(room => (
              <button
                key={room.id}
                onClick={() => setActiveRoom(room)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  activeRoom?.id === room.id
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                  activeRoom?.id === room.id ? 'bg-blue-100' : 'bg-slate-100'
                }`}>
                  <room.icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{room.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{room.type}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {/* Chat Header */}
        <div className="bg-white border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            {activeRoom && (
              <>
                <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                  <activeRoom.icon className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">{activeRoom.name}</h3>
                  <p className="text-sm text-slate-500">{messages.length} messages</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {Object.entries(groupedMessages).map(([date, dateMessages]) => (
            <div key={date}>
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-white rounded-full text-xs text-slate-500 shadow-sm">
                  {date}
                </span>
              </div>
              
              <AnimatePresence mode="popLayout">
                {dateMessages.map((msg, index) => {
                  const isOwnMessage = msg.sender_id === user?.id;
                  
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex mb-4 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
                        {!isOwnMessage && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-slate-200 text-slate-600 text-xs">
                              {msg.sender_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          {!isOwnMessage && (
                            <p className="text-xs text-slate-500 mb-1">{msg.sender_name}</p>
                          )}
                          <div className={`rounded-2xl px-4 py-2 ${
                            isOwnMessage 
                              ? 'bg-blue-600 text-white rounded-tr-sm' 
                              : 'bg-white shadow-sm rounded-tl-sm'
                          }`}>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-right' : ''} text-slate-400`}>
                            {formatTime(msg.created_date)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
          
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <MessageSquare className="h-12 w-12 mb-3" />
              <p>No messages yet</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </ScrollArea>

        {/* Message Input */}
        <div className="bg-white border-t border-slate-200 p-4">
          <form onSubmit={sendMessage} className="flex gap-3">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
              disabled={sending}
            />
            <Button type="submit" disabled={!newMessage.trim() || sending}>
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Mobile Room Selector */}
      <div className="lg:hidden fixed bottom-20 left-4 right-4 bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
        <div className="flex gap-2 overflow-x-auto">
          {rooms.map(room => (
            <button
              key={room.id}
              onClick={() => setActiveRoom(room)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap ${
                activeRoom?.id === room.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              <room.icon className="h-4 w-4" />
              {room.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}