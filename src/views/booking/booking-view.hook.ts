import { PlaceType } from "@/entities/place.entity"
import bookingApi from "@/features/booking/booking.api"
import BookingApiTypes from "@/features/booking/booking.api.type"
import placeApi from "@/features/place/api/place.api"
import useForm from "@/hooks/form.hook"
import { useEffect, useState } from "react"
import { useBookingStore } from "./booking.store"

type BookingForm = BookingApiTypes['postBooking']['payload']

/** The form offers "either"; the payload only carries a real preference. */
export type TherapistGender = NonNullable<BookingForm['gender']> | "either"
export type PaymentMethod = "cash" | "qr"

/**
 * Fields the booking widget asks for that POST /bookings has no column for yet.
 * They are folded into `note` on submit so nothing is lost — move them into the
 * payload once the backend grows the fields.
 */
export type BookingDetails = {
    dialCode: string
    smsOptIn: boolean
    therapistGender: TherapistGender | null
    referrer: string
    promotionCode: string
    paymentMethod: PaymentMethod | null
    agreedToPolicy: boolean
}

/** Every field that can block submission, in the order they appear in the form. */
export const BOOKING_FIELDS = [
    "massages",
    "startTime",
    "name",
    "address",
    "email",
    "phone",
    "therapistGender",
    "paymentMethod",
    "agreedToPolicy",
] as const

export type BookingField = typeof BOOKING_FIELDS[number]
export type BookingErrors = Partial<Record<BookingField, string>>

/** Vietnam — the venue is in Saigon, so most guests dial +84. */
export const DEFAULT_DIAL_CODE = "+84"

export const GENDER_LABELS: Record<TherapistGender, string> = {
    male: "Male / Nam",
    female: "Female / Nữ",
    either: "Either",
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
    cash: "Cash",
    qr: "QR Code",
}

const INITIAL_DETAILS: BookingDetails = {
    dialCode: DEFAULT_DIAL_CODE,
    smsOptIn: false,
    therapistGender: null,
    referrer: '',
    promotionCode: '',
    paymentMethod: null,
    agreedToPolicy: false,
}

/** "+84" + "0912 345 678" -> "+84912345678". */
function toInternational(dialCode: string, phone: string) {
    const digits = phone.replace(/\D/g, "").replace(/^0+/, "")
    return `${dialCode}${digits}`
}

function isEmail(value: string) {
    return /^\S+@\S+\.\S+$/.test(value.trim())
}

function composeNote(note: BookingForm['note'], details: BookingDetails, place: PlaceType | null) {
    const lines = [
        place && `Place: ${place.name}`,
        details.therapistGender === "either" && "Therapist: no gender preference",
        details.paymentMethod && `Payment: ${PAYMENT_LABELS[details.paymentMethod]}`,
        details.referrer.trim() && `Referrer: ${details.referrer.trim()}`,
        details.promotionCode.trim() && `Promotion code: ${details.promotionCode.trim()}`,
        details.smsOptIn && "Opted in to booking SMS updates",
        note?.trim() && `Notes: ${note.trim()}`,
    ]

    return lines.filter(Boolean).join("\n") || null
}

export function useBookingView() {
    const selectedMassages = useBookingStore((state) => state.selectedMassages)
    const [details, setDetails] = useState<BookingDetails>(INITIAL_DETAILS)
    const [places, setPlaces] = useState<PlaceType[]>([])
    // null = the guest is typing their own address rather than picking a venue.
    const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null)
    const [errors, setErrors] = useState<BookingErrors>({})
    const [isDone, setIsDone] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const initialValue: BookingForm = {
        name: '', startTime: '', phone: '', email: '', note: '', address: '',
        massages: selectedMassages.map(({ massageId, duration, price }) => ({
            massageId,
            duration,
            price,
        }))
    }
    const { form, handleChange, handleSubmit, isSubmiting } = useForm({
        initialValue, onSubmit: async (form) => {
            setSubmitError(null)
            try {
                await bookingApi.postBooking({
                    ...form,
                    name: form.name.trim(),
                    email: form.email.trim(),
                    phone: toInternational(details.dialCode, form.phone),
                    // "either" means no preference, so the field is left off entirely.
                    gender: details.therapistGender === "either" ? undefined : details.therapistGender ?? undefined,
                    note: composeNote(form.note, details, selectedPlace),
                })
                setIsDone(true)
            } catch {
                // Without this the rejection escapes useForm and the button stays stuck
                // on "Submitting...".
                setSubmitError("We could not reach the booking service. Please try again.")
            }
        },
        watchAll: true,
    })

    useEffect(() => {
        let isStale = false

        placeApi.getPlaceList()
            .then((list) => {
                if (!isStale) setPlaces(list)
            })
            .catch(() => {
                // Manual address entry still works without the place list.
            })

        return () => { isStale = true }
    }, [])

    const selectedPlace = places.find((place) => place.id === selectedPlaceId) ?? null

    /** Drops the message as soon as the guest fixes the field it complained about. */
    function clearError(field: BookingField) {
        setErrors((previous) => {
            if (!previous[field]) return previous

            const next = { ...previous }
            delete next[field]
            return next
        })
    }

    function handleFormChange(key: keyof BookingForm, value: BookingForm[keyof BookingForm]) {
        handleChange(key, value)
        clearError(key as BookingField)
    }

    function handleDetailChange<K extends keyof BookingDetails>(key: K, value: BookingDetails[K]) {
        setDetails((previous) => ({ ...previous, [key]: value }))
        clearError(key as BookingField)
    }

    /** Pass null for "my own address" — it clears the field so the guest can type one. */
    function handlePlaceSelect(placeId: string | null) {
        const place = placeId ? places.find((item) => item.id === placeId) : null

        setSelectedPlaceId(place?.id ?? null)
        handleFormChange("address", place?.address ?? '')
    }

    /** Returns the errors as well as storing them, so the caller can scroll to the first one. */
    function validate(): BookingErrors {
        const found: BookingErrors = {}

        if (selectedMassages.length === 0) found.massages = "Choose at least one service before booking."
        if (!form.startTime) found.startTime = "Pick a date and time for the appointment."
        if (!form.name.trim()) found.name = "Enter the name shown on your passport or ID."
        if (!form.address.trim()) found.address = "Tell us where the therapist should go."
        if (!isEmail(form.email)) found.email = "Enter a valid email address."
        if (!form.phone.trim()) found.phone = "Enter your mobile or Zalo number."
        if (!details.therapistGender) found.therapistGender = "Choose a therapist gender preference."
        if (!details.paymentMethod) found.paymentMethod = "Choose how you would like to pay."
        if (!details.agreedToPolicy) found.agreedToPolicy = "Please agree before confirming the booking."

        setErrors(found)
        return found
    }

    return {
        form,
        handleChange: handleFormChange,
        handleSubmit,
        isSubmiting,
        selectedMassages,
        details,
        handleDetailChange,
        places,
        selectedPlaceId,
        selectedPlace,
        handlePlaceSelect,
        errors,
        validate,
        isDone,
        submitError,
    }
}
