import type { configT, maxMomentObjectT, momentObjectT } from './Types';

export function getSortedByArm<T extends (maxMomentObjectT | momentObjectT)>(data: T[]) {
  const tmp: T[] = JSON.parse(JSON.stringify(data));
  return tmp.sort((a, b) => {
    return a.arm - b.arm;
  }).filter((s: T) => s != undefined);
}

export function calculateEmptyBalanceForConfig(config: configT, selectedConfig: string): [number, number] {
  let weight = config.config.emptyWeight;
  let moment = config.config.emptyWeight * config.config.emptyArm;

  // Equipment
  const selectedConfigIndex = config.aircraftConfigs.findIndex(v => v.id === selectedConfig);
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

export function calculateMaxBalanceForConfig(config: configT, selectedConfig: string): [number, number] {
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

export function calculateBalanceForOperationConfig(config: configT, selectedConfig: string, selectedOpsConfig: string): [number, number] {
  let [weight, arm] = calculateEmptyBalanceForConfig(config, selectedConfig);
  let moment = weight * arm;

  const selectedOpsConfigIndex = config.operationConfigs.findIndex(v => v.id === selectedOpsConfig);

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
