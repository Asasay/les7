export function ConnectionManager({ socket }) {
  return (
    <div className="flex justify-around mt-2">
      <button
        className="border-slate-600 border p-1 px-2"
        onClick={() => socket.connect()}
      >
        Connect
      </button>
      <button
        className="border-slate-600 border p-1 px-2"
        onClick={() => socket.disconnect()}
      >
        Disconnect
      </button>
    </div>
  );
}
