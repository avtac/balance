import { useContext, useRef, type ReactNode } from "react";
import "./Geometry.css"
import { Subregion, Grouping } from "../Layout";
import { type regionT, type regionPointT, type weightLimitT, type aircraftProps, type aircraftT, type nameProps, baseLengthUnit, baseWeightUnit } from "../Types";
import { convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from "../UnitsContext";
import { roundNumber } from "../utility";

const availableStyles = [['solid', ''], ['dashed', '1 1'], ['dotted', '.3 1'], ['dot dash', '3 2 .4 2']]

interface weightLimitProps extends aircraftProps {
  limit: weightLimitT
}

function WeightLimit({ limit, aircraft, setAircraft }: weightLimitProps): ReactNode {
  const units = useContext(UnitContext);
  const index = aircraft.limits.limits.findIndex((lim: weightLimitT) => lim.id === limit.id);
  const timeRef = useRef(0);
  if (index < 0) return;

  function setValue<K extends keyof weightLimitT, V extends weightLimitT[K]>(key: K, value: V): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.limits[index][key] = value;
    setAircraft(tmp);
  }

  function setColor(color: string) {
    const now = Date.now();
    if (now - timeRef.current < 100) return;
    timeRef.current = now;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.limits[index]['color'] = color;
    setAircraft(tmp);
  }

  function removeLimit(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.limits.splice(index, 1);
    setAircraft(tmp);
  }

  return (
    <div className="weightLimit grouping">
      <input
        id={`geometryLimitName-${limit.id}`}
        placeholder="Limit Name"
        defaultValue={limit.name}
        onChange={e => setValue("name", e.target.value)} />
      <input
        id={`geometryLimitWeight-${limit.id}`}
        placeholder={units.weightUnits}
        type="number"
        value={limit.weight ? roundNumber(convertWeightUnit(limit.weight, baseWeightUnit, units.weightUnits), unitPrecision) : ""}
        onChange={e => setValue("weight", convertWeightUnit(Number(e.target.value), units.weightUnits, baseWeightUnit))} />
      <input
        id={`geometryLimitColor-${limit.id}`}
        type="color"
        value={limit.color}
        onChange={e => setColor(e.target.value)} />
      <select
        id={`geometryLimitStyle-${limit.id}`}
        value={limit.lineStyle}
        onChange={e => setValue('lineStyle', e.target.value)}>
        {availableStyles.map((style: string[]) => <option key={style[0]} value={style[1]}>{style[0]}</option>)}
      </select>
      <button onClick={removeLimit}>X</button>
    </div>
  );
}

interface weightRegionRowProps extends aircraftProps {
  regionPoint: regionPointT,
  regionIndex: number,
  index: number,
}

function WeightRegionRow({ regionPoint, aircraft, setAircraft, regionIndex, index }: weightRegionRowProps): ReactNode {
  const units = useContext(UnitContext);

  function setValue<K extends keyof regionPointT, V extends regionPointT[K]>(key: K, value: V): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.regions[regionIndex].data[index][key] = value;
    setAircraft(tmp);
  }

  function addPoint(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.regions[regionIndex].data.splice(index, 0, { arm: regionPoint.arm, weight: regionPoint.weight, id: crypto.randomUUID() });
    setAircraft(tmp);
  }

  function deletePoint(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.regions[regionIndex].data.splice(index, 1);
    setAircraft(tmp);
  }

  return (
    <>
      <div className="weightRegionRow">
        <input
          id={`geometryRegionPointWeight-${regionPoint.id}`}
          placeholder={units.weightUnits}
          min={0}
          step={10}
          type="number"
          value={regionPoint.weight ? roundNumber(convertWeightUnit(regionPoint.weight, baseWeightUnit, units.weightUnits), unitPrecision) : ""}
          onChange={e => setValue('weight', convertWeightUnit(Number(e.target.value), units.weightUnits, baseWeightUnit))} />
        <input
          id={`geometryRegionPointArm-${regionPoint.id}`}
          placeholder={units.lengthUnits}
          type="number"
          value={regionPoint.arm ? roundNumber(convertLengthUnit(regionPoint.arm, baseLengthUnit, units.lengthUnits), unitPrecision) : ""}
          onChange={e => setValue('arm', convertLengthUnit(Number(e.target.value), units.lengthUnits, baseLengthUnit))} />
        {aircraft.limits.regions[regionIndex].data.length > 3 &&
          <button onClick={deletePoint}>X</button>}
        {<button className="addButton" onClick={addPoint}></button>}
      </div>
    </>
  );
}

interface weightRegionProps extends aircraftProps {
  region: regionT
}

function WeightRegion({ region, aircraft, setAircraft }: weightRegionProps): ReactNode {
  const regionIndex = aircraft.limits.regions.findIndex((reg: regionT) => reg.id === region.id);
  const timeRef = useRef(0);

  if (regionIndex < 0) {
    console.log("Warning: Did not find region index in config");
    return;
  }

  function setValue<K extends keyof regionT, V extends regionT[K]>(key: K, value: V): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.regions[regionIndex][key] = value;
    setAircraft(tmp);
  }

  function removeRegion(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.regions.splice(regionIndex, 1);
    setAircraft(tmp);
  }

  function setColor(color: string): void {
    const now = Date.now();
    if (now - timeRef.current < 100) return;
    timeRef.current = now;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.limits.regions[regionIndex].color = color;
    setAircraft(tmp);
  }

  const name = region.name;
  return (
    <Grouping>
      <div className="weightRegion">
        <h4>{name != "" ? name : "Weight Region"}</h4>
        <div className="title">
          <input
            id={`geometryRegionName-${region.id}`}
            placeholder="Name"
            defaultValue={name}
            onChange={e => setValue('name', e.target.value)} />
          <input
            id={`geometryRegionColor-${region.id}`}
            type="color"
            value={region.color}
            onChange={e => setColor(e.target.value)} />
          <select
            id={`geometryRegionStyle-${region.id}`}
            value={region.lineStyle}
            onChange={e => setValue('lineStyle', e.target.value)}>
            {availableStyles.map((style: string[]) =>
              <option key={style[0]} value={style[1]}>{style[0]}</option>
            )}
          </select>
          <button onClick={removeRegion}>X</button>
        </div>
        {region.data.map((regionPoint: regionPointT, index: number) => {
          return <WeightRegionRow
            key={regionPoint.id}
            aircraft={aircraft}
            regionIndex={regionIndex}
            setAircraft={setAircraft}
            index={index}
            regionPoint={regionPoint} />
        })}
      </div>
    </Grouping>
  );
}

function AircraftLimits({ aircraft, setAircraft }: aircraftProps): ReactNode {
  function addLimit(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const newLimit: weightLimitT = {
      name: "",
      id: crypto.randomUUID(),
      weight: 0,
      color: '#444444'
    };
    tmp.limits.limits.push(newLimit);
    setAircraft(tmp);
  }

  function addRegion(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const newLimit: regionT = {
      name: "",
      id: crypto.randomUUID(),
      color: '#000000',
      data: [
        { id: crypto.randomUUID(), weight: 1000, arm: 10 },
        { id: crypto.randomUUID(), weight: 2000, arm: 10 },
        { id: crypto.randomUUID(), weight: 2000, arm: 20 },
        { id: crypto.randomUUID(), weight: 1000, arm: 20 }
      ]
    };
    tmp.limits.regions.push(newLimit);
    setAircraft(tmp);
  }

  return (
    <div>
      <section id="limits">
        {aircraft.limits.limits.map((limit: weightLimitT) => {
          return <WeightLimit key={limit.id} limit={limit} aircraft={aircraft} setAircraft={setAircraft} />
        })}
        <button onClick={() => addLimit()}>Add Limit</button>
      </section>
      <section id="regions">
        {aircraft.limits.regions.map((region: regionT) => (
          <WeightRegion key={region.id} region={region} aircraft={aircraft} setAircraft={setAircraft} />
        ))}
        <button onClick={addRegion}>Add Region</button>
      </section>
    </div>
  );
}

function Geometry({ aircraft, setAircraft }: aircraftProps & nameProps): ReactNode {
  return (
    <Subregion>
      <AircraftLimits aircraft={aircraft} setAircraft={setAircraft} />
    </Subregion>
  );
}

export default Geometry;
