import { getData, logString } from "./helpers";

const testData = `
`;
let sum = 0;
const data = getData("10-1", testData);
const lines = data.split("\n");
for (const line of lines) {
  if (!line.trim()) continue;
}
logString("Result: " + sum);
