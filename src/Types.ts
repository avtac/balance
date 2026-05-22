// Types to be extended
export interface aircraftProps {
  aircraft: aircraftT;
  setAircraft: (arg0: aircraftT) => void;
}

export interface configProps {
  config: configT;
  setConfig: (arg0: configT) => void;
}

export interface nameProps {
  name: string;
}

export interface momentObjectT {
  arm: number;
  weight: number;
}

// Data structure interfaces

export interface maxMomentObjectT {
  arm: number;
  maxWeight: number;
}

export interface operationConfigT {
  id: string;
  name: string;
  config: string;
  seats: { id: string; weight: number }[];
  cargoAreas: { id: string; weight: number }[];
}

export interface aircraftConfigT {
  id: string;
  name: string;
  seats: string[];
  cargoAreas: string[];
  equipment: { id: string; count: number }[],
  fuelTanks: string[];
}

export interface equipmentT extends momentObjectT {
  id: string;
  name: string;
  area: string;
}

export interface weightLimitT {
  id: string;
  name: string;
  color?: string;
  lineStyle?: string;
  weight: number | null;
}

export interface regionPointT extends momentObjectT {
  id: string;
}

export interface regionT {
  id: string;
  name: string;
  color?: string;
  lineStyle?: string;
  data: regionPointT[];
}

export interface aircraftLimitsT {
  regions: regionT[];
  limits: weightLimitT[];
}

export interface seatT extends maxMomentObjectT {
  id: string;
  name: string;
  lateralDist: number;
  seatCount: number;
}

export interface cargoAreaT extends maxMomentObjectT {
  id: string;
  name: string;
}

export interface fuelTankT extends maxMomentObjectT {
  id: string;
  name: string;
  unusable: number;
  removable: boolean;
}

export interface aircraftPropertiesT {
  tailNumber: string;
  type: string;
  emptyWeight: number;
  emptyArm: number
  leadingEdgeMAC?: number;
  mac?: number;
}

export interface aircraftT {
  id: string;
  config: aircraftPropertiesT;
  limits: aircraftLimitsT;
  seats: seatT[];
  cargoAreas: cargoAreaT[];
  fuelTanks: fuelTankT[];
  equipment: equipmentT[];
  aircraftConfigs: aircraftConfigT[];
  operationConfigs: operationConfigT[];
}

export const weightUnits = ['lbs', 'kg'] as const;
export const lengthUnits = ["in", "m", "mm"] as const;
export const volumeUnits = ['gal', 'liters'] as const;
export const fuelUnits = [...volumeUnits, ...weightUnits] as const;
export type weightUnitsT = typeof weightUnits[number];
export type lengthUnitsT = typeof lengthUnits[number];
export type volumeUnitsT = typeof volumeUnits[number];
export type fuelUnitsT = (volumeUnitsT | weightUnitsT);

export interface setupT {
  weightUnits: typeof weightUnits[number];
  lengthUnits: typeof lengthUnits[number];
  fuelUnits: typeof fuelUnits[number];
  useMAC: boolean;
  fuelDensity: number;
}

export interface configT {
  id: string;
  name: string;
  aircraft: aircraftT[];
  setup: setupT;
}
