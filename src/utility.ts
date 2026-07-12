import { type aircraftT, type configT, type fuelLoadT, type fuelTankT, type loadingT, type maxMomentObjectT, type momentObjectT, type regionT } from './Types';

export const activeConfigBuilder = "activeConfigBuilder"
export const savedBuilderConfigs = "savedBuilderConfigs"
export const activeConfigData = "activeConfig"
export const uploadedConfigs = "savedConfigs"

export function getSortedByArm<T extends (maxMomentObjectT | momentObjectT)>(data: T[]) {
  const tmp: T[] = JSON.parse(JSON.stringify(data));
  return tmp.sort((a, b) => {
    return a.arm - b.arm;
  }).filter((s: T) => s != undefined);
}

export function getSortedByArmClosest<T extends (maxMomentObjectT | momentObjectT)>(data: T[], target: number) {
  const tmp: T[] = JSON.parse(JSON.stringify(data));
  return tmp.sort((a, b) => Math.abs(a.arm - target) - Math.abs(b.arm - target))
    .filter(s => s != undefined);
}

export function calculateMAC(arm: number, mac: (number | undefined), leadingMac: (number | undefined), useMAC: boolean = false): number {
  if (!useMAC || leadingMac == undefined || mac == undefined || mac == 0) return arm;
  return (arm - leadingMac) / mac * 100;
}

function linesIntersect(p11: momentObjectT, p12: momentObjectT, p21: momentObjectT, p22: momentObjectT): number {
  const a1 = p12.weight - p11.weight;
  const b1 = p11.arm - p12.arm;
  const c1 = (p12.arm * p11.weight) - (p11.arm * p12.weight);

  let d1 = (a1 * p21.arm) + (b1 * p21.weight) + c1;
  let d2 = (a1 * p22.arm) + (b1 * p22.weight) + c1;

  if (d1 > 0 && d2 > 0) return 0;
  if (d1 < 0 && d2 < 0) return 0;

  const a2 = p22.weight - p21.weight;
  const b2 = p21.arm - p22.arm;
  const c2 = (p22.arm * p21.weight) - (p21.arm * p22.weight);

  d1 = (a2 * p11.arm) + (b2 * p11.weight) + c2;
  d2 = (a2 * p12.arm) + (b2 * p12.weight) + c2;

  if (d1 > 0 && d2 > 0) return 0;
  if (d1 < 0 && d2 < 0) return 0;

  if ((a1 * b2) - (a2 * b1) === 0) return 2;

  return 1;
}

export const withinRegion = (region: regionT, weight: number, arm: number) => {
  // Quick bounding box check
  const minWeight = region.data.reduce((min, p) => p.weight < min ? p.weight : min, region.data[0].weight);
  const maxWeight = region.data.reduce((max, p) => p.weight > max ? p.weight : max, region.data[0].weight);
  const minArm = region.data.reduce((min, p) => p.arm < min ? p.arm : min, region.data[0].arm);
  const maxArm = region.data.reduce((max, p) => p.arm > max ? p.arm : max, region.data[0].arm);
  if (weight < minWeight || weight > maxWeight || arm < minArm || arm > maxArm) return false;

  let intersections = 0;
  for (let p = 0; p < region.data.length - 1; p++) {
    intersections += linesIntersect({ arm: minArm - 1, weight: weight }, { arm: arm, weight: weight }, region.data[p], region.data[p + 1]);
  }

  return (intersections & 1) === 1;
}

export function calculateEmptyBalanceForConfig(config: aircraftT, selectedConfig: string): [number, number] {
  let weight = config.properties.emptyWeight;
  let moment = config.properties.emptyWeight * config.properties.emptyArm;

  const selectedConfigIndex = config.aircraftConfigs.findIndex(v => v.id === selectedConfig);

  // Fuel
  config.fuelTanks.map(
    (fuelTank) => {
      const usedTank = !fuelTank.removable || config.aircraftConfigs[selectedConfigIndex].fuelTanks.includes(fuelTank.id);
      if (!usedTank) return;
      weight += Math.max(Number(fuelTank.unusable), 0);
      moment += Math.max(Number(fuelTank.unusable), 0) * fuelTank.arm;
    });

  // Equipment
  if (selectedConfigIndex < 0) return [weight, moment / weight];
  config.aircraftConfigs[selectedConfigIndex].equipment.map(
    (equipment) => {
      const equipIndex = config.equipment.findIndex(e => e.id === equipment.id);
      if (equipIndex < 0) return;
      weight += Math.max(Number(equipment.count), 0) * Math.max(Number(config.equipment[equipIndex].weight), 0);
      moment += Math.max(Number(equipment.count), 0) * Math.max(Number(config.equipment[equipIndex].weight), 0) * config.equipment[equipIndex].arm;
    });
  return [weight, moment / weight]
}

export function calculateMaxBalanceForConfig(config: aircraftT, selectedConfig: string): [number, number] {
  let weight = config.properties.emptyWeight;
  let moment = config.properties.emptyWeight * config.properties.emptyArm;

  const selectedConfigIndex = config.aircraftConfigs.findIndex(v => v.id === selectedConfig);
  if (selectedConfigIndex < 0) return [weight, moment / weight];

  // Seats
  config.aircraftConfigs[selectedConfigIndex].seats.map(
    (seat) => {
      const seatIndex = config.seats.findIndex(s => s.id === seat);
      if (seatIndex < 0) return;
      const seatData = config.seats[seatIndex];
      weight += Math.max(Number(seatData.maxWeight), 0) * Math.max(Number(seatData.seatCount), 0);
      moment += Math.max(Number(seatData.maxWeight), 0) * Math.max(Number(seatData.seatCount), 0) * seatData.arm;
    });

  // Cargo
  config.aircraftConfigs[selectedConfigIndex].cargoAreas.map(
    (cargoArea) => {
      const cargoAreaIndex = config.cargoAreas.findIndex(c => c.id === cargoArea);
      if (cargoAreaIndex < 0) return;
      const cargoAreaData = config.cargoAreas[cargoAreaIndex];
      weight += Math.max(Number(cargoAreaData.maxWeight), 0);
      moment += Math.max(Number(cargoAreaData.maxWeight), 0) * cargoAreaData.arm;
    });

  // Fuel
  config.fuelTanks.map(
    (fuelTank) => {
      const usedTank = !fuelTank.removable || config.aircraftConfigs[selectedConfigIndex].fuelTanks.includes(fuelTank.id);
      if (!usedTank) return;
      weight += Math.max(Number(fuelTank.maxWeight), 0);
      moment += Math.max(Number(fuelTank.maxWeight), 0) * fuelTank.arm;
    });

  // Equipment
  config.aircraftConfigs[selectedConfigIndex].equipment.map(
    (equipment) => {
      const equipIndex = config.equipment.findIndex(e => e.id === equipment.id);
      if (equipIndex < 0) return;
      const equipmentData = config.equipment[equipIndex];
      weight += Math.max(Number(equipment.count), 0) * Math.max(Number(equipmentData.weight), 0);
      moment += Math.max(Number(equipment.count), 0) * Math.max(Number(equipmentData.weight), 0) * equipmentData.arm;
    });
  return [weight, moment / weight]
}

export function calculateBalanceForOperationConfig(config: aircraftT, selectedOpsConfig: string): [number, number] {
  const selectedOpsConfigIndex = config.operationConfigs.findIndex(v => v.id === selectedOpsConfig);
  if (selectedOpsConfigIndex < 0) return [0, 0];

  let [weight, arm] = calculateEmptyBalanceForConfig(config, config.operationConfigs[selectedOpsConfigIndex].config);
  let moment = weight * arm;

  // Seats
  config.operationConfigs[selectedOpsConfigIndex].seats.map(
    (seat) => {
      const seatIndex = config.seats.findIndex(s => s.id === seat.id);
      if (seatIndex < 0) return;
      const seatData = config.seats[seatIndex];
      weight += Math.max(Number(seat.weight), 0);
      moment += Math.max(Number(seat.weight), 0) * seatData.arm;
    });

  // Cargo
  config.operationConfigs[selectedOpsConfigIndex].cargoAreas.map(
    (cargoArea) => {
      const cargoAreaIndex = config.cargoAreas.findIndex(c => c.id === cargoArea.id);
      if (cargoAreaIndex < 0) return;
      const cargoAreaData = config.cargoAreas[cargoAreaIndex];
      weight += Math.max(Number(cargoArea.weight), 0);
      moment += Math.max(Number(cargoArea.weight), 0) * cargoAreaData.arm;
    });

  return [weight, moment / weight]
}

export function calculateBalanceForZeroFuel(aircraft: aircraftT, selectedOpsConfig: string, loading: loadingT): [number, number] {
  let [weight, arm] = calculateBalanceForOperationConfig(aircraft, selectedOpsConfig);
  let moment = arm * weight;

  // Passengers
  loading.passengers.forEach(
    (seat) => {
      const seatIndex = aircraft.seats.findIndex(s => s.id === seat.location);
      if (seatIndex < 0) return;
      const seatData = aircraft.seats[seatIndex];
      weight += Math.max(Number(seat.count), 0) * Math.max(Number(seat.avgWeight), 0);
      moment += Math.max(Number(seat.count), 0) * Math.max(Number(seat.avgWeight), 0) * seatData.arm;
    }
  )

  // Cargo
  loading.cargo.forEach(
    (cargo) => {
      const cargoIndex = aircraft.cargoAreas.findIndex(c => c.id === cargo.location);
      if (cargoIndex < 0) return;
      const cargoData = aircraft.cargoAreas[cargoIndex];
      weight += Math.max(Number(cargo.weight), 0);
      moment += Math.max(Number(cargo.weight), 0) * cargoData.arm;
    }
  )

  // Unusable Fuel
  loading.fuel.forEach(
    (fuel) => {
      const fuelIndex = aircraft.fuelTanks.findIndex(f => f.id === fuel.tank);
      if (fuelIndex < 0) return;
      const fuelData = aircraft.fuelTanks[fuelIndex];
      weight += fuelData.unusable;
      moment += fuelData.unusable * fuelData.arm;
    }
  )

  return [weight, moment / weight];
}

export function calculateBalanceForLanding(aircraft: aircraftT, selectedOpsConfig: string, loading: loadingT): [number, number] {
  let [weight, arm] = calculateBalanceForOperationConfig(aircraft, selectedOpsConfig);
  let moment = arm * weight;

  // Passengers
  loading.passengers.forEach(
    (seat) => {
      const seatIndex = aircraft.seats.findIndex(s => s.id === seat.location);
      if (seatIndex < 0) return;
      const seatData = aircraft.seats[seatIndex];
      weight += Math.max(Number(seat.count), 0) * Math.max(Number(seat.avgWeight), 0);
      moment += Math.max(Number(seat.count), 0) * Math.max(Number(seat.avgWeight), 0) * seatData.arm;
    }
  )

  // Cargo
  loading.cargo.forEach(
    (cargo) => {
      const cargoIndex = aircraft.cargoAreas.findIndex(c => c.id === cargo.location);
      if (cargoIndex < 0) return;
      const cargoData = aircraft.cargoAreas[cargoIndex];
      weight += Math.max(Number(cargo.weight), 0);
      moment += Math.max(Number(cargo.weight), 0) * cargoData.arm;
    }
  )

  // Unused Fuel
  loading.fuel.forEach(
    (fuel) => {
      const fuelIndex = aircraft.fuelTanks.findIndex(f => f.id === fuel.tank);
      if (fuelIndex < 0) return;
      const fuelData = aircraft.fuelTanks[fuelIndex];
      weight += Math.max(Number(fuel.loadedFuel) - Number(fuel.tripFuel), 0);
      moment += (Math.max(Number(fuel.loadedFuel) - Number(fuel.tripFuel), 0)) * fuelData.arm;
    }
  )

  return [weight, moment / weight];
}

export function calculateBalanceForTakeoff(aircraft: aircraftT, selectedOpsConfig: string, loading: loadingT): [number, number] {
  let [weight, arm] = calculateBalanceForLanding(aircraft, selectedOpsConfig, loading);
  let moment = arm * weight;

  // Consumed Fuel
  loading.fuel.forEach(
    (fuel) => {
      const fuelIndex = aircraft.fuelTanks.findIndex(f => f.id === fuel.tank);
      if (fuelIndex < 0) return;
      const fuelData = aircraft.fuelTanks[fuelIndex];
      weight += Math.max(Number(fuel.tripFuel), 0);
      moment += Math.max(Number(fuel.tripFuel), 0) * fuelData.arm;
    }
  )

  return [weight, moment / weight];
}

// Priority is assumed that higher number fills last and consumes first
export function calculateBalancePointsForTanks(aircraft: aircraftT, selectedOpsConfig: string, loading: loadingT): momentObjectT[] {
  var groupBy = (xs: { tank: fuelTankT, load: fuelLoadT }[]) => {
    return xs.reduce((rv: { [key: number]: { tank: fuelTankT, load: fuelLoadT }[] }, x) => {
      (rv[x.tank.priority] ??= []).push(x);
      return rv;
    }, {});
  };

  // Get tanks sorted on priority
  const tankData = loading.fuel.map(t => {
    let tank = aircraft.fuelTanks.find(T => t.tank === T.id);
    if (tank === undefined) return;
    return { tank: tank, load: t };
  })
    .filter(t => t != undefined)
  const grouped = groupBy(tankData);

  // Get landing balance
  let [weight, arm] = calculateBalanceForTakeoff(aircraft, selectedOpsConfig, loading);
  let moment = arm * weight;
  const points: momentObjectT[] = [{ weight: weight, arm: arm }];

  // Loop over each tank group
  for (const [_, group] of Object.entries(grouped).reverse()) {

    // Sort the tank group data by consumed fuel
    const sortedGroup = group.sort((a, b) => a.load.tripFuel - b.load.tripFuel);

    // Loop over each tank in group and add a point as each tank empties
    let totalConsumedFuel = 0;
    for (const { tank: _, load: load } of Object.values(sortedGroup)) {
      // Get the segment of consumed fuel by all tanks in group
      let segmentConsumedFuel = Math.max(load.tripFuel - totalConsumedFuel, 0);
      // Remove the segment fuel amount from each tank in group if they more to give
      for (const { tank: fuelTankI, load: loadI } of Object.values(sortedGroup)) {
        if (totalConsumedFuel >= loadI.tripFuel) continue;
        weight -= (Math.min(segmentConsumedFuel, loadI.tripFuel))
        moment -= (Math.min(segmentConsumedFuel, loadI.tripFuel)) * fuelTankI.arm;
      }
      totalConsumedFuel += segmentConsumedFuel;
      // Add point for each tank in group (TODO: This may result in duplicates)
      points.push({ weight: weight, arm: moment / weight });
    }
  }

  // Last Point (should be unnecessary as this should match takeoff load);
  points.push({ weight: weight, arm: moment / weight });
  return points;
}

export function truncateNumber(n: number, precision: number): number {
  if (n < 0) return Math.ceil(n * precision) / precision;
  return Math.floor(n * precision) / precision;
}

export function roundNumber(n: number, precision: number): number {
  return Math.round(n * precision) / precision;
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

export function validateConfig(config: Object) {
  if (!Array.isArray((config as configT).aircraft)) return false;
  const aircraft = (config as configT).aircraft
  for (const plane of aircraft) {
    if (!(
      typeof plane.properties === 'object' &&
      typeof plane.limits === 'object' &&
      Array.isArray(plane.seats) &&
      Array.isArray(plane.cargoAreas) &&
      Array.isArray(plane.fuelTanks) &&
      Array.isArray(plane.equipment) &&
      Array.isArray(plane.aircraftConfigs) &&
      Array.isArray(plane.operationConfigs)
    )) return false;
  }

  return (
    config != null &&
    typeof config === 'object' &&
    typeof (config as configT).setup === 'object' &&
    typeof (config as configT).name === 'string' &&
    Array.isArray((config as configT).aircraft)
  )
}
