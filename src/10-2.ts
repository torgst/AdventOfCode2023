import { getData, logJson, logJsonPretty, logString } from "./helpers";

const testData = `
FF7FSF7F7F7F7F7F---7
L|LJ||||||||||||F--J
FL-7LJLJ||||||LJL-77
F--JF--7||LJLJ7F7FJ-
L---JF-JLJ.||-FJLJJ7
|F|F-JF---7F7-L7L|7|
|FFJF7L7F-JF7|JL---7
7-L-JL7||F7|L7F-7F7|
L.L7LFJ|||||FJL7||LJ
L7JLJL-JLJLJL--JLJ.L
`;
const data = getData("10-1", testData);
logString(
  testData
    .split("\n")
    .filter((l) => l)
    // .map((l) => " " + l)
    .join("\n"),
);
logString("#####");
const matrix = data
  .split("\n")
  .filter((l) => l)
  .map((l) => l.split("").filter((c) => c));
type Point = { x: number; y: number };
let start: Point = { x: -1, y: -1 };
// Ensure all lines are the same length, and find position of S
const matrixWidth = matrix.reduce((acc, line, indexY) => {
  if (line.length !== acc) throw "Bad input?";
  const indexX = line.indexOf("S");
  if (indexX !== -1) {
    if (start.x !== -1 || start.y !== -1) throw "Found two start points...";
    start = { x: indexX, y: indexY };
  }
  return acc;
}, matrix[0]!.length);
// logJson({ start });
function squeeze(
  previous: Point,
  sideDir: Direction,
  dir: Direction,
): { outside?: boolean; blocked?: boolean; openTile?: Point } {
  // use when we have started squeezing in one of the four directions
  const nextA = getPointInDirection(previous, dir);
  if (matrix[nextA.y]?.[nextA.x] === undefined) {
    // we are now outside the entire map...
    return { outside: true };
  }
  const nextAPoint = getPointValue(nextA);
  const nextB = getPointInDirection(nextA, sideDir);
  const nextBPoint = getPointValue(nextB);
  // logString(
  //   `\n     Can we squeeze between ${nextA.y + 1},${
  //     nextA.x + 1
  //   } (${nextAPoint}) and ${nextB.y + 1},${nextB.x + 1} (${nextBPoint})?`,
  // );
  if (nextAPoint === ".") return { openTile: nextA };
  else if (nextBPoint === ".") return { openTile: nextB };
  const isBlocking = isBlockingIntersection(
    nextAPoint,
    nextBPoint,
    dir,
    sideDir,
  );
  if (isBlocking) return { blocked: true };
  logString("     : Got one step, trying to go further");
  return squeeze(nextA, sideDir, dir);
}
function trySqueeze(
  next: Point,
  sideDir: Direction,
  dir: Direction,
  visited: Visited[][],
): boolean {
  // logString(
  //   `Trying to squeeze from (${next.y + 1},${
  //     next.x + 1
  //   }) direction: ${dir} (on ${sideDir} side)`,
  // );
  const res = squeeze(next, sideDir, dir);
  // logJson(res);
  if (res.blocked) {
    // logString("     > Squeezing was blocked");
    // logJson({ blocked: true, point: next });
    return false;
  } else if (res.outside) {
    logJson({ outside: true, point: next });
    return true;
  } else if (res.openTile) {
    logString(
      `     ! Found an open tile at: ${res.openTile.y + 1},${
        res.openTile.x + 1
      }`,
    );
    return followTrail(res.openTile, visited, dir);
  } else throw "Failed: trySqueeze";
}
function followTrail(
  point: Point,
  visited: Visited[][],
  cameFrom?: Direction,
): boolean {
  // let res: (boolean | null)[] = [];
  // res.push(canLeave(point, "east", visited));
  // res.push(canLeave(point, "west", visited));
  // res.push(canLeave(point, "north", visited));
  // res.push(canLeave(point, "south", visited));
  let res: boolean | null = false;
  const tmp = (goto: Direction, avoid: Direction) => {
    if (!res && cameFrom !== avoid) {
      logString(
        `>>>>> Following trail from (${point.y + 1},${
          point.x + 1
        }) in direction ${goto}`,
      );
      res = canLeave(point, goto, visited);
      logString(
        `  <<<<< Result of trail from (${point.y + 1},${
          point.x + 1
        }) in direction ${goto}: ${res}`,
      );
    }
    // logJson({ res: res, point });
    return res;
  };
  res = tmp("east", "west");
  if (res === true) return true;
  res = tmp("north", "south");
  if (res === true) return true;
  res = tmp("west", "east");
  if (res === true) return true;
  res = tmp("south", "north");
  return res === true;
  // return res.find((i) => i === true) === true;
}
function hasVisited(point: Point, visited: Visited[][], dir: Direction) {
  return visited[point.y]?.[point.x] === true;
  // return visited[point.y]?.[point.x]?.[dir] === true;
}
function setVisited(point: Point, visited: Visited[][], dir: Direction) {
  // visited[point.y]![point.x]![dir] = true;
  visited[point.y]![point.x] = true;
}
function canLeave(
  point: Point,
  dir: Direction,
  visited: Visited[][],
): boolean | null {
  if (dir === "illegal") return false;
  // if (hasVisited(point, visited, dir)) {
  //   logString(
  //     `     Already visited (${point.y + 1},${
  //       point.x + 1
  //     }) from direction ${dir}`,
  //   );
  //   // logJsonPretty(visited[next.y]![next.x]);
  //   return null; // We are now looping and should consider this direction a failure
  // }
  // logString(
  //   `## Can we leave from point (${point.y + 1},${
  //     point.x + 1
  //   }) in direction ${dir}?`,
  // );
  const next = getPointInDirection(point, dir);
  if (matrix[next.y]?.[next.x] === undefined) {
    // we are now outside the entire map...
    logString(
      `  $$ Outside map: (${point.y + 1},${point.x + 1}) in direction ${dir}`,
    );
    return true;
  }
  // logJsonPretty(visited[next.y]);
  // logJsonPretty(dir, visited[next.y]![next.x]);
  setVisited(point, visited, dir);
  const nextPoint = getPointValue(next);
  // logJson({ dir, nextPoint, next });
  // logJson({ point, dir, next, nextPoint });
  let squeezeSucceeded = false;
  let nextResult: boolean = false;
  if (false) {
    //tmp
  } else if (hasVisited(next, visited, dir)) {
    logString(
      `     Already visited (${next.y + 1},${
        next.x + 1
      }) from direction ${dir}`,
    );
    // logJsonPretty(visited[next.y]![next.x]);
    return null; // We are now looping and should consider this direction a failure
  } else if (nextPoint !== ".") {
    if (dir === "south" || dir === "north") {
      squeezeSucceeded = trySqueeze(point, "east", dir, visited);
      if (!squeezeSucceeded) {
        squeezeSucceeded = trySqueeze(point, "west", dir, visited);
      }
      return squeezeSucceeded;
    } else if (dir === "east" || dir === "west") {
      squeezeSucceeded = trySqueeze(point, "north", dir, visited);
      if (!squeezeSucceeded) {
        squeezeSucceeded = trySqueeze(point, "south", dir, visited);
      }
      return squeezeSucceeded;
    } else throw "Illegal";
  } else {
    // logString(`Current point (${point.y + 1},${point.x + 1})`);
    // logJson("cur", visited[point.y]![point.x]);
    // log tring(`Next point (${next.y + 1},${next.x + 1}) is: .`);
    // logJson("next", visited[next.y]![next.x]);
    // nextResult = followTrail(next, visited, dir);
  }
  // TODO: latest change is totally wrong, inside this function we already have a direction and should honour the squeeze as an actual result
  if (squeezeSucceeded) return true;
  // logString("Going to next");
  // const nextTested = followTrail(next, visited, dir);
  nextResult = followTrail(next, visited, dir);
  logJson({ nextResult, next });
  return nextResult;
}
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
function isBlockingIntersection(
  /** One pipe that might create a blocking intersection */
  pointA: PointValue,
  /** The other pipe that might create a blocking intersection */
  pointB: PointValue,
  /** The direction that might lead to outside the enclosure */
  dir: Direction,
  /** The direction the pipes are moving */
  sideDir: Direction,
): boolean {
  if (sideDir === "west" || sideDir === "south") {
    // Simplify by always checking the flow from west to east or from north to south
    const _ = pointA;
    pointA = pointB;
    pointB = _;
  }
  // logJson({ dir, sideDir, pointA, pointB });
  if (dir === "illegal") throw "Illegal";
  if (dir === "south" || dir === "north") {
    // A is left of B
    return (
      ["-", "L", "F"].includes(pointA) && // If the left part is none of these, we cannot form a blocking intersection
      ["-", "7", "J"].includes(pointB) // If the right part is none of these, we cannot form a blocking intersection
    );
  } else if (dir === "west" || dir === "east") {
    // A is above B
    return (
      ["|", "L", "J"].includes(pointA) && // If the above part is none of these, we cannot form a blocking intersection
      ["|", "7", "F"].includes(pointB) // If the below part is none of these, we cannot form a blocking intersection
    );
  }
  return false;
}
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
    return true; // Since we don't know the direction here, we must asume all connections are valid
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
function getPointInDirection(from: Point, dir: Direction): Point {
  if (dir === "west") return { x: from.x - 1, y: from.y };
  else if (dir === "east") return { x: from.x + 1, y: from.y };
  else if (dir === "north") return { x: from.x, y: from.y - 1 };
  else if (dir === "south") return { x: from.x, y: from.y + 1 };
  else throw "Illegal direction";
}
function walk(start: Point, dir: Direction): Point[] | null {
  let current: Point = getPointInDirection(start, dir);
  if (!isValidConnection(start, current)) {
    return null;
  }
  let next = getNextpoint(current, start);
  let nextPoint = getPointValue(next);
  const loop: Point[] = [start];
  while (nextPoint !== "S") {
    if (!isValidConnection(current, next)) {
      return null;
    }
    loop.push(current);
    [next, current] = getNextMove(next, current);
    nextPoint = getPointValue(next);
  }
  loop.push(current);
  return loop;
}
// Try to walk each direction from start
let loop = walk(start, "west");
if (!loop) loop = walk(start, "south");
if (!loop) loop = walk(start, "east");
if (!loop) loop = walk(start, "north");
if (!loop) throw "Failed to find loop";
const fp = loop.slice(1, 2)[0]!;
const lp = loop.slice(-1)[0]!;
const fps = getPointValue(fp);
const lps = getPointValue(lp);
let startPipe: PointValue | undefined = undefined;
const receiveUp = ["|", "7", "F"] satisfies PointValue[];
const receiveDown = ["|", "J", "L"] satisfies PointValue[];
const receiveLeft = ["-", "F", "L"] satisfies PointValue[];
const receiveRight = ["-", "7", "J"] satisfies PointValue[];
const toDown = ["|", "7", "F"] satisfies PointValue[];
const toUp = ["|", "J", "L"] satisfies PointValue[];
const toLeft = ["-", "F", "L"] satisfies PointValue[];
const toRight = ["-", "7", "J"] satisfies PointValue[];
type MatchDir = "Up" | "Down" | "Left" | "Right";
const fpHorPos = fp.x - start.x;
const lpHorPos = lp.x - start.x;
const fpVerPos = fp.y - start.y;
const lpVerPos = lp.y - start.y;
function match<T extends PointValue[], V extends PointValue[]>(
  a: MatchDir,
  b: MatchDir,
) {
  const _a =
    a === "Up" ? toUp : a === "Down" ? toDown : a === "Left" ? toLeft : toRight;
  const _b =
    b === "Up"
      ? receiveUp
      : b === "Down"
        ? receiveDown
        : b === "Left"
          ? receiveLeft
          : receiveRight;
  const isMatch =
    (_a as PointValue[]).includes(fps) && (_b as PointValue[]).includes(lps);
  if (!isMatch) return false;
  // else logJsonPretty({ a, b, isMatch });
  // logJson({ lpHorPos, fpHorPos, lpVerPos, fpVerPos });
  if (lps === "-" && (a === "Up" || a === "Down")) {
    if (b === "Left" && lpHorPos > 0) return false;
    if (b === "Right" && lpHorPos < 0) return false;
  } else if (fps === "-" && (b === "Up" || b === "Down")) {
    if (a === "Left" && fpHorPos > 0) return false;
    if (a === "Right" && fpHorPos < 0) return false;
  } else if (lps === "|" && (a === "Right" || a === "Left")) {
    if (b === "Up" && lpVerPos < 0) return false;
    if (b === "Right" && lpVerPos > 0) return false;
  } else if (fps === "|" && (b === "Right" || b === "Left")) {
    if (a === "Up" && fpVerPos < 0) return false;
    if (a === "Right" && fpVerPos > 0) return false;
  }
  return isMatch;
}
if (match("Up", "Up")) startPipe = "|";
else if (match("Down", "Down")) startPipe = "|";
else if (match("Left", "Left")) startPipe = "-";
else if (match("Right", "Right")) startPipe = "-";
else if (match("Up", "Left")) startPipe = "7";
else if (match("Left", "Down")) startPipe = "7";
else if (match("Up", "Right")) startPipe = "F";
else if (match("Left", "Down")) startPipe = "F";
else if (match("Down", "Left")) startPipe = "J";
else if (match("Left", "Up")) startPipe = "J";
else if (match("Down", "Right")) startPipe = "L";
else if (match("Right", "Up")) startPipe = "L";
else throw "Missing case";
// logJsonPretty({ firstPipe: fp, lastPipe: lp, fps, lps, startPipe });
// TODO: find all points possibly enclosed (?)
matrix[start.y]![start.x] = startPipe;

// TODO: follow the trail for each of these and see if it is possible to leave
// type Visited = { [dir in Exclude<Direction, "illegal">]: boolean };
type Visited = boolean;
function getVisitedMatrix({ x, y }: Point): Visited[][] {
  const arr: Visited[][] = Array(matrix.length)
    .fill(undefined)
    .map(() =>
      Array(matrixWidth)
        .fill(undefined)
        .map(
          () => false,
          // ({
          //   north: false,
          //   south: false,
          //   west: false,
          //   east: false,
          // }) as Visited,
        ),
    );
  // arr[y]![x] = { north: true, south: true, west: true, east: true };
  return arr;
}
let map = "";
const enclosedCells: Point[] = [];
const testPoint: Point = { x: 14, y: 3 };
const visited = getVisitedMatrix(testPoint);
followTrail(testPoint, visited);
// logJsonPretty(visited);
// visited.forEach((r) => r.forEach((c) => logJson(c)));
// logJsonPretty(visited);
for (let y = 0; y < matrix.length; y++) {
  const row = matrix[y]!;
  for (let x = 0; x < row.length; x++) {
    const point = { x, y };
    // const cellCanLeave = followTrail(point, getVisitedMatrix(point));
    const cellCanLeave = !visited[y]![x];
    // logJson({ cellCanLeave, point });
    if (!cellCanLeave) enclosedCells.push(point);
    const pointVaue = getPointValue(point);
    if (x === testPoint.x && y === testPoint.y) map += "C";
    else if (loop.find((l) => l.x === x && l.y === y)) {
      if (!cellCanLeave) {
        map += "X";
        continue;
      }
      map += pointVaue;
      // map += ".";
    } else {
      // map += cellCanLeave ? pointVaue : "I";
      map += cellCanLeave ? "." : "I";
    }
  }
  map += "\n";
}
// logJsonPretty({ enclosedCells, count: enclosedCells.length });
enclosedCells.forEach((c) => logJson(c));
logString(map);
logString("Result: " + enclosedCells.length);
