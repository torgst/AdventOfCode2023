import { handleLines, logJson, logJsonPretty, logString } from "./helpers";

const markers = ["Time", "Distance"] as const;
type MarkerProp = Lowercase<(typeof markers)[number]>;
type Race = { [prop in MarkerProp]: number };
const race: Race = { time: -1, distance: -1 };
function handleLine(line: string) {
  for (const marker of markers) {
    const markerText = `${marker}:`;
    if (line.trim().startsWith(markerText)) {
      const markerProp = marker.toLowerCase() as MarkerProp;
      const val = +line.replace(markerText, "").replace(/ /g, "");
      race[markerProp] = val;
    }
  }
}
handleLines(
  "06-1",
  handleLine,
  // `
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
  return betterRaceCount;
}
const result = getBetterRaceCount(race);
logString("Result: " + result);
