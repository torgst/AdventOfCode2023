import { handleLines, logJson, logJsonPretty, logString } from "./helpers";

type HandType =
  | "FiveEqual"
  | "FourEqual"
  | "FullHouse"
  | "ThreeEqual"
  | "TwoPairs"
  | "OnePair"
  | "AllDifferent";
const handTypeOrder: { [hand in HandType]: number } = {
  FiveEqual: 0,
  FourEqual: 1,
  FullHouse: 2,
  ThreeEqual: 3,
  TwoPairs: 4,
  OnePair: 5,
  AllDifferent: 6,
};
function getCardTypeOrder(card: string): number {
  if (!isNaN(+card)) return +card;
  else if (card === "T") return 10;
  else if (card === "J") return 11;
  else if (card === "Q") return 12;
  else if (card === "K") return 13;
  else if (card === "A") return 14;
  else throw "Illegal card";
}
function getHandType(hand: string): HandType {
  if (hand.match(/(\S)(?:.*\1){4}/)) return "FiveEqual";
  else if (hand.match(/(\S)(?:.*\1){3}/)) return "FourEqual";
  const matchesThreeEqual = hand.match(/(\S)(?:.*\1){2}/);
  if (matchesThreeEqual) {
    const threeOf = matchesThreeEqual[1];
    const restOfHouseRe = new RegExp(`([^\\s${threeOf}])(?:.*\\1){1}`);
    if (hand.match(restOfHouseRe)) return "FullHouse";
    else return "ThreeEqual";
  }
  const matchesPair = hand.match(/(\S)(?:.*\1){1}/);
  if (matchesPair) {
    const firstPairCard = matchesPair[1];
    const secondPairRe = new RegExp(`([^\\s${firstPairCard}])(?:.*\\1){1}`);
    if (hand.match(secondPairRe)) return "TwoPairs";
    else return "OnePair";
  }
  return "AllDifferent";
}
type Game = {
  handType: HandType;
  handOrder: number;
  hand: string;
  bid: number;
};
const games: Game[] = [];
function handleLine(line: string) {
  const [hand, bidStr] = line.split(" ");
  const bid = +(bidStr ?? "");
  if (!hand || isNaN(bid)) throw "Parse failure";
  const handType = getHandType(hand);
  const handOrder = handTypeOrder[handType];
  games.push({ handType, handOrder, hand, bid });
}
handleLines(
  "07-1",
  handleLine,
  //   `
  // 32T3K 765
  // T55J5 684
  // KK677 28
  // KTJJT 220
  // QQQJA 483`,
);
games.sort((a, b) => {
  const orderDiff = b.handOrder - a.handOrder;
  if (orderDiff !== 0) return orderDiff;
  let i = 0;
  let cardOrderDiff =
    getCardTypeOrder(a.hand.charAt(i)) - getCardTypeOrder(b.hand.charAt(i));
  while (cardOrderDiff === 0 && i < 5) {
    i++;
    cardOrderDiff =
      getCardTypeOrder(a.hand.charAt(i)) - getCardTypeOrder(b.hand.charAt(i));
  }
  return cardOrderDiff;
});
logJsonPretty(games);
const sum = games.reduce((acc, game, index) => acc + game.bid * (index + 1), 0);
logString("Result: " + sum);
