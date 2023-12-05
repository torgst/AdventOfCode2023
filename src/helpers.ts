import { appendFileSync, readFileSync, writeFileSync } from "fs";

export function logJsonPretty(...values: unknown[]) {
  console.log(...values.map((v) => JSON.stringify(v, null, 2)));
  appendFileSync(
    `${__dirname}/output.log`,
    values.map((v) => JSON.stringify(v, null, 2)).join("\t") + "\n",
  );
}
export function logJson(...values: unknown[]) {
  console.log(...values.map((v) => JSON.stringify(v)));
  appendFileSync(
    `${__dirname}/output.log`,
    values.map((v) => JSON.stringify(v)).join("\t") + "\n",
  );
}
export function logString(value: string | number | undefined) {
  console.log(value);
  appendFileSync(`${__dirname}/output.log`, value + "\n");
}
export function handleLines(
  filename: `${number}${number}-${number}`,
  handleLine: (line: string, index: number, lines: string[]) => void,
  testData?: string,
) {
  const data = getData(filename, testData);
  let index = -1;
  const lines = data.split("\n");
  for (const line of lines) {
    index++;
    if (!line.trim()) continue;
    handleLine(line, index, lines);
  }
}
export function getData(
  filename: `${number}${number}-${number}`,
  testData?: string,
) {
  const data =
    testData ?? readFileSync(`${__dirname}/../data/${filename}.txt`, "utf-8");
  writeFileSync(`${__dirname}/output.log`, "");
  return data;
}
