export default function AppLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      <div className="h-14 rounded-xl bg-gray-800/70" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="h-28 rounded-xl bg-gray-800/70" />
        <div className="h-28 rounded-xl bg-gray-800/70" />
        <div className="h-28 rounded-xl bg-gray-800/70" />
        <div className="h-28 rounded-xl bg-gray-800/70" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-64 rounded-xl bg-gray-800/70" />
        <div className="h-64 rounded-xl bg-gray-800/70" />
      </div>
    </div>
  );
}
