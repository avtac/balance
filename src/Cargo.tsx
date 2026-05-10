import { Grouping, Subregion } from "./Layout";
import type { cargoAreaT } from "./Types";

function CargoInput({area, index, config, setConfig}) {

  function setValue(name: string, value: (string | number)) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.cargoAreas[index][name] = value;
    setConfig(tmp);
  }

  function removeCargo() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.cargoAreas.splice(index, 1);
    setConfig(tmp);
  }

  return (
    <div className="cargoInput">
      <input name={"name" + index} placeholder="Name" value={area.name ? area.name : ""} onChange={e => setValue('name', e.target.value)}/>
      <input name={"arm" + index} placeholder="Arm" type="number" value={area.arm ? area.arm : ""} onChange={e => setValue('arm', e.target.value)}/>
      <input name={"maxWeight" + index} placeholder="Max Weight" type="number" value={area.maxWeight ? area.maxWeight : ""} onChange={e => setValue('maxWeight', e.target.value)}/>
      <button onClick={() => removeCargo()}>X</button>
    </div>
  );
}

function CargoConfig({config, setConfig}) {

  function addCargo() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.cargoAreas.push({ id: crypto.randomUUID(), name: "", arm: 0, maxWeight: 300});
    setConfig(tmp);
  }

  return (
    <Subregion>
      <div id="cargoConfig">
        <h3>Cargo Config</h3>
        <button onClick={addCargo}>Add Cargo Area</button>
        <form id="cargoForm">
          {config.cargoAreas.map((area: cargoAreaT, index: number) => (
            <Grouping key={area.id}>
              <CargoInput area={area} index={index} config={config} setConfig={setConfig}/>
            </Grouping>
          ))}
        </form>
      </div>
    </Subregion>
  );
}

export { CargoConfig }
