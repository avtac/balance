export interface weightLimitT {
  id: string,
  name: string,
  value: number | null
}

export interface regionPointT {
  id: string,
  arm: number,
  weight: number
}

export interface regionT {
  id: string,
  name: string,
  data: regionPointT[]
}

export interface aircraftLimitsT {
  regions: regionT[],
  limits: weightLimitT[]
}

export interface seatT {
  id: string,
  name: string,
  maxWeight: number,
  arm: number,
  seatCount: number
}

export interface cargoAreaT {
  id: string,
  name: string,
  maxWeight: number,
  arm: number,
}

export interface configT {
  limits: aircraftLimitsT,
  seats: seatT[],
  cargoAreas: cargoAreaT[]
}
