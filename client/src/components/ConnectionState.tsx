export function ConnectionState({ isConnected }: { isConnected: boolean }) {
  return (
    <div>
      <p>Connection status: {isConnected ? "connected" : "disconnected"}</p>
    </div>
  );
}
