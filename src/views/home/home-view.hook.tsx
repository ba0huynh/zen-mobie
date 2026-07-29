import massageApi from "@/features/massage/api/massage.api"
import { MassageItemType } from "@/features/massage/massage.type"
import { useEffect, useState } from "react"

export default function useHomeView() {
   const [isLoading, setIsLoading] = useState(true)
   const [massageList, setMassageList] = useState<MassageItemType[]>([])
   useEffect(() => {
      if (!isLoading) return
      (async () => {
         setMassageList(await massageApi.getMassageList())
         setIsLoading(false)
      })()
   }, [])
   return {
      isLoading,
      massageList,
   }
}