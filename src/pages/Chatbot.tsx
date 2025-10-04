import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mic, MessageSquare } from 'lucide-react';
import { VoiceMode } from '@/components/VoiceMode';
import { ChatMode } from '@/components/ChatMode';

const Chatbot = () => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Coach
        </h1>
        <p className="text-muted-foreground mt-1">Get personalized fitness advice powered by AI</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="voice" className="gap-2">
            <Mic className="w-4 h-4" />
            Voice Mode
          </TabsTrigger>
          <TabsTrigger value="chat" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Chat Mode
          </TabsTrigger>
        </TabsList>

        <TabsContent value="voice" className="mt-6">
          <VoiceMode />
        </TabsContent>

        <TabsContent value="chat" className="mt-6">
          <ChatMode />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chatbot;
