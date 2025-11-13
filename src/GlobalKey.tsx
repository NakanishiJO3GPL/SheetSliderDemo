import { useEffect } from "react";

type KeyHandler = (event: KeyboardEvent) => void;

export function useGlobalKey(key: string, handler: KeyHandler) {
    useEffect(() => {
        const keyListener = (event: KeyboardEvent) => {
            if (event.key === key) {
                handler(event);
            }
        };

        window.addEventListener("keydown", keyListener);

        return () => {
            window.removeEventListener("keydown", keyListener);
        };
    }, [key, handler]);
}
