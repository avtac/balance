import { useState, type BaseSyntheticEvent } from "react";
import "./Geometry.css"
import { VerticalRegion, HorizontalRegion, Subregion, Grouping } from "./Layout";
import type { regionT, regionPointT, weightLimitT } from "./Types";

const availableStyles = [['solid', ''], ['dashed', '1 1'], ['dotted', '.3 1'], ['dot dash', '3 2 .4 2']]

function AircraftConfig() {
  return (
    <section id="geometry">
      <VerticalRegion>
        <h3>Tail Number</h3>
        <input placeholder="Tail Number" />
      </VerticalRegion>
      <VerticalRegion>
        <h3>Empty Weight</h3>
        <input type="number" placeholder="Empty Weight"/>
      </VerticalRegion>
      <VerticalRegion>
        <h3>Empty Moment</h3>
        <input type="number" placeholder="Empty Arm"/>
      </VerticalRegion>
    </section>
  );
}

function WeightLimit({limit, config, setConfig}) {
  const index = config.limits.limits.findIndex((lim: weightLimitT) => lim.id === limit.id);
  if (index < 0) return;

  function setValue(key: string, value: (string | number)) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.limits[index][key] = value;
    setConfig(tmp);
  }

  function removeLimit() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.limits.splice(index, 1);
    setConfig(tmp);
  }

  return (
    <div className="weightLimit grouping">
      <input placeholder="Limit Name" defaultValue={limit.name} onChange={e => setValue("name", e.target.value)}/>
      <input placeholder="Weight" type="number" defaultValue={limit.value} onChange={e => setValue("value", Number(e.target.value))}/>
      <input type="color" value={limit.color} onChange={e => setValue('color', e.target.value)} />
      <select onChange={e => setValue('lineStyle', e.target.value)}>
        {availableStyles.map((style: string[]) => <option key={style[0]} value={style[1]}>{style[0]}</option>)}
      </select>
      <button onClick={removeLimit}>X</button>
    </div>
  );
}

      // <select onChange={e => setValue('color', e.target.value)}>
      //   {availableColors.map((color: string) => <option key={color} value={color}>{color}</option>)}
      // </select>
function WeightRegionRow({data, config, setConfig, regionIndex, index, isLast = false }) {

  function setWeight(weight: number) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].data[index].weight = weight;
    setConfig(tmp);
  }

  function setArm(arm: number) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].data[index].arm = arm;
    setConfig(tmp);
  }

  function addPoint() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].data.splice(index, 0, {arm: data.arm, weight: data.weight, id: crypto.randomUUID()});
    setConfig(tmp);
  }

  function deletePoint() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].data.splice(index, 1);
    setConfig(tmp);
  }

  // <h4>Weight</h4>
  // <h4>Arm</h4>
  return (
    <>
    <div className="weightRegionRow">
      <input placeholder="Weight" min={0} step={10} type="number" defaultValue={data.weight} onChange={e => setWeight(Number(e.target.value))}/>
      <input placeholder="Arm" type="number"  defaultValue={data.arm} onChange={e => setArm(Number(e.target.value))}/>
      {config.limits.regions[regionIndex].data.length > 3 && <button onClick={deletePoint}>X</button>}
      {<button className="addButton" onClick={addPoint}></button>}
    </div>
    </>
  );
  // TODO: Add function to button
}

function WeightRegion({region, config, setConfig, nameString = ""}) {
  const regionIndex = config.limits.regions.findIndex((reg: regionT) => reg.id === region.id);
  if (regionIndex < 0) {
    console.log("Warning: Did not find region index in config");
    return;
  }

  function setName(name: string) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].name = name;
    setConfig(tmp);
  }

  function removeRegion() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions.splice(regionIndex, 1);
    setConfig(tmp);
  }

  function setColor(color: string) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].color = color;
    setConfig(tmp);
  }

  function setStyle(style: string) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].lineStyle = style;
    setConfig(tmp);
  }

  const name = region.name;
  return (
    <Grouping>
    <div className="weightRegion">
      <h4>{name != "" ? name : "Weight Region"}</h4>
      <div className="title">
        <input placeholder="Name" defaultValue={name} onChange={e => setName(e.target.value)}/>
        <input type="color" value={region.color} onChange={e => setColor(e.target.value)} />
        <select onChange={e => setStyle(e.target.value)}>
          {availableStyles.map((style: string[]) => <option key={style[0]} value={style[1]}>{style[0]}</option>)}
        </select>
        <button onClick={removeRegion}>X</button>
      </div>
      {region.data.map((data: regionPointT, index: number) => {
        return <WeightRegionRow key={data.id} config={config} regionIndex={regionIndex} setConfig={setConfig} index={index} data={data} isLast={index === region.data.length - 1}/>
      })}
    </div>
    </Grouping>
  );
}

function SeatInput({seats, id, setSeats}) {
  const seat = seats[id];

  function update(e: BaseSyntheticEvent) {
    if (e.target == null) return;
    const key = e.target.value.replace(id, "");
    const tmp = JSON.parse(JSON.stringify(seats));
    tmp[id][key] = e.target.value;
    localStorage.setItem("seats", JSON.stringify(tmp));
    setSeats(tmp);
  }

  function removeSeat(id: string) {
    const tmp = JSON.parse(JSON.stringify(seats));
    delete tmp[id];
    localStorage.setItem("seats", JSON.stringify(tmp));
    setSeats(tmp);
  }

  return (
    <div className="seatInput">
      <input name={"name" + id} placeholder="Name" value={seat.name ? seat.name : ""} onChange={e => update(e)}/>
      <input name={"arm" + id} placeholder="Arm" type="number" value={seat.arm ? seat.arm : ""} onChange={e => update(e)}/>
      <input name={"maxWeight" + id} placeholder="Max Weight" type="number" value={seat.maxWeight ? seat.maxWeight : ""} onChange={e => update(e)}/>
      <input name={"seatCount" + id} placeholder="Seat Count" min={1} type="number" value={seat.seatCount ? seat.seatCount : ""} onChange={e => update(e)}/>
      {id !== "pilot" && <button onClick={() => removeSeat(id)}>X</button>}
    </div>
  );
}

function SeatConfig() {
  let def = {"pilot": {
      name: "Pilot Seat",
      arm: 0,
      seatCount: 1,
      maxWeight: 300
    }
  };

  const storageSeats = localStorage.getItem("seats");
  if (storageSeats !== null)
    def = JSON.parse(storageSeats);

  let [seats, setSeats] = useState(def);

  function addSeat() {
    const tmp = JSON.parse(JSON.stringify(seats));
    tmp[crypto.randomUUID()] = {name: "New", arm: 0, seatCount: 1, maxWeight: 300};
    setSeats(tmp);
  }

  return (
    <div id="seatConfig">
      <h3>Seat Config</h3>
      <button onClick={addSeat}>Add Seat</button>
      <form id="seatsForm">
        {Object.keys(seats).map(id => (
          <Grouping key={id}>
            <SeatInput key={id} seats={seats} id={id} setSeats={setSeats}/>
          </Grouping>
        ))}
      </form>
    </div>
  );
}

function CargoInput({cargo, id, setCargo}) {
  const area = cargo[id];

  function update(e: BaseSyntheticEvent) {
    if (e.target == null) return;
    const key = e.target.name.replace(id, "");
    const tmp = JSON.parse(JSON.stringify(cargo));
    tmp[id][key] = e.target.value;
    localStorage.setItem("cargo", JSON.stringify(tmp));
    setCargo(tmp);
  }

  function removeCargo(id: string) {
    const tmp = JSON.parse(JSON.stringify(cargo));
    delete tmp[id];
    localStorage.setItem("cargo", JSON.stringify(tmp));
    setCargo(tmp);
  }

  return (
    <div className="cargoInput">
      <input name={"name" + id} placeholder="Name" value={area.name ? area.name : ""} onChange={e => update(e)}/>
      <input name={"arm" + id} placeholder="Arm" type="number" value={area.arm ? area.arm : ""} onChange={e => update(e)}/>
      <input name={"maxWeight" + id} placeholder="Max Weight" type="number" value={area.maxWeight ? area.maxWeight : ""} onChange={e => update(e)}/>
      <button onClick={() => removeCargo(id)}>X</button>
    </div>
  );
}

function CargoConfig() {
  let def = {};

  const storageSeats = localStorage.getItem("cargo");
  if (storageSeats !== null)
    def = JSON.parse(storageSeats);

  let [cargo, setCargo] = useState(def);

  function addCargo() {
    const tmp = JSON.parse(JSON.stringify(cargo));
    tmp[crypto.randomUUID()] = {name: "New", arm: 0, seatCount: 1, maxWeight: 300};
    setCargo(tmp);
  }

  return (
    <div id="cargoConfig">
      <h3>Cargo Config</h3>
      <button onClick={addCargo}>Add Cargo Area</button>
      <form id="cargoForm">
        {Object.keys(cargo).map(id => (
          <Grouping key={id}>
            <CargoInput key={id} cargo={cargo} id={id} setCargo={setCargo}/>
          </Grouping>
        ))}
      </form>
    </div>
  );
}

function AircraftLimits({config, setConfig}) {
  function addLimit() {
    const tmp = JSON.parse(JSON.stringify(config));
    const newLimit: weightLimitT = {
      name: "",
      id: crypto.randomUUID(),
      value: null,
      color: '#FFFFFF'
    };
    tmp.limits.limits.push(newLimit);
    setConfig(tmp);
  }

  function addRegion() {
    const tmp = JSON.parse(JSON.stringify(config));
    const newLimit: regionT = {
      name: "",
      id: crypto.randomUUID(),
      color: '#FFFFFF',
      data: [
        {id: crypto.randomUUID(), weight: 1000, arm: 10},
        {id: crypto.randomUUID(), weight: 2000, arm: 10},
        {id: crypto.randomUUID(), weight: 2000, arm: 20},
        {id: crypto.randomUUID(), weight: 1000, arm: 20}
      ]
    };
    tmp.limits.regions.push(newLimit);
    setConfig(tmp);
  }

  return (
      <HorizontalRegion>
        <section id="limits">
          {config.limits.limits.map((limit: weightLimitT) => {
            return <WeightLimit key={limit.id} limit={limit} config={config} setConfig={setConfig} />
          })}
          <button onClick={() => addLimit()}>Add Limit</button>
        </section>
        <section id="regions">
          {config.limits.regions.map((region: regionT) => (
            <WeightRegion key={region.id} region={region} config={config} setConfig={setConfig}/>
          ))}
          <button onClick={addRegion}>Add Region</button>
        </section>
      </HorizontalRegion>
  );
}

function Geometry({config, setConfig}) {

  return (
    <>
      <h2>GEOMETRY</h2>
      <Subregion>
        <AircraftConfig />
      </Subregion>
      <Subregion>
        <AircraftLimits config={config} setConfig={setConfig} />
      </Subregion>
      <Subregion>
        <HorizontalRegion>
          <SeatConfig />
          <CargoConfig />
        </HorizontalRegion>
      </Subregion>
    </>
  );
}

export default Geometry;
