import { create } from "zustand";

type ViewMode = "day" | "week" | "month";

interface ScheduleState {
  selectedDate: Date;
  viewMode: ViewMode;
  selectedTrainerId: string | null;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedTrainerId: (id: string | null) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  selectedDate: new Date(),
  viewMode: "week",
  selectedTrainerId: null,
  setSelectedDate: (selectedDate) => set({ selectedDate }),
  setViewMode: (viewMode) => set({ viewMode }),
  setSelectedTrainerId: (selectedTrainerId) => set({ selectedTrainerId }),
}));
