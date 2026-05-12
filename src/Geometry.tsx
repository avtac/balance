import "./Geometry.css"
import { HorizontalRegion, Subregion, Grouping } from "./Layout";
import type { regionT, regionPointT, weightLimitT } from "./Types";

const availableStyles = [['solid', ''], ['dashed', '1 1'], ['dotted', '.3 1'], ['dot dash', '3 2 .4 2']]

function AircraftConfig({config, setConfig}) {
  function setValue(key:string, value: (string | number)) {
    const tmp = JSON.parse(JSON.stringify(config));
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
      <select value={limit.lineStyle} onChange={e => setValue('lineStyle', e.target.value)}>
        {availableStyles.map((style: string[]) => <option key={style[0]} value={style[1]}>{style[0]}</option>)}
      </select>
      <button onClick={removeLimit}>X</button>
    </div>
  );
}

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

  return (
    <>
    <div className="weightRegionRow">
      <input
        placeholder="Weight"
        min={0}
        step={10}
        type="number"
        defaultValue={data.weight}
        onChange={e => setWeight(Number(e.target.value))}/>
      <input
        placeholder="Arm"
        type="number"
        defaultValue={data.arm}
        onChange={e => setArm(Number(e.target.value))}/>
      {config.limits.regions[regionIndex].data.length > 3 &&
        <button onClick={deletePoint}>X</button>}
      {<button className="addButton" onClick={addPoint}></button>}
    </div>
    </>
  );
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
      {region.data.map((data: regionPointT, index: number) => {
        return <WeightRegionRow
                key={data.id}
                config={config}
                regionIndex={regionIndex}
                setConfig={setConfig}
                index={index}
                data={data}
                isLast={index === region.data.length - 1}/>
      })}
    </div>
    </Grouping>
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
