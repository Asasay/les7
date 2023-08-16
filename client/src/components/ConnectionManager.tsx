import { Socket } from "socket.io-client";

export function ConnectionManager({ socket }: { socket: Socket }) {
  return (
    <div className="flex justify-around">
      <button
        type="button"
        onClick={() => socket.connect()}
        className="ease focus:shadow-outline m-2 select-none rounded-md border border-gray-200 bg-gray-200 px-4 py-2 text-gray-700 transition duration-500 hover:bg-gray-300"
      >
        Connect
      </button>
      <button
        type="button"
        onClick={() => socket.disconnect()}
        className="ease focus:shadow-outline m-2 select-none rounded-md border border-gray-200 bg-gray-200 px-4 py-2 text-gray-700 transition duration-500 hover:bg-gray-300"
      >
        Disconnect
      </button>
    </div>
  );
}
