import { useState, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const VoiceMode = () => {
  const { toast } = useToast();
  const [isInitializing, setIsInitializing] = useState(false);
  const [agentId, setAgentId] = useState('');
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('Voice conversation connected');
      toast({
        title: 'Connected',
        description: 'Voice AI Coach is ready to talk!',
      });
    },
    onDisconnect: () => {
      console.log('Voice conversation disconnected');
    },
    onError: (error) => {
      console.error('Voice conversation error:', error);
      toast({
        title: 'Error',
        description: 'Voice connection failed. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const startVoiceConversation = async () => {
    try {
      setIsInitializing(true);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // ElevenLabs Conversational AI Agent ID
      const demoAgentId = 'agent_4001k6zexjtyf4dabww1x94xnhzf';
      
      // Get signed URL from our edge function
      const { data, error } = await supabase.functions.invoke('elevenlabs-signed-url', {
        body: { agentId: demoAgentId },
      });

      if (error) throw error;

      if (!data?.signedUrl) {
        throw new Error('Failed to get signed URL');
      }

      // Start conversation with signed URL
      await conversation.startSession({ 
        signedUrl: data.signedUrl 
      });

    } catch (error: any) {
      console.error('Failed to start voice conversation:', error);
      toast({
        title: 'Setup Required',
        description: 'Please create an ElevenLabs Conversational AI agent and add the agent ID to use Voice Mode.',
        variant: 'destructive',
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const stopVoiceConversation = async () => {
    try {
      await conversation.endSession();
      toast({
        title: 'Disconnected',
        description: 'Voice conversation ended',
      });
    } catch (error) {
      console.error('Failed to stop conversation:', error);
    }
  };

  const toggleMute = async () => {
    try {
      const newVolume = conversation.isSpeaking ? 0 : 1;
      await conversation.setVolume({ volume: newVolume });
    } catch (error) {
      console.error('Failed to toggle mute:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[500px] space-y-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-6">
            {/* Visual Indicator */}
            <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${
              conversation.status === 'connected' 
                ? 'bg-primary/20 animate-pulse' 
                : 'bg-muted'
            }`}>
              <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                conversation.isSpeaking 
                  ? 'bg-primary animate-pulse scale-110' 
                  : 'bg-primary/50'
              }`}>
                {conversation.status === 'connected' ? (
                  <Volume2 className="w-12 h-12 text-primary-foreground" />
                ) : (
                  <Mic className="w-12 h-12 text-primary-foreground" />
                )}
              </div>
            </div>

            {/* Status Text */}
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">
                {conversation.status === 'connected' 
                  ? 'Listening...' 
                  : 'Voice AI Coach'}
              </h3>
              <p className="text-sm text-muted-foreground">
                {conversation.status === 'connected'
                  ? conversation.isSpeaking 
                    ? 'AI Coach is speaking'
                    : 'Speak now - I\'m listening'
                  : 'Start a real-time voice conversation'}
              </p>
            </div>

            {/* Controls */}
            <div className="flex gap-3">
              {conversation.status === 'connected' ? (
                <>
                  <Button
                    onClick={stopVoiceConversation}
                    variant="destructive"
                    size="lg"
                    className="gap-2"
                  >
                    <MicOff className="w-5 h-5" />
                    End Conversation
                  </Button>
                  <Button
                    onClick={toggleMute}
                    variant="outline"
                    size="lg"
                  >
                    {conversation.isSpeaking ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                </>
              ) : (
                <Button
                  onClick={startVoiceConversation}
                  disabled={isInitializing}
                  size="lg"
                  className="gap-2"
                >
                  {isInitializing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      Start Voice Chat
                    </>
                  )}
                </Button>
              )}
            </div>

            {/* Setup Instructions */}
            {conversation.status !== 'connected' && (
              <div className="mt-4 p-4 bg-muted rounded-lg text-sm">
                <p className="font-medium mb-2">🎙️ Voice Mode Features:</p>
                <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Real-time conversation with human-like voice</li>
                  <li>Instant fitness & nutrition feedback</li>
                  <li>Natural interruptions supported</li>
                  <li>Personalized workout suggestions</li>
                </ul>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
