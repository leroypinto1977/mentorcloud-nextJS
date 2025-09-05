import VoiceComponent from "@/components/VoiceComponent";
export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute -z-10 top-20 left-10 w-[400px] h-[400px] rounded-full bg-gray-200/30 dark:bg-gray-700/30 blur-[100px] animate-pulse" />
      <div className="absolute -z-10 bottom-20 right-10 w-[300px] h-[300px] rounded-full bg-gray-300/20 dark:bg-gray-600/20 blur-[80px] animate-pulse delay-1000" />

      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 dark:text-gray-200 mb-4">
            MentorCloud Voice Agent
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Experience natural conversations with our AI assistant through voice
            chat
          </p>
        </div>

        <VoiceComponent />

        <div className="text-center mt-8">
          <small className="text-sm text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-800/80 px-4 py-2 rounded-full backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            The app requires microphone access to work properly
          </small>
        </div>
      </div>
    </main>
  );
}
