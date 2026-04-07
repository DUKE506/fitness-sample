import { create } from "zustand";
import type { Trainer } from "@/lib/types";

interface ReservationState {
  selectedTrainer: Trainer | null;
  selectedDate: Date | null;
  selectedSlot: string | null; // "HH:mm" 형식
  setSelectedTrainer: (trainer: Trainer | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedSlot: (slot: string | null) => void;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedTrainer: null,
  selectedDate: null,
  selectedSlot: null,
  setSelectedTrainer: (selectedTrainer) => set({ selectedTrainer }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  reset: () =>
    set({ selectedTrainer: null, selectedDate: null, selectedSlot: null }),
}));
