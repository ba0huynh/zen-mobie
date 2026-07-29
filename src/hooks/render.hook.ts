import { useState } from "react";

export default function useRender() {
    const [render, setRender] = useState(true);
    function handleRender () {
        setRender(!render);
    }
    return { handleRender }
}