import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Mic, MicOff, Bot, User as UserIcon, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TypewriterMessage } from '@/components/TypewriterMessage';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

const Chatbot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([{
    role: 'assistant',
    content: "Hi! I'm your Fitgenix AI Coach. I'm here to help you reach your fitness goals. Ask me about workouts, nutrition, or anything fitness-related!",
  }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message to chat
    const newMessages = [...messages, { role: 'user' as const, content: userMessage, timestamp: Date.now() }];
    setMessages(newMessages);

    try {
      // Fetch user profile and recent data
      const [profileRes, workoutsRes, mealsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user?.id).single(),
        supabase.from('workouts').select('*').eq('user_id', user?.id).order('date', { ascending: false }).limit(10),
        supabase.from('meals').select('*').eq('user_id', user?.id).order('date', { ascending: false }).limit(10),
      ]);

      // Call AI chat function
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: newMessages,
          userProfile: profileRes.data,
          recentWorkouts: workoutsRes.data,
          recentMeals: mealsRes.data,
        },
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.error);
      }

      // Add AI response
      const assistantMessage = { role: 'assistant' as const, content: data.message, timestamp: Date.now() };
      setMessages([...newMessages, assistantMessage]);
      
      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(data.message);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to get response from AI Coach',
        variant: 'destructive',
      });
      // Remove the user message on error
      setMessages(messages);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const toggleVoice = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setVoiceEnabled(!voiceEnabled);
  };

  const startRecording = async () => {
    // Use Web Speech API for real-time voice recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in this browser. Please type your message.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      
      setIsRecording(true);
      
      toast({
        title: 'Listening...',
        description: 'Speak now. Tap the microphone again to stop.',
      });

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setInput((prev) => {
          if (finalTranscript) {
            return prev + finalTranscript;
          }
          return prev;
        });
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        toast({
          title: 'Error',
          description: 'Speech recognition failed. Please try again.',
          variant: 'destructive',
        });
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      mediaRecorderRef.current = recognition as any;

    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      toast({
        title: 'Error',
        description: 'Could not start speech recognition',
        variant: 'destructive',
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      try {
        // For Web Speech API
        if (typeof mediaRecorderRef.current.stop === 'function') {
          mediaRecorderRef.current.stop();
        }
      } catch (error) {
        console.error('Error stopping recording:', error);
      }
      setIsRecording(false);
      
      toast({
        title: 'Stopped',
        description: 'You can now send your message or continue speaking',
      });
    }
  };

  const transcribeAudio = async (base64Audio: string) => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      toast({
        title: 'Not Supported',
        description: 'Speech recognition is not supported in this browser',
        variant: 'destructive',
      });
      return;
    }

    toast({
      title: 'Processing...',
      description: 'Converting speech to text',
    });

    // Create a new audio element from the blob to trigger speech recognition
    // For now, we'll use a simpler approach with live recognition
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      toast({
        title: 'Transcribed!',
        description: 'You can now send your message',
      });
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast({
        title: 'Error',
        description: 'Failed to transcribe audio. Please try again.',
        variant: 'destructive',
      });
    };

    // Note: This won't work with the recorded audio blob
    // For proper implementation, we'd need a backend transcription service
    toast({
      title: 'Feature Note',
      description: 'For best results, use the microphone button and speak directly',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Coach
        </h1>
        <p className="text-muted-foreground mt-1">Get personalized fitness advice powered by AI</p>
      </div>

      <Card className="h-[600px] flex flex-col">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <Bot className="w-5 h-5 text-primary-foreground" />
            </div>
            Fitgenix AI Coach
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.role === 'assistant' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                {message.role === 'assistant' ? (
                  <Bot className="w-4 h-4" />
                ) : (
                  <UserIcon className="w-4 h-4" />
                )}
              </div>
              <div className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                <div className={`rounded-lg p-4 ${
                  message.role === 'assistant'
                    ? 'bg-muted'
                    : 'bg-primary text-primary-foreground'
                }`}>
                  {message.role === 'assistant' && message.timestamp ? (
                    <TypewriterMessage content={message.content} speed={30} />
                  ) : (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-muted rounded-lg p-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
        
        <div className="border-t p-4">
          <div className="flex gap-2 mb-2">
            <Button
              onClick={toggleVoice}
              variant={voiceEnabled ? 'default' : 'outline'}
              size="sm"
              className="gap-2"
            >
              {voiceEnabled ? (
                <>
                  <Volume2 className="w-4 h-4" />
                  Voice On
                </>
              ) : (
                <>
                  <VolumeX className="w-4 h-4" />
                  Voice Off
                </>
              )}
            </Button>
            {isSpeaking && (
              <Button
                onClick={stopSpeaking}
                variant="destructive"
                size="sm"
                className="gap-2"
              >
                Stop Speaking
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about fitness..."
              className="resize-none"
              rows={3}
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || isLoading}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                variant={isRecording ? 'destructive' : 'secondary'}
                size="icon"
                disabled={isLoading}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line • Voice recording available
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Chatbot;