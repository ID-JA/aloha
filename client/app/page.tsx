import AudioEmotionDetector from "@/components/AudioEmotionDetector";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-100 to-purple-100 flex items-center justify-center p-4">
      <AudioEmotionDetector />
    </main>
  );
}
