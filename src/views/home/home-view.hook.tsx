import massageApi from "@/features/massage/api/massage.api"
import { MassageItemType } from "@/features/massage/massage.type"
import { useEffect, useState } from "react"

export type SelectionItem = {
   itemId: string
   pricingIndex: number
   quantity: number
}

export type Selection = SelectionItem[]

export default function useHomeView() {
   const [isLoading, setIsLoading] = useState(true)
   const [massageList, setMassageList] = useState<MassageItemType[]>([])
   const [selection, setSelection] = useState<Selection>([])

   useEffect(() => {
      if (!isLoading) return
      (async () => {
         setMassageList(await massageApi.getMassageList())
         setIsLoading(false)
      })()
   }, [])

   const handleSelect = (itemId: string, pricingIndex: number) => {
      setSelection((prev) => {
         const existingIndex = prev.findIndex(
            (selectionItem) =>
               selectionItem.itemId === itemId &&
               selectionItem.pricingIndex === pricingIndex
         )

         if (existingIndex === -1) {
            return [...prev, { itemId, pricingIndex, quantity: 1 }]
         }

         return prev.map((selectionItem, index) =>
            index === existingIndex
               ? { ...selectionItem, quantity: selectionItem.quantity + 1 }
               : selectionItem
         )
      })
   }

   const handleDecrement = (itemId: string, pricingIndex: number) => {
      setSelection((prev) => {
         const existingItem = prev.find(
            (selectionItem) =>
               selectionItem.itemId === itemId &&
               selectionItem.pricingIndex === pricingIndex
         )

         if (!existingItem) return prev

         if (existingItem.quantity === 1) {
            return prev.filter(
               (selectionItem) =>
                  !(
                     selectionItem.itemId === itemId &&
                     selectionItem.pricingIndex === pricingIndex
                  )
            )
         }

         return prev.map((selectionItem) =>
            selectionItem.itemId === itemId &&
            selectionItem.pricingIndex === pricingIndex
               ? { ...selectionItem, quantity: selectionItem.quantity - 1 }
               : selectionItem
         )
      })
   }

   const totalSelected = selection.reduce(
      (sum, selectionItem) => sum + selectionItem.quantity,
      0
   )

   const totalPrice = selection.reduce((sum, selectionItem) => {
      const item = massageList.find((massageItem) => massageItem.id === selectionItem.itemId)
      const price = item?.pricing[selectionItem.pricingIndex]?.price ?? 0
      return sum + price * selectionItem.quantity
   }, 0)

   return {
      isLoading,
      massageList,
      selection,
      totalPrice,
      totalSelected,
      handleSelect,
      handleDecrement,
   }
}
