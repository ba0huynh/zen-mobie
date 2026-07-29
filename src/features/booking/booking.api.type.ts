import { BookingType } from "@/entities/booking.entity";

type PostBookingPayload = Pick<BookingType, 'massageId' | 'startTime' | 'phone' | 'price' | 'address' | 'duration'>

type BookingApiTypes = {
    postBooking: { payload: PostBookingPayload },
}

export default BookingApiTypes