import { Grouping, Subregion } from "../Layout";
import type { cargoAreaT, aircraftProps, aircraftT } from "../Types";

interface cargoInputProps extends aircraftProps {
  area: cargoAreaT,
  index: number
}

function CargoInput({ area, index, aircraft, setAircraft }: cargoInputProps) {

  function setValue<T extends keyof cargoAreaT, V extends cargoAreaT[T]>(name: T, value: V): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.cargoAreas[index][name] = value;
    setAircraft(tmp);
  }

  function removeCargo(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.cargoAreas.splice(index, 1);
    // TODO: check if any configs use this cargo id and remove it
    setAircraft(tmp);
  }

  return (
    <div className="cargoInput">
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
      <button onClick={() => removeCargo()}>X</button>
    </div>
  );
}

function CargoConfig({ aircraft, setAircraft }: aircraftProps) {

  function addCargo(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.cargoAreas.push({
      id: crypto.randomUUID(),
      name: "",
      arm: 0,
      maxWeight: 300
    });
    setAircraft(tmp);
  }

  return (
    <Subregion>
      <div id="cargoConfig">
        <h3>Cargo Config</h3>
        <button onClick={addCargo}>Add Cargo Area</button>
        <form id="cargoForm">
          {aircraft.cargoAreas.map((area: cargoAreaT, index: number) => (
            <Grouping key={area.id}>
              <CargoInput
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

export { CargoConfig }
