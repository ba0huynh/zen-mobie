import { BookingType } from "@/entities/booking.entity";
import { BookingMassageType } from "@/entities/booking_massage.entity";

type PostBookingPayload = Pick<
    BookingType,
    'name' | 'startTime' | 'phone' | 'email' | 'address' | 'note' | 'gender'
> & {
    massages: Pick<BookingMassageType, 'price' | 'duration' | 'massageId'>[]
}

type AcceptBookingQuery = {
    /** The therapist's email, as issued in the accept link. */
    email: string
    id: BookingType['id']
}

type BookingApiTypes = {
    postBooking: { payload: PostBookingPayload },
    acceptBooking: { query: AcceptBookingQuery },
}

export default BookingApiTypes
