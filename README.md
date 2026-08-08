# Pace Field

A running pace calculator that links pace, speed and finish times for 5K, 10K, 15K, half
marathon, marathon and one custom distance. Everything is driven by a single number — pace in seconds per
kilometre — so changing any one value updates the rest.

**Live:** https://basti00.github.io/pace-calc/

## Layout

On a phone the whole thing fits one screen with no scrolling: the chart takes the full width at
the top, a two-column grid of the six finish times fills the middle, and the pace slider sits at
the bottom. The chart measures the leftover viewport height and sizes itself to fill it, so the
fit holds from a 375x667 phone upward. Phones render the page one step down in scale, which is
where the chart gets its room. On a wide screen the dial and the grid move into a left
rail beside the chart.

## Input without a keyboard

Built for a phone, so nothing requires typing:

- the slider under the pace readout
- horizontal drag on any distance row, with per-distance sensitivity (dragging the marathon row
  moves in minutes, the 5K row in seconds)
- horizontal drag on the custom-distance row to change the distance
- dragging the marker anywhere in the chart
- `−` / `+` steppers for pace, with press-and-hold repeat

All of it is reachable by keyboard and screen reader as well.

## The chart

Finish time on a log scale against pace, across 2:30–10:00 per kilometre — one curve per distance.
A draggable crosshair intersects all six curves at once and labels each intersection. Labels push
apart and grow leader lines when distances coincide (set the custom distance to 21.1 km to see it).

The log scale is deliberate: a marathon at 10:00/km is seven hours and a 5K at 2:30/km is twelve
minutes, and on a linear scale the short distances collapse onto the axis.

## Running it

A single self-contained `index.html` with no build step and no dependencies. Open the file, or:

```sh
python3 -m http.server
```

## Notes

Times assume an even split. Half marathon is 21.0975 km, marathon 42.195 km. The custom distance
spans 0.4–100 km and starts at 30 km; paces outside 2:30–10:00 per kilometre are out of range.
