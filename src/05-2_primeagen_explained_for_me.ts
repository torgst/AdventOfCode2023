import fs = require("fs");
import { clearLog, logJson, logJsonPretty } from "./helpers";

const contents = fs
  .readFileSync(`${__dirname}/../data/05-1.txt`, "utf8")
  .split("\n\n")
  .filter((x: string) => x.length);

const seedValues = contents.shift()!.split(": ")[1]!.split(" ");

const seeds = [];
for (let i = 0; i < seedValues.length; i += 2) {
  seeds.push({
    start: +seedValues[i]!,
    length: +seedValues[i + 1]!,
  });
}

let highestValuePossible = 0;

function createRange(line: string) {
  const items = line.split(" ");
  const range = {
    dest: +items[0]!,
    src: +items[1]!,
    length: +items[2]!,
  };

  highestValuePossible = Math.max(
    highestValuePossible,
    range.src + range.length,
    range.dest + range.length,
  );

  return range;
}

function createNegativeRanges(ranges: ReturnType<typeof createRange>[]) {
  ranges.sort((a, b) => a.src - b.src);

  let start = 0;
  for (let i = 0; i < ranges.length; i++) {
    const range = ranges[i]!;
    if (range.src > start) {
      ranges.splice(i, 0, {
        src: start,
        dest: start,
        length: range.src - start,
      });
      i++;
    }
    start = range.src + range.length;
  }
  return ranges;
}

function parseMap(data: string) {
  const contents = data.split("\n").filter((x) => x);
  const [from, _, to] = contents.shift()!.split(" ")[0]!.split("-");

  return {
    from: from,
    to: to,
    maps: contents.map(createRange),
  };
}

/** Walk all mappings as far as we can as a single block.
 * Return the startValue at that point and how long the block is.
 * The caller needs to keep calling this until we have reached the end of all values.
 * IMPORTANT: while this function walks the mappings, it also narrows the block sizes down to sizes that can be walked as a single block. */
function walk(
  startValue: number,
  blockSize: number,
  name: string,
  links: typeof parsedMap,
) {
  if (links[name] === undefined) {
    return [startValue, blockSize]; // We have reached "locations" and don't need to walk more
  }

  const link = links[name]!;
  const map = link.maps.find(
    (x: ReturnType<typeof createRange>) =>
      x.src <= startValue && startValue < x.src + x.length,
  );
  if (!map) throw "We should have ranges for everything now";

  const offset = startValue - map.src; // We start our block this far from the start of the mapping
  const newValue = map.dest + offset; // Thus, we should also start the block in the next mapping with the same offset
  const newBlockSize = Math.min(blockSize, map.length - offset); // This block needs to stop either at the end of the block, or at the end of the map range we are currently handling
  return walk(newValue, newBlockSize, link.to!, links);
}

const parsed = contents.map((x: string) => parseMap(x));
parsed.forEach((p: ReturnType<typeof parseMap>) => {
  p.maps = createNegativeRanges(p.maps);
});
const parsedMap = parsed.reduce(
  (
    acc: { [from: string]: ReturnType<typeof parseMap> },
    x: ReturnType<typeof parseMap>,
  ) => {
    acc[x.from!] = x;
    return acc;
  },
  {} as { [from: string]: ReturnType<typeof parseMap> },
);

console.log(JSON.stringify(parsedMap, null, 4));
clearLog();

let lowest = Infinity;
const locationBlocks: typeof seeds = [];
for (const seed of seeds) {
  // console.log("start", seed);
  let remaining = seed.length;
  let nextBlockStart = seed.start;
  let consumedCount = 0;
  while (remaining > 0) {
    const [firstLocationAtEndOfBlock, actualBlockSize] = walk(
      nextBlockStart,
      remaining,
      "seed",
      parsedMap,
    );
    locationBlocks.push({
      start: firstLocationAtEndOfBlock!,
      length: actualBlockSize!,
    });

    remaining -= actualBlockSize!;
    consumedCount += actualBlockSize!;
    logJson({
      seedStart: seed.start,
      seedSize: seed.length,
      start: nextBlockStart,
      remaining,
      consumed: consumedCount,
    });
    // logJson(locationBlocks[locationBlocks.length - 1]);
    nextBlockStart += actualBlockSize!;
    if (firstLocationAtEndOfBlock! < lowest) {
      lowest = firstLocationAtEndOfBlock!;
    }
  }
}
// logJsonPretty(locationBlocks);
console.log(lowest);
