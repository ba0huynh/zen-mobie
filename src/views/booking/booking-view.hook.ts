import bookingApi from "@/features/booking/booking.api"
import BookingApiTypes from "@/features/booking/booking.api.type"
import useForm from "@/hooks/form.hook"
import { useLocalSearchParams } from "expo-router"

type BookingForm = BookingApiTypes['postBooking']['payload']
export function useBookingView() {
    const params = useLocalSearchParams<{ massageId: string, price: string, duration: string }>()
    const initialValue: BookingForm = { 
        massageId: params.massageId, price: Number(params.price), duration: Number(params.duration), startTime: '', phone: '', address: '' }
    const { form, handleChange, isSubmiting } = useForm({
        initialValue, onSubmit: async (form) => {
            await bookingApi.postBooking(form)
        },
    })
    return { form, handleChange, isSubmiting }
}