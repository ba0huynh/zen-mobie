import isDirty from "@/utils/isDirty"
import { useRef, useState } from "react"
import useRender from "./render.hook";
type ArrayKeys<T> = {
    [K in keyof T]: T[K] extends readonly any[] ? K : never
}[keyof T];
type ObjectKeys<T> = {
    [K in keyof T]: T[K] extends object ? K : never
}[keyof T];
export default function useForm<F, E, V>
    ({ watch = [], initialValue, onSubmit: onSubmitForm, errors: initialErrors = {} as E, validate }:
        {
            initialValue: F, onSubmit: (form: F, args?: V) => Promise<void>, errors?: E,
            validate?: (form: F, vars?: V) => NoInfer<E> | void,
            watch?: (keyof F)[],
            args?: V,
        }) {
    const formRef = useRef<F>(structuredClone(initialValue))
    const [errors, setErrors] = useState<E>(initialErrors as E)
    const { handleRender } = useRender()
    const [isSubmiting, setIsSubmiting] = useState(false)
    async function handleSubmit(vars?: V) {
        const errors = validate?.(formRef.current, vars)
        if (errors) {
            setErrors(errors)
            return
        }
        setIsSubmiting(true)
        await onSubmitForm(formRef.current, vars)
        setIsSubmiting(false)
    }

    function handleChange(key: keyof F, value: F[keyof F]) {
        formRef.current[key] = value
        if (watch.includes(key)) {
            handleRender()
        }
    }

    function useFieldObject<TKey extends ObjectKeys<F>, ObjectT extends Extract<F[TKey], object>>
    ({ key:keyObj, watch = [] }: { key: TKey, watch?: (keyof ObjectT)[] }) {
    
        function handleChange<I extends keyof ObjectT>(key: I, value: ObjectT[I]) {
            const object = formRef.current[keyObj] as ObjectT
            object[key] = value
            formRef.current[keyObj] = object
            if (watch.includes(key)) {
                handleRender()
            }
        }
        return { handleChange }
    
    }

    function useFieldArray<TKey extends ArrayKeys<F>,
        ArrayT extends Extract<F[TKey], any[]>,
        ItemT extends ArrayT[number]>
        ({ key: arrayKey, watch: watchArray = [] }:
            { key: TKey, watch?: (keyof ItemT)[] }) {
        type ItemType = ArrayT[number];
        function handleChange<I extends keyof ItemType>(index: number, key: I, value: ItemType[I]) {
            const array = formRef.current[arrayKey] as ArrayT;
            array[index][key] = value;
            formRef.current[arrayKey] = array;

            if (watchArray.includes(key)) {
                handleRender();
            }
        }
        function push(item: ItemType) {
            const array = formRef.current[arrayKey] as ArrayT;
            array.push(item);
            formRef.current[arrayKey] = array;
            handleRender();
        }

        function remove(index: number) {
            const array = formRef.current[arrayKey] as ArrayT;
            array.splice(index, 1);
            formRef.current[arrayKey] = array;
            handleRender();
        }

        return { handleChange, push, remove };
    }


    function reset() {
        formRef.current = structuredClone(initialValue)
        setErrors(initialErrors)
        handleRender()
    }

    return {
        form: formRef.current,
        isDirty: isDirty(formRef.current, initialValue),
        isSubmiting,
        handleSubmit,
        errors,
        handleChange,
        reset, useFieldArray
        ,useFieldObject
    }
}