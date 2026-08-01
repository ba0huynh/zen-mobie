import { Platform } from "react-native"

type PlatformType = 'ios' | 'android' | 'web'
export default function usePlatform() {
    function is(platform: PlatformType){
        return platform === Platform.OS
    }
    return { is }
}