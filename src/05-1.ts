import { getData, logJsonPretty, logString } from "./helpers";

type MapData = {
  dest_start: number;
  source_start: number;
  length: number;
  offset: number;
};
const mapNames = [
  "seed-to-soil",
  "soil-to-fertilizer",
  "fertilizer-to-water",
  "water-to-light",
  "light-to-temperature",
  "temperature-to-humidity",
  "humidity-to-location",
] as const;
type MapNames = (typeof mapNames)[number];
type CamelizeString<T> = T extends string
  ? string extends T
    ? string
    : T extends `${infer F}-${infer R}`
      ? `${F}${Capitalize<CamelizeString<R>>}`
      : T
  : T;
type MapTypes = CamelizeString<MapNames>;
function mapNameToMapType(mapName: MapNames): MapTypes {
  return mapName.replace(/(-?[a-z]+)/gi, (match) =>
    match.startsWith("-")
      ? match.charAt(1).toUpperCase() + match.slice(2)
      : match,
  ) as MapTypes;
}
const mapTypes = mapNames.map((i) => mapNameToMapType(i));
type MapList<T> = {
  [key in MapTypes]?: T;
};
const data: MapList<MapData[]> & { seeds?: number[] } = {};
function getLocationForSeed(seed: number, data: MapList<MapData[]>): number {
  let targets: MapList<number> = {};
  let source = seed;
  for (const mapType of mapTypes) {
    const maps = data[mapType];
    if (!maps) throw `Missing some mapping: ${mapType}`;
    for (const map of maps) {
      if (
        source >= map.source_start &&
        source < map.source_start + map.length
      ) {
        if (targets[mapType]) throw "Duplicate mapping found";
        targets[mapType] = source + map.offset;
      }
    }
    if (!targets[mapType]) targets[mapType] = source;
    source = targets[mapType]!;
  }
  return source;
}
const inputData = getData(
  "05-1",
  // `
  // seeds: 79 14 55 13
  //
  // seed-to-soil map:
  // 50 98 2
  // 52 50 48
  //
  // soil-to-fertilizer map:
  // 0 15 37
  // 37 52 2
  // 39 0 15
  //
  // fertilizer-to-water map:
  // 49 53 8
  // 0 11 42
  // 42 0 7
  // 57 7 4
  //
  // water-to-light map:
  // 88 18 7
  // 18 25 70
  //
  // light-to-temperature map:
  // 45 77 23
  // 81 45 19
  // 68 64 13
  //
  // temperature-to-humidity map:
  // 0 69 1
  // 1 0 69
  //
  // humidity-to-location map:
  // 60 56 37
  // 56 93 4`,
);
function extractData(values: string): MapData[] {
  return values
    .trim()
    .split("\n")
    .map((dataset): MapData => {
      const vals = dataset
        .trim()
        .split(" ")
        .map((v) => Number.parseInt(v))
        .filter((v) => !isNaN(v));
      if (vals.length !== 3) {
        throw "Failed to parse corret number of value";
      }
      return {
        dest_start: vals[0]!,
        source_start: vals[1]!,
        length: vals[2]!,
        offset: vals[0]! - vals[1]!,
      };
    });
}
const matches = Array.from(
  inputData.matchAll(/(?<name>[a-z\-]+)(?: map)?:(?<values>[\s\d]*)/gim),
  (match) => match.groups,
) as { name: MapNames | "seeds"; values: string }[];
for (const match of matches) {
  if (match.name === "seeds") {
    data.seeds = match.values
      .trim()
      .split(" ")
      .map((v) => Number.parseInt(v))
      .filter((v) => {
        if (isNaN(v)) throw "failed to parse seed";
        return true;
      });
  } else if (mapNames.includes(match.name)) {
    const type = mapNameToMapType(match.name);
    data[type] = extractData(match.values);
  } else throw "Unknown match name, should not happen";
}
const finalMaps = Object.fromEntries(
  mapTypes.map((mapType) => [mapType, data[mapType]!]),
) as MapList<MapData[]>;
const locations: number[] = [];
for (const seed of data.seeds!) {
  locations.push(getLocationForSeed(seed, finalMaps));
}
logJsonPretty({ locations });
logString("Result: " + Math.min(...locations));
