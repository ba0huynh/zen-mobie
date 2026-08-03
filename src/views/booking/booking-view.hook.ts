import bookingApi from "@/features/booking/booking.api"
import BookingApiTypes from "@/features/booking/booking.api.type"
import useForm from "@/hooks/form.hook"
import { useBookingStore } from "./booking.store"

type BookingForm = BookingApiTypes['postBooking']['payload']
export function useBookingView() {
    const selectedMassages = useBookingStore((state) => state.selectedMassages)
    const initialValue: BookingForm = {
        startTime: '', phone: '', note: '', address: '',
        massages: selectedMassages.map(({ massageId, duration, price }) => ({
            massageId,
            duration,
            price,
        }))
    }
    const { form, handleChange, handleSubmit, isSubmiting } = useForm({
        initialValue, onSubmit: async (form) => {
            await bookingApi.postBooking(form)
        },
        watchAll: true,
    })
    return { form, handleChange, handleSubmit, isSubmiting, selectedMassages }
}
