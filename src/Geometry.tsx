import type { ReactNode } from "react";
import "./Geometry.css"
import { HorizontalRegion, Subregion, Grouping } from "./Layout";
import type { regionT, regionPointT, weightLimitT, configT, configProps, aircraftPropertiesT } from "./Types";

const availableStyles = [['solid', ''], ['dashed', '1 1'], ['dotted', '.3 1'], ['dot dash', '3 2 .4 2']]

function AircraftConfig({config, setConfig}: configProps): ReactNode {
  function setValue<K extends keyof aircraftPropertiesT, V extends aircraftPropertiesT[K]>(key: K, value: V) {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.config[key] = value;
    setConfig(tmp);
  }

  return (
    <section id="geometry">
      <div>
        <h3>Tail Number</h3>
        <input defaultValue={config.config.tailNumber} placeholder="Tail Number" onChange={(e) => setValue('tailNumber', e.target.value)}/>
      </div>
      <div>
        <h3>Aircraft Type</h3>
        <input defaultValue={config.config.type} placeholder="Type" onChange={(e) => setValue('type', e.target.value)}/>
      </div>
      <div>
        <h3>Empty Weight</h3>
        <input defaultValue={config.config.emptyWeight} type="number" placeholder="Empty Weight" onChange={(e) => setValue('emptyWeight', Number(e.target.value))}/>
      </div>
      <div>
        <h3>Empty Arm</h3>
        <input defaultValue={config.config.emptyArm} type="number" placeholder="Empty Arm" onChange={(e) => setValue('emptyArm', Number(e.target.value))}/>
      </div>
    </section>
  );
}

interface weightLimitProps extends configProps {
  limit: weightLimitT
}

function WeightLimit({ limit, config, setConfig }: weightLimitProps): ReactNode {
  const index = config.limits.limits.findIndex((lim: weightLimitT) => lim.id === limit.id);
  if (index < 0) return;

  function setValue<K extends keyof weightLimitT, V extends weightLimitT[K]>(key: K, value: V): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.limits[index][key] = value;
    setConfig(tmp);
  }

  function removeLimit(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.limits.splice(index, 1);
    setConfig(tmp);
  }

  return (
    <div className="weightLimit grouping">
      <input placeholder="Limit Name" defaultValue={limit.name} onChange={e => setValue("name", e.target.value)}/>
      <input placeholder="Weight" type="number" defaultValue={limit.weight ?? 0} onChange={e => setValue("weight", Number(e.target.value))}/>
      <input type="color" value={limit.color} onChange={e => setValue('color', e.target.value)} />
      <select value={limit.lineStyle} onChange={e => setValue('lineStyle', e.target.value)}>
        {availableStyles.map((style: string[]) => <option key={style[0]} value={style[1]}>{style[0]}</option>)}
      </select>
      <button onClick={removeLimit}>X</button>
    </div>
  );
}

interface weightRegionRowProps extends configProps {
  regionPoint: regionPointT,
  regionIndex: number,
  index: number,
}

function WeightRegionRow({ regionPoint, config, setConfig, regionIndex, index }: weightRegionRowProps): ReactNode {

  function setValue<K extends keyof regionPointT, V extends regionPointT[K]>(key: K, value: V): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].data[index][key] = value;
    setConfig(tmp);
  }

  function addPoint(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].data.splice(index, 0, {arm: regionPoint.arm, weight: regionPoint.weight, id: crypto.randomUUID()});
    setConfig(tmp);
  }

  function deletePoint(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].data.splice(index, 1);
    setConfig(tmp);
  }

  return (
    <>
    <div className="weightRegionRow">
      <input
        placeholder="Weight"
        min={0}
        step={10}
        type="number"
        defaultValue={regionPoint.weight}
        onChange={e => setValue('weight', Number(e.target.value))}/>
      <input
        placeholder="Arm"
        type="number"
        defaultValue={regionPoint.arm}
        onChange={e => setValue('arm', Number(e.target.value))}/>
      {config.limits.regions[regionIndex].data.length > 3 &&
        <button onClick={deletePoint}>X</button>}
      {<button className="addButton" onClick={addPoint}></button>}
    </div>
    </>
  );
}

interface weightRegionProps extends configProps {
  region: regionT
}

function WeightRegion({ region, config, setConfig }: weightRegionProps): ReactNode {
  const regionIndex = config.limits.regions.findIndex((reg: regionT) => reg.id === region.id);
  if (regionIndex < 0) {
    console.log("Warning: Did not find region index in config");
    return;
  }

  function setName(name: string): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].name = name;
    setConfig(tmp);
  }

  function removeRegion(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.regions.splice(regionIndex, 1);
    setConfig(tmp);
  }

  function setColor(color: string): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].color = color;
    setConfig(tmp);
  }

  function setStyle(style: string): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.limits.regions[regionIndex].lineStyle = style;
    setConfig(tmp);
  }

  const name = region.name;
  return (
    <Grouping>
    <div className="weightRegion">
      <h4>{name != "" ? name : "Weight Region"}</h4>
      <div className="title">
        <input
          placeholder="Name"
          defaultValue={name}
          onChange={e => setName(e.target.value)}/>
        <input
          type="color"
          value={region.color}
          onChange={e => setColor(e.target.value)} />
        <select
          value={region.lineStyle}
          onChange={e => setStyle(e.target.value)}>
          {availableStyles.map((style: string[]) =>
            <option key={style[0]} value={style[1]}>{style[0]}</option>
          )}
        </select>
        <button onClick={removeRegion}>X</button>
      </div>
      {region.data.map((regionPoint: regionPointT, index: number) => {
        return <WeightRegionRow
                key={regionPoint.id}
                config={config}
                regionIndex={regionIndex}
                setConfig={setConfig}
                index={index}
                regionPoint={regionPoint}/>
      })}
    </div>
    </Grouping>
  );
}

function AircraftLimits({ config, setConfig }: configProps): ReactNode {
  function addLimit(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    const newLimit: weightLimitT = {
      name: "",
      id: crypto.randomUUID(),
      weight: 0,
      color: '#FFFFFF'
    };
    tmp.limits.limits.push(newLimit);
    setConfig(tmp);
  }

  function addRegion(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    const newLimit: regionT = {
      name: "",
      id: crypto.randomUUID(),
      color: '#000000',
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
    <HorizontalRegion fraction="1fr">
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

function Geometry({ config, setConfig } : configProps): ReactNode {
  return (
    <>
      <div style={{flex: 0}}>
      <Subregion>
        <AircraftConfig config={config} setConfig={setConfig}/>
      </Subregion>
      </div>
      <div style={{flex: 1}}>
      <Subregion>
        <AircraftLimits config={config} setConfig={setConfig} />
      </Subregion>
      </div>
    </>
  );
}

export default Geometry;
