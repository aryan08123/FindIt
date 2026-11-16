import { useEffect, useState } from "react";

/** Counts up from 0 to `value` with an ease-out animation. */
export default function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let frame;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplay(Math.round(value * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <>{display}</>;
}

