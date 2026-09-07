export type Flight = {
  seq: number;
  from: string;
  to: string;
};

export const flights: Flight[] = [
  { seq: 1, from: "JFK", to: "LAX" },
  { seq: 2, from: "LAX", to: "JFK" },
  { seq: 3, from: "JFK", to: "SAT" },
  { seq: 4, from: "SAT", to: "LAX" },
  { seq: 5, from: "LAX", to: "MSP" },
  { seq: 6, from: "MSP", to: "LGA" },
  { seq: 7, from: "BOI", to: "SLC" },
  { seq: 8, from: "SLC", to: "SFO" },
  { seq: 9, from: "LAX", to: "SEA" },
  { seq: 10, from: "SEA", to: "MSP" },
  { seq: 11, from: "MSP", to: "SLC" },
  { seq: 12, from: "SLC", to: "SFO" },
  { seq: 13, from: "SFO", to: "SEA" },
  { seq: 14, from: "SEA", to: "SNA" },
  { seq: 15, from: "LAX", to: "MSP" },
  { seq: 16, from: "MSP", to: "CLE" },
  { seq: 17, from: "CLE", to: "MSP" },
  { seq: 18, from: "MSP", to: "LAX" },
  { seq: 19, from: "LAX", to: "JFK" },
  { seq: 20, from: "LGA", to: "ORD" },
  { seq: 21, from: "ORD", to: "MSP" },
  { seq: 22, from: "BJI", to: "MSP" },
  { seq: 23, from: "MSP", to: "HPN" },
];
