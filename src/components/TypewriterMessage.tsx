import { useTypewriter } from '@/hooks/useTypewriter';

interface TypewriterMessageProps {
  content: string;
  speed?: number;
}

export const TypewriterMessage = ({ content, speed = 15 }: TypewriterMessageProps) => {
  const { displayedText } = useTypewriter(content, speed);
  
  return (
    <p className="whitespace-pre-wrap">
      {displayedText}
      <span className="animate-pulse">|</span>
    </p>
  );
};
