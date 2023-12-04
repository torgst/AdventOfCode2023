import { appendFileSync, readFileSync, writeFileSync } from "fs";

export function logJsonPretty(...values: unknown[]) {
  console.log(JSON.stringify(values, null, 2));
  appendFileSync(
    `${__dirname}/output.log`,
    JSON.stringify(values, null, 2) + "\n",
  );
}
export function logJson(...values: unknown[]) {
  console.log(JSON.stringify(values));
  appendFileSync(`${__dirname}/output.log`, JSON.stringify(values) + "\n");
}
export function logString(value: string | undefined) {
  console.log(value);
  appendFileSync(`${__dirname}/output.log`, value + "\n");
}
export function handleLines(
  filename: `${number}${number}-${number}`,
  handleLine: (line: string, index: number, lines: string[]) => void,
  testData?: string,
) {
  const data =
    testData ?? readFileSync(`${__dirname}/../data/${filename}.txt`, "utf-8");
  writeFileSync(`${__dirname}/output.log`, "");
  let index = -1;
  const lines = data.split("\n");
  for (const line of lines) {
    index++;
    if (!line.trim()) continue;
    handleLine(line, index, lines);
  }
}
