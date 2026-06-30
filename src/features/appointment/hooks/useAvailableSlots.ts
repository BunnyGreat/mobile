import { useEffect, useState } from "react";
import { getAvailableSlots } from "../services/appointmentSlot.service";

export const useAvailableSlots = (selectedDate: string) => {
  const [slots, setSlots] = useState<Array<{ value: string; label: string; available: boolean }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadSlots = async () => {
      if (!selectedDate) {
        setSlots([]);
        return;
      }

      setLoading(true);
      const nextSlots = await getAvailableSlots(selectedDate);
      setSlots(nextSlots);
      setLoading(false);
    };

    loadSlots();
  }, [selectedDate]);

  return { slots, loading };
};

export default useAvailableSlots;
