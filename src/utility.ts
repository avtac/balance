import { volumeUnits, weightUnits, type aircraftT, type fuelUnitsT, type lengthUnitsT, type maxMomentObjectT, type momentObjectT, type volumeUnitsT, type weightUnitsT } from './Types';

export function getSortedByArm<T extends (maxMomentObjectT | momentObjectT)>(data: T[]) {
  const tmp: T[] = JSON.parse(JSON.stringify(data));
  return tmp.sort((a, b) => {
    return a.arm - b.arm;
  }).filter((s: T) => s != undefined);
}

export function calculateMAC(arm: number, mac: (number | undefined), leadingMac: (number | undefined)): number {
  if (!leadingMac || !mac) return arm;
  return (arm - leadingMac) / mac * 100;
}

export function calculateEmptyBalanceForConfig(config: aircraftT, selectedConfig: string): [number, number] {
  let weight = config.config.emptyWeight;
  let moment = config.config.emptyWeight * config.config.emptyArm;

  const selectedConfigIndex = config.aircraftConfigs.findIndex(v => v.id === selectedConfig);

  // Fuel
  config.fuelTanks.map(
    (fuelTank) => {
      const usedTank = !fuelTank.removable || config.aircraftConfigs[selectedConfigIndex].fuelTanks.includes(fuelTank.id);
      if (!usedTank) return;
      weight += fuelTank.unusable;
      moment += fuelTank.unusable * fuelTank.arm;
    });

  // Equipment
  if (selectedConfigIndex < 0) return [weight, moment / weight];
  config.aircraftConfigs[selectedConfigIndex].equipment.map(
    (equipment) => {
      const equipIndex = config.equipment.findIndex(e => e.id === equipment.id);
      if (equipIndex < 0) return;
      weight += equipment.count * config.equipment[equipIndex].weight;
      moment += equipment.count * config.equipment[equipIndex].weight * config.equipment[equipIndex].arm;
    });
  return [weight, moment / weight]
}

export function calculateMaxBalanceForConfig(config: aircraftT, selectedConfig: string): [number, number] {
  let weight = config.config.emptyWeight;
  let moment = config.config.emptyWeight * config.config.emptyArm;

  const selectedConfigIndex = config.aircraftConfigs.findIndex(v => v.id === selectedConfig);
  if (selectedConfigIndex < 0) return [weight, moment / weight];

  // Seats
  config.aircraftConfigs[selectedConfigIndex].seats.map(
    (seat) => {
      const seatIndex = config.seats.findIndex(s => s.id === seat);
      if (seatIndex < 0) return;
      const seatData = config.seats[seatIndex];
      weight += seatData.maxWeight * seatData.seatCount;
      moment += seatData.maxWeight * seatData.seatCount * seatData.arm;
    });

  // Cargo
  config.aircraftConfigs[selectedConfigIndex].cargoAreas.map(
    (cargoArea) => {
      const cargoAreaIndex = config.cargoAreas.findIndex(c => c.id === cargoArea);
      if (cargoAreaIndex < 0) return;
      const cargoAreaData = config.cargoAreas[cargoAreaIndex];
      weight += cargoAreaData.maxWeight;
      moment += cargoAreaData.maxWeight * cargoAreaData.arm;
    });

  // Fuel
  config.fuelTanks.map(
    (fuelTank) => {
      const usedTank = !fuelTank.removable || config.aircraftConfigs[selectedConfigIndex].fuelTanks.includes(fuelTank.id);
      if (!usedTank) return;
      weight += fuelTank.maxWeight;
      moment += fuelTank.maxWeight * fuelTank.arm;
    });

  // Equipment
  config.aircraftConfigs[selectedConfigIndex].equipment.map(
    (equipment) => {
      const equipIndex = config.equipment.findIndex(e => e.id === equipment.id);
      if (equipIndex < 0) return;
      const equipmentData = config.equipment[equipIndex];
      weight += equipment.count * equipmentData.weight;
      moment += equipment.count * equipmentData.weight * equipmentData.arm;
    });
  return [weight, moment / weight]
}

export function calculateBalanceForOperationConfig(config: aircraftT, selectedConfig: string, selectedOpsConfig: string): [number, number] {
  let [weight, arm] = calculateEmptyBalanceForConfig(config, selectedConfig);
  let moment = weight * arm;

  const selectedOpsConfigIndex = config.operationConfigs.findIndex(v => v.id === selectedOpsConfig);
  if (selectedOpsConfigIndex < 0) return [0, 0];

  // Seats
  config.operationConfigs[selectedOpsConfigIndex].seats.map(
    (seat) => {
      const seatIndex = config.seats.findIndex(s => s.id === seat.id);
      if (seatIndex < 0) return;
      const seatData = config.seats[seatIndex];
      weight += seat.weight;
      moment += seat.weight * seatData.arm;
    });

  // Cargo
  config.operationConfigs[selectedOpsConfigIndex].cargoAreas.map(
    (cargoArea) => {
      const cargoAreaIndex = config.cargoAreas.findIndex(c => c.id === cargoArea.id);
      if (cargoAreaIndex < 0) return;
      const cargoAreaData = config.cargoAreas[cargoAreaIndex];
      weight += cargoArea.weight;
      moment += cargoArea.weight * cargoAreaData.arm;
    });

  return [weight, moment / weight]
}

export const saveStringToFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

const weightUnitsToPounds: { [K in weightUnitsT]: number } = {
  "kg": 2.2046226218,
  "lbs": 1,
}

export function convertWeightUnit(value: number, oldUnit: weightUnitsT, newUnit: weightUnitsT): number {
  if (oldUnit === newUnit) return value;
  const inPounds = value * weightUnitsToPounds[oldUnit];
  return inPounds / weightUnitsToPounds[newUnit];
}

const lengthUnitsToIn: { [K in lengthUnitsT]: number } = {
  "in": 1,
  "m": 0.0254,
  "mm": 2.54,
}

export function convertLengthUnit(value: number, oldUnit: lengthUnitsT, newUnit: lengthUnitsT): number {
  if (oldUnit === newUnit) return value;
  const inInches = value * lengthUnitsToIn[oldUnit];
  return inInches / lengthUnitsToIn[newUnit];
}

const volumeUnitsToGallons: { [K in volumeUnitsT]: number } = {
  "gal": 1,
  "liters": 0.264172052358,
}

export function convertVolumeUnits(value: number, oldUnit: volumeUnitsT, newUnit: volumeUnitsT): number {
  if (oldUnit === newUnit) return value;
  const inGallons = value * volumeUnitsToGallons[oldUnit];
  return inGallons / volumeUnitsToGallons[newUnit];
}

export function convertFuelUnits(value: number, oldUnit: fuelUnitsT, newUnit: fuelUnitsT): number {
  if (oldUnit === newUnit) return value;
  const select: (HTMLSelectElement | null) = document.getElementById("fuelDensity") as HTMLSelectElement;
  if (!select) return -1;
  let density = Number(select.value)
  if (!density) {
    const input: (HTMLInputElement | null) = document.getElementById("fuelDensityInput") as HTMLInputElement;
    density = Number(input.value)
  }
  if (volumeUnits.includes(oldUnit as volumeUnitsT) && volumeUnits.includes(newUnit as volumeUnitsT)) {
    return convertVolumeUnits(value, oldUnit as volumeUnitsT, newUnit as volumeUnitsT);
  }
  if (weightUnits.includes(oldUnit as weightUnitsT) && weightUnits.includes(newUnit as weightUnitsT)) {
    return convertWeightUnit(value, oldUnit as weightUnitsT, newUnit as weightUnitsT);
  }
  if (!density) {
    console.error("ERROR: Missing density for fuel units conversion")
    return -1;
  }
  if (weightUnits.includes(oldUnit as weightUnitsT))
    return convertVolumeUnits(convertWeightUnit(value, oldUnit as weightUnitsT, 'lbs') / density, 'gal', newUnit as volumeUnitsT);
  else
    return convertWeightUnit(convertVolumeUnits(value, oldUnit as volumeUnitsT, 'gal') * density, 'lbs', newUnit as weightUnitsT);
}
