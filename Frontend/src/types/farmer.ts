export type Season = "Kharif" | "Rabi" | "Zaid";

export interface FarmerInput {
  district: string;
  season: Season;
  land_area_acres: number;
}
