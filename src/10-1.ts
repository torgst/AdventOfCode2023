import { getData, logJson, logJsonPretty, logString } from "./helpers";

const testData = `
7-F7-
.FJ|7
SJLL7
|F--J
LJ.LJ
`;
const data = getData("10-1", undefined);
const matrix = data
  .split("\n")
  .filter((l) => l)
  .map((l) => l.split("").filter((c) => c));
type Point = { x: number; y: number };
let start: Point = { x: -1, y: -1 };
// Ensure all lines are the same length, and find position of S
matrix.reduce((acc, line, indexY) => {
  if (line.length !== acc) throw "Bad input?";
  const indexX = line.indexOf("S");
  if (indexX !== -1) {
    if (start.x !== -1 || start.y !== -1) throw "Found two start points...";
    start = { x: indexX, y: indexY };
  }
  return acc;
}, matrix[0]!.length);
// logJson({ start });
const validPointValues = ["|", "-", "L", "J", "7", "F", ".", "S"] as const;
type PointValue = (typeof validPointValues)[number];
function getPointValue(point: Point): PointValue {
  const value = matrix[point.y]?.[point.x];
  if (value === undefined) return "."; // If out of bounds, treat it as ground (.)
  if (!validPointValues.includes(value as PointValue)) {
    logJsonPretty(point);
    throw `Invalid value found: ${value}`;
  }
  return value as PointValue;
}
function getNextMove(from: Point, prev: Point): [next: Point, current: Point] {
  return [getNextpoint(from, prev), from];
}

function getNextpoint(from: Point, prev: Point): Point {
  const point = getPointValue(from);
  if (point === ".") {
    throw "Moving from a dot, should not happen";
  } else if (point === "S") {
    throw "Should not move from S like this";
  } else if (point === "|") {
    if (prev.y < from.y) return { x: from.x, y: from.y + 1 };
    else return { x: from.x, y: from.y - 1 };
  } else if (point === "-") {
    if (prev.x < from.x) return { x: from.x + 1, y: from.y };
    else return { x: from.x - 1, y: from.y };
  } else if (point === "L") {
    if (prev.x > from.x) return { x: from.x, y: from.y - 1 };
    else return { x: from.x + 1, y: from.y };
  } else if (point === "F") {
    if (prev.x > from.x) return { x: from.x, y: from.y + 1 };
    else return { x: from.x + 1, y: from.y };
  } else if (point === "7") {
    if (prev.x < from.x) return { x: from.x, y: from.y + 1 };
    else return { x: from.x - 1, y: from.y };
  } else if (point === "J") {
    if (prev.x < from.x) return { x: from.x, y: from.y - 1 };
    else return { x: from.x - 1, y: from.y };
  }
  throw "Unknown move";
}
type Direction = "north" | "south" | "east" | "west" | "illegal";
function isValidConnectionForDirection(
  toPoint: PointValue,
  dir: Direction,
): boolean {
  // logJson({ dir, toPoint });
  if (dir === "illegal") return false;
  if (dir === "south") {
    if (["|", "L", "J"].includes(toPoint)) return true;
  } else if (dir === "north") {
    if (["|", "7", "F"].includes(toPoint)) return true;
  } else if (dir === "west") {
    if (["-", "L", "F"].includes(toPoint)) return true;
  } else if (dir === "east") {
    if (["-", "7", "J"].includes(toPoint)) return true;
  }
  return false;
}
function isValidConnection(from: Point, to: Point): boolean {
  const fromPoint = getPointValue(from);
  const toPoint = getPointValue(to);
  // logJson({ fromPoint, toPoint, from, to });
  if (toPoint === ".") return false;
  // IMPORTANT: this MIGHT be a source of issues, but I am quite sure it is no problem
  if (fromPoint === "S") {
    return true; // Since we don't know the direction here, we must assume all connections are valid
  } else if (fromPoint === "|") {
    return isValidConnectionForDirection(
      toPoint,
      from.y < to.y ? "south" : "north",
    );
  } else if (fromPoint === "-") {
    return isValidConnectionForDirection(
      toPoint,
      from.x > to.x ? "west" : "east",
    );
  } else if (fromPoint === "L") {
    return isValidConnectionForDirection(
      toPoint,
      from.x < to.x ? "east" : from.y > to.y ? "north" : "illegal",
    );
  } else if (fromPoint === "J") {
    return isValidConnectionForDirection(
      toPoint,
      from.x > to.x ? "west" : from.y > to.y ? "north" : "illegal",
    );
  } else if (fromPoint === "F") {
    return isValidConnectionForDirection(
      toPoint,
      from.x < to.x ? "east" : from.y < to.y ? "south" : "illegal",
    );
  } else if (fromPoint === "7") {
    return isValidConnectionForDirection(
      toPoint,
      from.x > to.x ? "west" : from.y < to.y ? "south" : "illegal",
    );
  }
  return false;
}

function walk(start: Point, dir: Direction): Point[] | null {
  let current: Point;
  if (dir === "west") current = { x: start.x - 1, y: start.y };
  else if (dir === "east") current = { x: start.x + 1, y: start.y };
  else if (dir === "north") current = { x: start.x, y: start.y - 1 };
  else if (dir === "south") current = { x: start.x, y: start.y + 1 };
  else throw "Illegal direction";
  if (!isValidConnection(start, current)) {
    // logJson("invalid: " + dir, { start, current });
    // logString("\n\n");
    return null;
  }
  let next = getNextpoint(current, start);
  let nextPoint = getPointValue(next);
  const loop: Point[] = [start];
  // let i = 0;
  while (nextPoint !== "S") {
    // i++;
    // logJson({ current, next, start });
    if (!isValidConnection(current, next)) {
      // logJson("invalid: " + dir, { current, next });
      // logString("\n\n");
      return null;
    }
    loop.push(current);
    [next, current] = getNextMove(next, current);
    nextPoint = getPointValue(next);
    // logJson({ nextPoint, next });
  }
  return loop;
}
// Try to walk each direction from start
let loop = walk(start, "west");
if (!loop) loop = walk(start, "south");
if (!loop) loop = walk(start, "east");
if (!loop) loop = walk(start, "north");
if (!loop) throw "Failed to find loop";
const stepsToEnd = Math.ceil(loop.length / 2);
logJsonPretty({ loop, length: loop.length, stepsToEnd });
logString("Result: " + stepsToEnd);
