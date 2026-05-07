import { useState } from "react";
import "./Geometry.css"
import { VerticalRegion, HorizontalRegion, Subregion } from "./Layout";

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

function SeatInput({name=undefined}) {
  return (
    <div className="seatInput">
      {name != undefined ? (
        <p>{name}</p>
      ) : (
        <input placeholder="Name" />
      )}
      <input placeholder="Arm"/>
      <input placeholder="Max Weight"/>
      <input placeholder="Seat Count"/>
    </div>
  );
}

function SeatConfig() {
  return (
    <div id="seatConfig">
      <h3>Seat Config</h3>
      <SeatInput name={"Pilot Seat"}/>
      <SeatInput />
    </div>
  );
}

function CargoInput({name=undefined}) {
  return (
    <div className="seatInput">
      {name != undefined ? (
        <p>{name}</p>
      ) : (
        <input placeholder="Name" />
      )}
      <input placeholder="Arm"/>
      <input placeholder="Max Weight"/>
      <input placeholder="Seat Count"/>
    </div>
  );
}

function CargoConfig() {
  let [count, setCount] = useState(1);
  return (
    <div id="cargoConfig">
      <h3>Cargo Config</h3>
        {Array(count).fill(null).map((_, index) => (
          <CargoInput key={index}/>
        ))}
      <button onClick={() => setCount(count + 1)}>Add Cargo Area</button>
      <button onClick={() => setCount(Math.max(count - 1, 1))}>Remove Cargo Area</button>
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
