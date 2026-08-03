import { BookingMassageType } from "@/entities/booking_massage.entity"
import { create } from "zustand"

export type SelectedBookingMassage = Pick<BookingMassageType, "duration" | "price" | "massageId"> & {
    name: string
}

type BookingStore = {
    selectedMassages: SelectedBookingMassage[]
    setSelectedMassages: (selectedMassages: SelectedBookingMassage[]) => void
}

export const useBookingStore = create<BookingStore>((set) => ({
    selectedMassages: [],
    setSelectedMassages: (selectedMassages) => set({ selectedMassages }),
}))
