export function ConnectionState({ isConnected }: { isConnected: boolean }) {
  return (
    <div>
      <p className="text-center">
        Connection status: {isConnected ? "connected" : "disconnected"}
      </p>
    </div>
  );
}
