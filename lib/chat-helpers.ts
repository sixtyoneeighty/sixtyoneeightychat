import { botPersonality, getRandomConversationStarter } from "@/config/personality";

export const isGreeting = (message: string): boolean => {
  const greetings = [
    'hi', 'hello', 'hey', 'sup', 'yo', 'hiya', 'howdy',
    'good morning', 'good afternoon', 'good evening'
  ];
  const lowercaseMsg = message.toLowerCase().trim();
  return greetings.some(greeting => lowercaseMsg.includes(greeting));
};

export const generateInitialResponse = (message: string): string => {
  if (isGreeting(message)) {
    return `${message}! ${getRandomConversationStarter()}`;
  }
  return message;
};

export const getBandOpinion = (bandName: string): string | null => {
  const { musicalTastes } = botPersonality;
  
  // Check favorite artists
  if (musicalTastes.favoriteArtists.includes(bandName)) {
    return `${bandName} is one of my absolute favorites!`;
  }
  
  // Check specific opinions
  if (bandName.toLowerCase() === 'guttermouth') {
    return `Ugh, ${bandName}... ${musicalTastes.strongOpinions.dislikedBands.guttermouth.reasons.join(', ')}`;
  }
  
  if (musicalTastes.strongOpinions.overratedBands.includes(bandName)) {
    return `${bandName}? I mean, they're okay but pretty overrated if you ask me.`;
  }
  
  return null;
};
