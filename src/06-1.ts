import { handleLines, logJson, logJsonPretty, logString } from "./helpers";

const markers = ["Time", "Distance"] as const;
type MarkerProp = Lowercase<(typeof markers)[number]>;
type Race = { [prop in MarkerProp]: number };
const data: Race[] = [];
function handleLine(line: string) {
  for (const marker of markers) {
    const markerText = `${marker}:`;
    if (line.startsWith(markerText)) {
      const markerProp = marker.toLowerCase() as MarkerProp;
      line
        .replace(markerText, "")
        .trim()
        .split(" ")
        .filter((v) => v)
        .forEach((v, index) => {
          const val = +v.trim();
          if (!data[index]) {
            data[index] = Object.fromEntries(
              markers.map((m) => [m.toLowerCase(), -1]),
            ) as Race;
          }
          data[index]![markerProp] = val;
        });
    }
  }
}
handleLines(
  "06-1",
  handleLine,
//   `
// Time:      7  15   30
// Distance:  9  40  200`,
);
function getBetterRaceCount(input: Race) {
  let betterRaceCount = 0;
  for (let i = 1; i <= input.time; i++) {
    const speed = i;
    const remainingTime = input.time - i;
    const distance = remainingTime * speed;
    if (distance > input.distance) betterRaceCount++;
  }
  logJson({ input, betterRaceCount });
  return betterRaceCount;
}
const result = data.reduce((acc, race) => acc * getBetterRaceCount(race), 1);
logString("Result: " + result);
