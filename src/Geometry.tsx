import { useState } from "react";
import "./Geometry.css"
import { VerticalRegion, HorizontalRegion, Subregion, Grouping } from "./Layout";

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

function WeightLimits({name = undefined}) {
  let title = <label>{name}</label>;
  if (!name) {
    title = (
      <input placeholder="Limit Name"/>
    )
  }
  return (
    <div className="weightLimit">
      <HorizontalRegion>
        {title}
        <input placeholder="Weight"/>
      </HorizontalRegion>
    </div>
  );
}

function WeightRegion({name = undefined}) {
  return (
    <div className="weightRegion">
      <HorizontalRegion>
        <h4>Weight</h4>
        <h4>Arm</h4>
        <input placeholder="Weight"/>
        <input placeholder="Arm"/>
        <input placeholder="Weight"/>
        <input placeholder="Arm"/>
        <input placeholder="Weight"/>
        <input placeholder="Arm"/>
        <input placeholder="Weight"/>
        <input placeholder="Arm"/>
      </HorizontalRegion>
    </div>
  );
}

function SeatInput({seats, _key, setSeats}) {
  const seat = seats[_key];

  function update(e: Event) {
    if (e.target == null) return;
    const key = e.target.name.replace(_key, "");
    const tmp = JSON.parse(JSON.stringify(seats));
    tmp[_key][key] = e.target.value;
    localStorage.setItem("seats", JSON.stringify(tmp));
    setSeats(tmp);
  }

  function removeSeat(key) {
    const tmp = JSON.parse(JSON.stringify(seats));
    delete tmp[key];
    localStorage.setItem("seats", JSON.stringify(tmp));
    setSeats(tmp);
  }

  return (
    <div className="seatInput">
      <input name={"name" + _key} placeholder="Name" value={seat.name ? seat.name : ""} onChange={e => update(e)}/>
      <input name={"arm" + _key} placeholder="Arm" type="number" value={seat.arm ? seat.arm : ""} onChange={e => update(e)}/>
      <input name={"maxWeight" + _key} placeholder="Max Weight" type="number" value={seat.maxWeight ? seat.maxWeight : ""} onChange={e => update(e)}/>
      <input name={"seatCount" + _key} placeholder="Seat Count" min={1} type="number" value={seat.seatCount ? seat.seatCount : ""} onChange={e => update(e)}/>
      {_key !== "pilot" && <button onClick={() => removeSeat(_key)}>X</button>}
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

  if (localStorage.getItem("seats")) {
    def = JSON.parse(localStorage.getItem("seats"));
  }

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
        {Object.keys(seats).map(key => (
          <Grouping>
            <SeatInput key={key} seats={seats} _key={key} setSeats={setSeats}/>
          </Grouping>
        ))}
      </form>
    </div>
  );
}

function CargoInput({cargo, _key, setCargo}) {
  const area = cargo[_key];

  function update(e: Event) {
    if (e.target == null) return;
    const key = e.target.name.replace(_key, "");
    const tmp = JSON.parse(JSON.stringify(cargo));
    tmp[_key][key] = e.target.value;
    localStorage.setItem("cargo", JSON.stringify(tmp));
    setCargo(tmp);
  }

  function removeCargo(key) {
    const tmp = JSON.parse(JSON.stringify(cargo));
    delete tmp[key];
    localStorage.setItem("cargo", JSON.stringify(tmp));
    setCargo(tmp);
  }

  return (
    <div className="cargoInput">
      <input name={"name" + _key} placeholder="Name" value={area.name ? area.name : ""} onChange={e => update(e)}/>
      <input name={"arm" + _key} placeholder="Arm" type="number" value={area.arm ? area.arm : ""} onChange={e => update(e)}/>
      <input name={"maxWeight" + _key} placeholder="Max Weight" type="number" value={area.maxWeight ? area.maxWeight : ""} onChange={e => update(e)}/>
      <button onClick={() => removeCargo(_key)}>X</button>
    </div>
  );
}

function CargoConfig() {
  let def = {};
  if (localStorage.getItem("cargo")) {
    def = JSON.parse(localStorage.getItem("cargo"));
  }

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
        {Object.keys(cargo).map(key => (
          <Grouping>
            <CargoInput key={key} cargo={cargo} _key={key} setCargo={setCargo}/>
          </Grouping>
        ))}
      </form>
    </div>
  );
}

function AircraftLimits() {
  let [regionCount, setRegionCount] = useState(0);
  return (
    <>
      <section id="limits">
        <WeightLimits name={"Max Ramp"}/>
        <WeightLimits name={"Max Takeoff"}/>
        <WeightLimits name={"Max Landing"}/>
        <WeightLimits name={"Max Zero Fuel"}/>
      </section>
      <section id="regions">
        <WeightRegion name={"Standard"}/>
        {Array(regionCount).fill(null).map((_, index) => (
          <WeightRegion key={index}/>
        ))}
        <button onClick={() => setRegionCount(regionCount + 1)}>Add Region</button>
        <button onClick={() => setRegionCount(Math.max(regionCount - 1, 0))}>Remove Region</button>
      </section>
    </>
  );
}

function Geometry() {
  return (
    <>
      <h2>GEOMETRY</h2>
      <Subregion>
        <AircraftConfig />
      </Subregion>
      <Subregion>
        <AircraftLimits />
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
