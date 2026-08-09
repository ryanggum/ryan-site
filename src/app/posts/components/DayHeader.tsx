// src/app/posts/components/DayHeader.tsx
import { Prose } from "./Prose";

type DayHeaderProps = {
  day: string;
  date: string;
  miles: string;
  trailStart: string;
  trailEnd: string;
  gain: string;
};

export function DayHeader({
  day,
  date,
  miles,
  trailStart,
  trailEnd,
  gain,
}: DayHeaderProps) {
  return (
    <Prose as="p">
      <span className="text-lg font-semibold mb-0">
        Day {day}, {date}, Trail {trailStart} {"→"} {trailEnd} ({miles} mi.,{" "}
        {gain} ft. EG)
      </span>
    </Prose>
  );
}
