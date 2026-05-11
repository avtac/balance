export interface aircraftConfigT {
  id: string,
  name: string,
  seats: string[],
  cargoAreas: string[],
  equipment: {id: string, count: number}[],
  fuelTanks: string[]
}

export interface equipmentT {
  id: string,
  name: string,
  weight: number,
  arm: number
}

export interface weightLimitT {
  id: string,
  name: string,
  color?: string,
  lineStyle?: string,
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
  color?: string,
  lineStyle?: string,
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
  lateralDist: number,
  seatCount: number
}

export interface cargoAreaT {
  id: string,
  name: string,
  maxWeight: number,
  arm: number,
}

export interface aircraftPropertiesT {
  tailNumber: string,
  type: string,
  emptyWeight: number,
  emptyArm: number
}

export interface configT {
  config: aircraftPropertiesT,
  limits: aircraftLimitsT,
  seats: seatT[],
  cargoAreas: cargoAreaT[],
  equipment: equipmentT[],
  aircraftConfigs: aircraftConfigT[],
}
