
"use client";

import { useEffect, useState } from "react";

export default function CountUp({ value, duration = 800 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = Number(value) || 0;
        if (end === 0) {
            setCount(0);
            return;
        }

        const step = Math.max(1, Math.floor(end / (duration / 16)));

        const timer = setInterval(() => {
            start += step;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value, duration]);

    return <>{count}</>;
}
