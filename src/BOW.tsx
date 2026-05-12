import './BOW.css'
import { useEffect, useRef } from "react";
import { Subregion, MultiPane } from "./Layout";
import type { aircraftConfigT, cargoAreaT, operationConfigT, seatT } from "./Types";
import { getSortedByArm } from './utility';

function SeatSelection({seat, opsConfigIndex, config, setConfig}) {
  if (opsConfigIndex < 0) return;

  let seatIndex = config.operationConfigs[opsConfigIndex].seats.findIndex((s: {id: string, weight: number}) => s.id == seat.id);
  const checked = useRef(seatIndex >= 0);

  function selectCheckbox() {
    if (opsConfigIndex < 0) return;
    checked.current = !checked.current;
    const tmp = JSON.parse(JSON.stringify(config));
    if (checked.current) {
      if (config.operationConfigs[opsConfigIndex].seats.findIndex((s: {id: string, weight: number}) => s.id === seat.id) < 0) {
        tmp.operationConfigs[opsConfigIndex].seats.push({id: seat.id, weight: oldWeight.current});
      }
    } else {
      tmp.operationConfigs[opsConfigIndex].seats.splice(seatIndex, 1);
    }
    setConfig(tmp);
  }

  function setWeight(weight: number) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.operationConfigs[opsConfigIndex].seats[seatIndex].weight = weight;
    oldWeight.current = weight;
    setConfig(tmp);
  }

  let weight = 0;
  let oldWeight = useRef(seat.maxWeight);
  if (seatIndex >= 0) {
    weight = config.operationConfigs[opsConfigIndex].seats[seatIndex].weight;
    oldWeight.current = weight;
  }
  checked.current = seatIndex >= 0;

  // TODO: DO SOMETHING ON AIRCRAFT CONFIG ID CHANGE

  useEffect(() => {
    let newWeight = seat.maxWeight * seat.seatCount;
    if (seatIndex >= 0) newWeight = config.operationConfigs[opsConfigIndex].seats[seatIndex].weight;
    oldWeight.current = newWeight;
  }, [opsConfigIndex]);

  return (
    <tr className="seatSelect">
      <td onClick={selectCheckbox}>
        <input onChange={() => {}} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{seat.name}</td>
      <td>
        <input disabled={!checked.current} value={weight} min={0} max={seat.maxWeight * seat.seatCount} type="number" onChange={e => setWeight(Number(e.target.value))} />
      </td>
    </tr>
  );
}

function CargoSelection({cargoArea, opsConfigIndex, config, setConfig}) {
  if (opsConfigIndex < 0) return;

  let cargoAreaIndex = config.operationConfigs[opsConfigIndex].cargoAreas.findIndex((s: {id: string, weight: number}) => s.id == cargoArea.id);
  const checked = useRef(cargoAreaIndex >= 0);

  function selectCheckbox() {
    if (opsConfigIndex < 0) return;
    checked.current = !checked.current;
    const tmp = JSON.parse(JSON.stringify(config));
    if (checked.current) {
      if (config.operationConfigs[opsConfigIndex].cargoAreas.findIndex((s: {id: string, weight: number}) => s.id === cargoArea.id) < 0) {
        tmp.operationConfigs[opsConfigIndex].cargoAreas.push({id: cargoArea.id, weight: oldWeight.current});
      }
    } else {
      tmp.operationConfigs[opsConfigIndex].cargoAreas.splice(cargoAreaIndex, 1);
    }
    setConfig(tmp);
  }

  function setWeight(weight: number) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight = weight;
    oldWeight.current = weight;
    setConfig(tmp);
  }

  let weight = 0;
  const oldWeight = useRef(cargoArea.maxWeight);
  if (cargoAreaIndex >= 0) {
    weight = config.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
    oldWeight.current = config.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
  }

  useEffect(() => {
    let newWeight = cargoArea.maxWeight;
    if (cargoAreaIndex >= 0) newWeight =  config.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
    oldWeight.current = newWeight;
  }, [opsConfigIndex]);


  checked.current = cargoAreaIndex >= 0;
  return (
    <tr className="cargoAreaSelect">
      <td onClick={selectCheckbox}>
        <input onChange={() => {}} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{cargoArea.name}</td>
      <td>
        <input disabled={!checked.current} value={weight} min={0} max={cargoArea.maxWeight} type="number" onChange={e => setWeight(Number(e.target.value))} />
      </td>
    </tr>
  );
}

function AircraftOperationConfig({config, setConfig, selectedConfig, setSelectedConfig, selectedOpsConfig, setSelectedOpsConfig}) {
  const configSelectRef = useRef(undefined);
  const configIndex = config.aircraftConfigs.findIndex((c: aircraftConfigT) => c.id === selectedConfig);
  const opsConfigIndex = config.operationConfigs.findIndex((c: operationConfigT) => c.id === selectedOpsConfig);

  function addOpsConfig() {
    const tmp = JSON.parse(JSON.stringify(config));
    const newConfig: operationConfigT = {
      id: crypto.randomUUID(),
      name: "New Ops Config",
      config: selectedConfig,
      seats: [],
      cargoAreas: [],
    };
    tmp.operationConfigs.push(newConfig);
    setConfig(tmp);
    setSelectedOpsConfig(newConfig.id);
  }

  function duplicateOpsConfig() {
    const tmp = JSON.parse(JSON.stringify(config));
    if (opsConfigIndex < 0) return;
    const newConfig: operationConfigT = JSON.parse(JSON.stringify(tmp.operationConfigs[opsConfigIndex]));
    newConfig.id = crypto.randomUUID();
    newConfig.name = newConfig.name + " - Copy";
    tmp.operationConfigs.push(newConfig);
    setSelectedOpsConfig(newConfig.id);
    setConfig(tmp);
  }

  function deleteOpsConfig() {
    const tmp = JSON.parse(JSON.stringify(config));
    if (opsConfigIndex < 0) return;
    tmp.operationConfigs.splice(opsConfigIndex, 1);
    if (tmp.operationConfigs.length > 0)
      setSelectedOpsConfig(tmp.operationConfigs[0].id);
    else 
      setSelectedOpsConfig(0);
    setConfig(tmp);
  }

  function setName(name: string) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.operationConfigs[opsConfigIndex].name = name;
    setConfig(tmp);
  }

  function setAircraftConfig(configId: string) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.operationConfigs[opsConfigIndex].config = configId;
    tmp.operationConfigs[opsConfigIndex].seats = [];
    tmp.operationConfigs[opsConfigIndex].cargoAreas = [];
    setSelectedConfig(configId)
    setConfig(tmp);
  }

  let seats: seatT[] = []
  let cargoAreas: cargoAreaT[] = []
  if (configIndex >= 0) {
    seats = config.aircraftConfigs[configIndex].seats.map((s: string) => {
      return config.seats.find((S: seatT) => S.id === s);
    });

    cargoAreas = config.aircraftConfigs[configIndex].cargoAreas.map((s: string) => {
      return config.cargoAreas.find((S: seatT) => S.id === s);
    });
  }

  return (
    <>
      <Subregion>
        <div id="opsConfigTitle">
          <select
            onChange={(e) => setSelectedOpsConfig(e.target.value)}
            value={selectedOpsConfig}
          >
            {config.operationConfigs.map((conf) => {
              return <option key={conf.id + "selectOption"} value={conf.id}>{conf.name}</option>
            })}
          </select>
          <input
            value={opsConfigIndex >= 0 ? config.operationConfigs[opsConfigIndex].name : ""}
            onChange={(e) => setName(e.target.value)}/>
          <select
            ref={configSelectRef}
            disabled={config.aircraftConfigs.length == 0}
            onChange={(e) => setAircraftConfig(e.target.value)}
            value={selectedConfig}
          >
            {config.aircraftConfigs.map((conf) => {
              return <option key={conf.id + "selectOption"} value={conf.id}>{conf.name}</option>
            })}
          </select>
          <button
            disabled={config.aircraftConfigs.length == 0}
            onClick={addOpsConfig}
          >Add</button>
          <button
            disabled={config.aircraftConfigs.length == 0}
            onClick={duplicateOpsConfig}
          >Duplicate</button>
          <button
            onClick={deleteOpsConfig}
            disabled={config.aircraftConfigs.length == 0}
          >Delete</button>
        </div>
      </Subregion>
      <MultiPane>
        <Subregion name={"Seats"}>
          <table id="configSeats">
            <tbody>
            <tr>
              <th>✔</th>
              <th style={{width: "10rem"}}>Name</th>
              <th style={{width: "3rem"}}>Weight</th>
            </tr>
            {getSortedByArm(seats).map((seat: seatT) => {
              return <SeatSelection key={seat.id + " seatSelect"} opsConfigIndex={opsConfigIndex} seat={seat} config={config} setConfig={setConfig}/>
            })}
            </tbody>
          </table>
        </Subregion>
        <Subregion name={"Cargo Areas"}>
          <table id="configCargo">
            <tbody>
            <tr>
              <th>✔</th>
              <th style={{width: "10rem"}}>Name</th>
              <th style={{width: "3rem"}}>Weight</th>
            </tr>
            {getSortedByArm(cargoAreas).map((cargoArea: cargoAreaT) => {
              return <CargoSelection key={cargoArea.id + " cargoSelect"} opsConfigIndex={opsConfigIndex} cargoArea={cargoArea} config={config} setConfig={setConfig}/>
            })}
            </tbody>
          </table>
        </Subregion>
      </MultiPane>
    </>
  );
}

export default AircraftOperationConfig;
