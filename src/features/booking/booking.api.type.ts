import { BookingType } from "@/entities/booking.entity";
import { BookingMassageType } from "@/entities/booking_massage.entity";

type PostBookingPayload = Pick<BookingType, 'startTime' | 'phone' | 'note' | 'address'> & {
    massages:  Pick<BookingMassageType,'price' | 'duration' | 'massageId'>[]
} 

type BookingApiTypes = {
    postBooking: { payload: PostBookingPayload },
}

export default BookingApiTypes