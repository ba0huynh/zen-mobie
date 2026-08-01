import { BookingMassageType } from "@/entities/booking_massage.entity"
import { create } from "zustand"

type BookingForm = {
    selectedMassages: Pick<BookingMassageType, 'duration' | 'price' | 'massageId'>[]
}

export const useBookingStore = create<BookingForm>((set) => ({
    selectedMassages: [],
}))
