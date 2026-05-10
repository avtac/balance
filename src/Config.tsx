import { useRef, useState } from 'react';
import './Config.css'
import { Subregion } from "./Layout";
import type { aircraftConfigT, seatT } from "./Types";

function SeatSelection({seat, configIndex, config, setConfig}) {
  const checkRef = useRef(null);
  let seatIndex = -1;
  if (configIndex >= 0) seatIndex = config.aircraftConfigs[configIndex].seats.findIndex((s: string) => s == seat.id);
  const checked = useRef(seatIndex >= 0);

  function selectCheckbox() {
    if (configIndex < 0) return;
    checkRef.current.checked = !checkRef.current.checked;
    const tmp = JSON.parse(JSON.stringify(config));
    if (checkRef.current.checked) {
      if (!tmp.aircraftConfigs[configIndex].seats.find((s: seatT) => s.id == seat.id))
        tmp.aircraftConfigs[configIndex].seats.push(seat.id);
    } else {
      tmp.aircraftConfigs[configIndex].seats.splice(seatIndex, 1);
    }
    checked.current = !checked.current;
    setConfig(tmp);
  }

  checked.current = seatIndex >= 0;
  return (
    <tr className="seatSelect" onClick={selectCheckbox}>
      <td>
        <input ref={checkRef} checked={checked.current} type={"checkbox"} onChange={selectCheckbox} />
      </td>
      <td>{seat.name}</td>
      <td>{seat.arm}</td>
      <td>{seat.maxWeight}</td>
      <td>{seat.seatCount}</td>
    </tr>
  );
}

function CargoSelection({cargoArea, configIndex, config, setConfig}) {
  const checkRef = useRef(null);
  let cargoAreaIndex = -1;
  if (configIndex >= 0) cargoAreaIndex = config.aircraftConfigs[configIndex].cargoAreas.findIndex((s: string) => s == cargoArea.id);
  const checked = useRef(cargoAreaIndex >= 0);

  function selectCheckbox() {
    if (configIndex < 0) return;
    checkRef.current.checked = !checkRef.current.checked;
    const tmp = JSON.parse(JSON.stringify(config));
    if (checkRef.current.checked) {
      if (!tmp.aircraftConfigs[configIndex].cargoAreas.find((s: cargoAreaT) => s.id == cargoArea.id))
        tmp.aircraftConfigs[configIndex].cargoAreas.push(cargoArea.id);
    } else {
      tmp.aircraftConfigs[configIndex].cargoAreas.splice(cargoAreaIndex, 1);
    }
    checked.current = !checked.current;
    setConfig(tmp);
  }

  checked.current = cargoAreaIndex >= 0;
  return (
    <tr className="cargoAreaSelect" onClick={selectCheckbox}>
      <td>
        <input ref={checkRef} checked={checked.current} type={"checkbox"} onChange={selectCheckbox} />
      </td>
      <td>{cargoArea.name}</td>
      <td>{cargoArea.arm}</td>
      <td>{cargoArea.maxWeight}</td>
    </tr>
  );
}

function AircraftConfigs({config, setConfig}) {
  const [selectedConfig, setSelectedConfig] = useState(config.aircraftConfigs.length > 0 ? config.aircraftConfigs[0].id : 0);
  const configIndex = config.aircraftConfigs.findIndex(c => c.id === selectedConfig);

  function addConfig() {
    const tmp = JSON.parse(JSON.stringify(config));
    const newConfig: aircraftConfigT = {
      id: crypto.randomUUID(),
      name: "Name",
      seats: [],
      cargoAreas: [],
      equipment: [],
      fuelTanks: []
    };
    tmp.aircraftConfigs.push(newConfig);
    setSelectedConfig(newConfig.id);
    setConfig(tmp);
  }

  function duplicateConfig() {
    const tmp = JSON.parse(JSON.stringify(config));
    if (configIndex < 0) return;
    const newConfig: aircraftConfigT = JSON.parse(JSON.stringify(tmp.aircraftConfigs[configIndex]));
    newConfig.id = crypto.randomUUID();
    newConfig.name = newConfig.name + " - Copy";
    tmp.aircraftConfigs.push(newConfig);
    setSelectedConfig(newConfig.id);
    setConfig(tmp);
  }

  function deleteConfig() {
    const tmp = JSON.parse(JSON.stringify(config));
    if (configIndex < 0) return;
    tmp.aircraftConfigs.splice(configIndex, 1);
    if (tmp.aircraftConfigs.length > 0)
      setSelectedConfig(tmp.aircraftConfigs[0].id);
    else 
      setSelectedConfig(0);
    setConfig(tmp);
  }

  function setName(name) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.aircraftConfigs[configIndex].name = name;
    setConfig(tmp);
  }

  return (
    <>
    <Subregion>
      <select onChange={(e) => setSelectedConfig(e.target.value)} value={selectedConfig}>
        {config.aircraftConfigs.map((conf) => {
          return <option key={conf.id + "selectOption"} value={conf.id}>{conf.name}</option>
        })}
      </select>
      <input value={configIndex >= 0 ? config.aircraftConfigs[configIndex].name : ""} onChange={(e) => setName(e.target.value)}/>
      <button onClick={addConfig}>Add Config</button>
      <button onClick={duplicateConfig}>Duplicate Config</button>
      <button onClick={deleteConfig}>Delete Config</button>
    </Subregion>
    <Subregion>
      <table id="configSeats">
        <tbody>
        <tr>
          <th>Select</th>
          <th>Name</th>
          <th>Arm</th>
          <th>Max Weight</th>
          <th># of Seats</th>
        </tr>
        {config.seats.map((seat: seatT) => {
          return <SeatSelection key={seat.id + " seatSelect"} configIndex={configIndex} seat={seat} config={config} setConfig={setConfig}/>
        })}
        </tbody>
      </table>
    </Subregion>
    <Subregion>
      <table id="configCargo">
        <tbody>
        <tr>
          <th>Select</th>
          <th>Name</th>
          <th>Arm</th>
          <th>Max Weight</th>
        </tr>
        {config.cargoAreas.map((seat: seatT) => {
          return <SeatSelection key={seat.id + " seatSelect"} configIndex={configIndex} seat={seat} config={config} setConfig={setConfig}/>
        })}
        </tbody>
      </table>
      <div id="configEquipment">
      </div>
    </Subregion>
    </>
  );
}

export default AircraftConfigs;
