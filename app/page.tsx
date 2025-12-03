export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6">
          FixFare
        </h1>
        <p className="text-xl text-gray-700 mb-4">
          Production-ready MVP: Transparent quotes incoming.
        </p>
        <p className="text-sm text-gray-500">
          Phase 0 complete – DB connected.
        </p>
      </div>
    </main>
  );
}
