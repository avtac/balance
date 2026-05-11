import { useEffect, useRef, useState } from 'react';
import './Config.css'
import { MultiPane, Subregion } from "./Layout";
import type { aircraftConfigT, cargoAreaT, equipmentT, seatT } from "./Types";

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

function EquipmentSelection({equipment, configIndex, config, setConfig}) {
  const checkRef = useRef(null);
  const oldCount = useRef(1);
  const [count, setCount] = useState(1);
  let equipmentIndex = -1;
  if (configIndex >= 0) equipmentIndex = config.aircraftConfigs[configIndex].equipment.findIndex((s: {id: string, count: number}) => s.id == equipment.id);
  const checked = useRef(equipmentIndex >= 0);

  function selectCheckbox() {
    if (configIndex < 0) return;
    checkRef.current.checked = !checkRef.current.checked;
    const tmp = JSON.parse(JSON.stringify(config));
    if (checkRef.current.checked) {
      if (!tmp.aircraftConfigs[configIndex].equipment.find((s: {id: string, count: number}) => s.id == equipment.id)) {
        tmp.aircraftConfigs[configIndex].equipment.push({id: equipment.id, count: Math.max(count, oldCount.current)});
        setCount(Math.max(count, oldCount.current));
      }
    } else {
      tmp.aircraftConfigs[configIndex].equipment.splice(equipmentIndex, 1);
      oldCount.current = count;
      setCount(0);
    }
    checked.current = !checked.current;
    setConfig(tmp);
  }

  function setConfigCount(value) {
    if (!checked) return;
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.aircraftConfigs[configIndex].equipment[equipmentIndex].count = value;
    if (value === 0) {
      selectCheckbox();
      return;
    }
    setCount(value);
    setConfig(tmp);
  }

  checked.current = equipmentIndex >= 0;
  useEffect(() => {
    setCount(equipmentIndex >= 0 ? config.aircraftConfigs[configIndex].equipment[equipmentIndex].count : 0);
    oldCount.current = 1;
  }, [configIndex])
  return (
    <tr className="equipmentSelect">
      <td onClick={selectCheckbox}>
        <input ref={checkRef} onClick={selectCheckbox} checked={checked.current} type={"checkbox"} onChange={selectCheckbox} />
      </td>
      <td onClick={selectCheckbox}>{equipment.name}</td>
      <td onClick={selectCheckbox}>{equipment.arm}</td>
      <td onClick={selectCheckbox}>{equipment.weight}</td>
      <td>
        <input disabled={!checked.current} min={0} value={count} type={"number"} onChange={(e) => setConfigCount(Number(e.target.value))}/>
      </td>
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
    <MultiPane>
      <Subregion name={"Seats"}>
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
      <Subregion name={"Cargo Areas"}>
        <table id="configCargo">
          <tbody>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Arm</th>
            <th>Max Weight</th>
          </tr>
          {config.cargoAreas.map((cargo: cargoAreaT) => {
            return <CargoSelection key={cargo.id + " cargoSelect"} configIndex={configIndex} cargoArea={cargo} config={config} setConfig={setConfig}/>
          })}
          </tbody>
        </table>
      </Subregion>
      <Subregion name={"Equipment"}>
        <table id="configEquipment">
          <tbody>
          <tr>
            <th>Select</th>
            <th>Name</th>
            <th>Arm</th>
            <th>Weight</th>
            <th>Count</th>
          </tr>
          {config.equipment.map((equipment: equipmentT) => {
            return <EquipmentSelection key={equipment.id + " cargoSelect"} configIndex={configIndex} equipment={equipment} config={config} setConfig={setConfig}/>
          })}
          </tbody>
        </table>
        <div id="configEquipment">
        </div>
      </Subregion>
      </MultiPane>
    </>
  );
}

export default AircraftConfigs;
