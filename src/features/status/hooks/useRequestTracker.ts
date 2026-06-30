import { useStatusStore } from "../store/status.store";

export const useRequestTracker = () => {
  const subscribeToRequests = useStatusStore((state) => state.subscribeToRequests);

  const subscribe = () => subscribeToRequests();

  return { subscribe };
};

export default useRequestTracker;
