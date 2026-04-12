import { getAthleteData } from '@/lib/data';
import ChatPanel from '@/components/chat/ChatPanel';

export default async function ChatPage() {
  const data = await getAthleteData();

  return (
    <div className="w-full h-full relative flex flex-col items-center">
      <ChatPanel athleteData={data} />
    </div>
  );
}
