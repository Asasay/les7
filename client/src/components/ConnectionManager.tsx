import { Socket } from "socket.io-client";

export function ConnectionManager({ socket }: { socket: Socket }) {
  return (
    <div className="flex justify-around mt-3">
      <button
        type="button"
        onClick={() => socket.connect()}
        className="transition-colors active:bg-gray-300 dark:active:bg-gray-500 select-none rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300"
      >
        Connect
      </button>
      <button
        type="button"
        onClick={() => socket.disconnect()}
        className="transition-colors active:bg-gray-300 dark:active:bg-gray-500 select-none rounded-md border border-gray-300 bg-gray-200 px-4 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-600 dark:text-gray-300"
      >
        Disconnect
      </button>
    </div>
  );
}
