export function ConnectionState({ isConnected }: { isConnected: boolean }) {
  return (
    <div>
      <p className="text-center text-sm text-gray-900 dark:text-gray-300">
        Connection status: {isConnected ? "connected" : "disconnected"}
      </p>
    </div>
  );
}
