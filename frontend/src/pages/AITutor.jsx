import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { 
  Brain, Send, Volume2, VolumeX, Sparkles, 
  MessageSquare, Loader2, RefreshCw, Copy, Check,
  Lightbulb, BookOpen, Calculator
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function AITutor() {
  const [user, setUser] = useState(null);
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [playingVoice, setPlayingVoice] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState('general');
  const [selectedAI, setSelectedAI] = useState('chatgpt');
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const subjects = [
    { value: 'general', label: 'General' },
    { value: 'mathematics', label: 'Mathematics' },
    { value: 'physics', label: 'Physics' },
    { value: 'chemistry', label: 'Chemistry' },
    { value: 'biology', label: 'Biology' },
    { value: 'english', label: 'English' },
    { value: 'kiswahili', label: 'Kiswahili' },
    { value: 'history', label: 'History' },
    { value: 'geography', label: 'Geography' },
  ];

  const aiProviders = [
    { value: 'chatgpt', label: 'ChatGPT', icon: '🤖' },
    { value: 'gemini', label: 'Gemini', icon: '✨' },
    { value: 'perplexity', label: 'Perplexity', icon: '🔍' },
  ];

  const suggestedQuestions = [
    { text: "Explain photosynthesis in simple terms", icon: Lightbulb, subject: 'biology' },
    { text: "Solve: 2x + 5 = 15", icon: Calculator, subject: 'mathematics' },
    { text: "What caused World War 1?", icon: BookOpen, subject: 'history' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const loadData = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      
      // Load recent conversations
      const convos = await base44.entities.AIConversation.filter(
        { user_id: userData.id },
        '-created_date',
        10
      );
      setConversations(convos);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    setLoading(true);
    const currentQuestion = question;
    setQuestion('');

    try {
      // Create optimistic conversation entry
      const tempConvo = {
        id: 'temp-' + Date.now(),
        question: currentQuestion,
        subject: selectedSubject,
        ai_provider: selectedAI,
        response: null,
        loading: true
      };
      setConversations(prev => [...prev, tempConvo]);

      // Call AI
      const systemPrompt = selectedSubject !== 'general' 
        ? `You are an expert ${selectedSubject} tutor for Kenyan students. Explain concepts clearly and provide step-by-step solutions when needed. Use examples relevant to the Kenyan curriculum.`
        : 'You are a helpful educational AI tutor for Kenyan students. Provide clear, detailed explanations with examples.';

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `${systemPrompt}\n\nStudent's question: ${currentQuestion}`,
        add_context_from_internet: selectedAI === 'perplexity'
      });

      // Save to database
      const savedConvo = await base44.entities.AIConversation.create({
        user_id: user.id,
        question: currentQuestion,
        subject: selectedSubject,
        ai_provider: selectedAI,
        response: response,
        has_voice: false
      });

      // Update conversations
      setConversations(prev => 
        prev.map(c => c.id === tempConvo.id ? savedConvo : c)
      );
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to get response. Please try again.');
      setConversations(prev => prev.filter(c => c.id !== 'temp-' + Date.now()));
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceExplanation = async (convo) => {
    if (playingVoice === convo.id) {
      window.speechSynthesis.cancel();
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(convo.id);
    
    // Use browser's speech synthesis
    const utterance = new SpeechSynthesisUtterance(convo.response);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setPlayingVoice(null);
    utterance.onerror = () => setPlayingVoice(null);
    
    window.speechSynthesis.speak(utterance);
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="p-4 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">AI Tutor</h1>
            <p className="text-slate-500">Get instant answers with voice explanations</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map(subject => (
              <SelectItem key={subject.value} value={subject.value}>
                {subject.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex bg-slate-100 rounded-lg p-1">
          {aiProviders.map(ai => (
            <button
              key={ai.value}
              onClick={() => setSelectedAI(ai.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedAI === ai.value
                  ? 'bg-white shadow text-slate-900'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {ai.icon} {ai.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Questions */}
      {conversations.length === 0 && (
        <div className="mb-8">
          <p className="text-sm text-slate-500 mb-3">Try asking:</p>
          <div className="grid sm:grid-cols-3 gap-3">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => {
                  setQuestion(q.text);
                  setSelectedSubject(q.subject);
                }}
                className="p-4 bg-white border border-slate-200 rounded-xl text-left hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <q.icon className="h-5 w-5 text-slate-400 group-hover:text-blue-500 mb-2" />
                <p className="text-sm text-slate-700">{q.text}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div className="space-y-6 mb-6">
        <AnimatePresence mode="popLayout">
          {conversations.map((convo) => (
            <motion.div
              key={convo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {/* Question */}
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-sm px-5 py-3 max-w-[80%]">
                  <p>{convo.question}</p>
                </div>
              </div>

              {/* Answer */}
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg bg-violet-100 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-violet-600" />
                </div>
                <Card className="flex-1 border-slate-200">
                  <CardContent className="p-4">
                    {convo.loading ? (
                      <div className="flex items-center gap-3 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <>
                        <div className="prose prose-sm max-w-none text-slate-700">
                          <ReactMarkdown>{convo.response}</ReactMarkdown>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleVoiceExplanation(convo)}
                            className="text-slate-600"
                          >
                            {playingVoice === convo.id ? (
                              <>
                                <VolumeX className="h-4 w-4 mr-1" />
                                Stop
                              </>
                            ) : (
                              <>
                                <Volume2 className="h-4 w-4 mr-1" />
                                Listen
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(convo.response, convo.id)}
                            className="text-slate-600"
                          >
                            {copiedId === convo.id ? (
                              <Check className="h-4 w-4 mr-1" />
                            ) : (
                              <Copy className="h-4 w-4 mr-1" />
                            )}
                            Copy
                          </Button>
                          <span className="text-xs text-slate-400 ml-auto">
                            {convo.ai_provider?.toUpperCase()}
                          </span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="sticky bottom-4">
        <form onSubmit={handleSubmit} className="relative">
          <Card className="border-slate-200 shadow-lg">
            <CardContent className="p-4">
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask any question... (e.g., Explain the water cycle, Solve 3x² - 12 = 0)"
                className="border-0 resize-none focus-visible:ring-0 p-0 text-base min-h-[60px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-400">Press Enter to send, Shift+Enter for new line</p>
                <Button 
                  type="submit" 
                  disabled={!question.trim() || loading}
                  className="bg-gradient-to-r from-violet-600 to-purple-600"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Ask
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}