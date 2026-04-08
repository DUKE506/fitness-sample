import { create } from "zustand";
import type { TrainerWithProfile } from "@/lib/types";

interface ReservationState {
  selectedTrainer: TrainerWithProfile | null;
  selectedDate: Date | null;
  selectedSlot: string | null; // "HH:mm" 시작 시간
  selectedSlotEnd: string | null; // "HH:mm" 종료 시간
  setSelectedTrainer: (trainer: TrainerWithProfile | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedSlot: (slot: string | null) => void;
  setSelectedSlotEnd: (slot: string | null) => void;
  reset: () => void;
}

export const useReservationStore = create<ReservationState>((set) => ({
  selectedTrainer: null,
  selectedDate: null,
  selectedSlot: null,
  selectedSlotEnd: null,
  setSelectedTrainer: (selectedTrainer) => set({ selectedTrainer }),
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setSelectedSlot: (selectedSlot) => set({ selectedSlot }),
  setSelectedSlotEnd: (selectedSlotEnd) => set({ selectedSlotEnd }),
  reset: () =>
    set({ selectedTrainer: null, selectedDate: null, selectedSlot: null, selectedSlotEnd: null }),
}));
