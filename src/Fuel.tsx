import { Grouping, Subregion } from "./Layout";
import type { fuelTankT, aircraftProps, aircraftT } from "./Types";

interface fuelInputProps extends aircraftProps {
  area: fuelTankT,
  index: number
}

function FuelInput({ area, index, aircraft, setAircraft }: fuelInputProps) {

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
        value={area.name ? area.name : ""}
        onChange={e => setValue('name', e.target.value)} />
      <input
        name={"arm" + index}
        placeholder="Arm"
        type="number"
        value={area.arm ? area.arm : ""}
        onChange={e => setValue('arm', Number(e.target.value))} />
      <input
        name={"maxWeight" + index}
        placeholder="Max Weight"
        type="number"
        value={area.maxWeight ? area.maxWeight : ""}
        onChange={e => setValue('maxWeight', Number(e.target.value))} />
      <input
        name={"unusable" + index}
        placeholder="Unusable"
        type="number"
        value={area.unusable ? area.unusable : ""}
        onChange={e => setValue('unusable', Number(e.target.value))} />
      <button onClick={() => removeFuel()}>X</button>
    </div>
  );
}

function FuelConfig({ aircraft, setAircraft }: aircraftProps) {

  function addFuel(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.fuelTanks.push({
      id: crypto.randomUUID(),
      name: "",
      arm: 0,
      maxWeight: 300,
      unusable: 0,
    });
    setAircraft(tmp);
  }

  return (
    <Subregion>
      <div id="fuelConfig">
        <h3>Fuel Config</h3>
        <button onClick={addFuel}>Add Fuel Tank</button>
        <form id="fuelForm">
          {aircraft.fuelTanks.map((area: fuelTankT, index: number) => (
            <Grouping key={area.id}>
              <FuelInput
                area={area}
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
