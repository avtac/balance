import { useContext } from "react";
import { Grouping, Subregion } from "../Layout";
import { type fuelTankT, type aircraftProps, type aircraftT, baseLengthUnit, baseFuelUnit } from "../Types";
import { convertFuelUnits, convertLengthUnit, UnitContext, unitPrecision } from "../UnitsContext";
import { roundNumber } from "../utility";

interface fuelInputProps extends aircraftProps {
  tank: fuelTankT,
  index: number
}

function FuelInput({ tank, index, aircraft, setAircraft }: fuelInputProps) {
  const units = useContext(UnitContext);

  function setValue<T extends keyof fuelTankT, V extends fuelTankT[T]>(name: T, value: V): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.fuelTanks[index][name] = value;
    setAircraft(tmp);
  }

  function removeFuel(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.fuelTanks.splice(index, 1);
    // TODO: check if any configs use this fuelTankT id and remove it
    setAircraft(tmp);
  }

  return (
    <div className="fuelInput">
      <input
        name={"name" + index}
        placeholder="Name"
        value={tank.name ? tank.name : ""}
        onChange={e => setValue('name', e.target.value)} />
      <input
        name={"arm" + index}
        placeholder={units.lengthUnits}
        type="number"
        value={tank.arm ? roundNumber(convertLengthUnit(tank.arm, baseLengthUnit, units.lengthUnits), unitPrecision) : ""}
        onChange={e => setValue('arm', convertLengthUnit(Number(e.target.value), units.lengthUnits, baseLengthUnit))} />
      <input
        name={"maxCapacity" + index}
        placeholder={units.fuelUnits}
        type="number"
        value={tank.maxWeight ? roundNumber(convertFuelUnits(tank.maxWeight, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision) : ""}
        onChange={e => setValue('maxWeight', convertFuelUnits(Number(e.target.value), units.fuelUnits, baseFuelUnit, units.fuelDensity))} />
      <input
        name={"unusable" + index}
        placeholder={units.fuelUnits}
        type="number"
        value={tank.unusable ? roundNumber(convertFuelUnits(tank.unusable, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision) : ""}
        onChange={e => setValue('unusable', convertFuelUnits(Number(e.target.value), units.fuelUnits, baseFuelUnit, units.fuelDensity))} />
      <input
        type="checkbox"
        checked={aircraft.fuelTanks[index].removable}
        onChange={e => setValue('removable', e.target.checked)} />
      <button onClick={() => removeFuel()}>X</button>
    </div>
  );
}

function FuelConfig({ aircraft, setAircraft }: aircraftProps) {
  const units = useContext(UnitContext);

  function addFuel(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.fuelTanks.push({
      id: crypto.randomUUID(),
      name: "",
      arm: 0,
      maxWeight: 300,
      unusable: 0,
      removable: false
    });
    setAircraft(tmp);
  }

  return (
    <Subregion>
      <div id="fuelConfig">
        <h3>Fuel Config</h3>
        <button onClick={addFuel}>Add Fuel Tank</button>
        <div className="fuelInput">
          <p>Name</p>
          <p>Arm ({units.lengthUnits})</p>
          <p>Max Fuel ({units.fuelUnits})</p>
          <p>Unusable Fuel ({units.fuelUnits})</p>
          <p>Removable?</p>
        </div>
        <form id="fuelForm">
          {aircraft.fuelTanks.map((tank: fuelTankT, index: number) => (
            <Grouping key={tank.id}>
              <FuelInput
                tank={tank}
                index={index}
                aircraft={aircraft}
                setAircraft={setAircraft} />
            </Grouping>
          ))}
        </form>
      </div>
    </Subregion>
  );
}

export { FuelConfig }
