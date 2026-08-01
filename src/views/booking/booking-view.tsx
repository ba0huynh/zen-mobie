import View from "@/components/ui/view";
import { useBookingView } from "./booking-view.hook";
import Input from "@/components/ui/input";
import DateTimePicker from "@/components/ui/date-time-picker";

export default function BookingView() {
    const { form, handleChange, isSubmiting } = useBookingView()
    return <View>
        <DateTimePicker onValueChange={(v) => handleChange('startTime', v.toISOString())} value={new Date(form.startTime)} />
        <Input value={form.phone} onChangeText={(value) => handleChange('phone', value)} />
        <Input value={form.address} onChangeText={(value) => handleChange('address', value)} />
    </View>
}