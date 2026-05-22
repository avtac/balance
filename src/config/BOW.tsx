import './BOW.css'
import { useEffect, useRef, type ReactNode } from "react";
import { Subregion, MultiPane } from "../Layout";
import type { aircraftConfigT, cargoAreaT, aircraftProps, aircraftT, operationConfigT, seatT, nameProps } from "../Types";
import { getSortedByArm } from '../utility';

interface seatSelectionProps extends aircraftProps {
  seat: seatT,
  opsConfigIndex: number
}

function SeatSelection({ seat, opsConfigIndex, aircraft, setAircraft }: seatSelectionProps) {
  if (opsConfigIndex < 0) return;

  const seatIndex = aircraft.operationConfigs[opsConfigIndex].seats.findIndex((s: { id: string, weight: number }) => s.id == seat.id);
  const checked = useRef(seatIndex >= 0);

  function selectCheckbox(): void {
    if (opsConfigIndex < 0) return;
    checked.current = !checked.current;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    if (checked.current) {
      if (aircraft.operationConfigs[opsConfigIndex].seats.findIndex((s: { id: string, weight: number }) => s.id === seat.id) < 0) {
        tmp.operationConfigs[opsConfigIndex].seats.push({ id: seat.id, weight: oldWeight.current });
      }
    } else {
      tmp.operationConfigs[opsConfigIndex].seats.splice(seatIndex, 1);
    }
    setAircraft(tmp);
  }

  function setWeight(weight: number): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.operationConfigs[opsConfigIndex].seats[seatIndex].weight = Math.min(seat.maxWeight * seat.seatCount, weight);
    oldWeight.current = Math.min(seat.maxWeight * seat.seatCount, weight);
    setAircraft(tmp);
  }

  let weight = 0;
  const oldWeight = useRef(seat.maxWeight);
  if (seatIndex >= 0) {
    weight = aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight;
    oldWeight.current = weight;
  }
  checked.current = seatIndex >= 0;

  // TODO: DO SOMETHING ON AIRCRAFT CONFIG ID CHANGE

  useEffect(() => {
    let newWeight = seat.maxWeight * seat.seatCount;
    if (seatIndex >= 0) newWeight = aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight;
    oldWeight.current = newWeight;
  }, [opsConfigIndex]);

  return (
    <tr className="seatSelect">
      <td onClick={selectCheckbox}>
        <input onChange={() => { }} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{seat.name}</td>
      <td>
        <input disabled={!checked.current} value={weight} min={0} max={seat.maxWeight * seat.seatCount} type="number" onChange={e => setWeight(Number(e.target.value))} />
      </td>
    </tr>
  );
}

interface cargoSelectionProps extends aircraftProps {
  cargoArea: cargoAreaT,
  opsConfigIndex: number
}

function CargoSelection({ cargoArea, opsConfigIndex, aircraft, setAircraft }: cargoSelectionProps) {
  if (opsConfigIndex < 0) return;

  const cargoAreaIndex = aircraft.operationConfigs[opsConfigIndex].cargoAreas.findIndex((s: { id: string, weight: number }) => s.id == cargoArea.id);
  const checked = useRef(cargoAreaIndex >= 0);

  function selectCheckbox(): void {
    if (opsConfigIndex < 0) return;
    checked.current = !checked.current;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    if (checked.current) {
      if (aircraft.operationConfigs[opsConfigIndex].cargoAreas.findIndex((s: { id: string, weight: number }) => s.id === cargoArea.id) < 0) {
        tmp.operationConfigs[opsConfigIndex].cargoAreas.push({ id: cargoArea.id, weight: oldWeight.current });
      }
    } else {
      tmp.operationConfigs[opsConfigIndex].cargoAreas.splice(cargoAreaIndex, 1);
    }
    setAircraft(tmp);
  }

  function setWeight(weight: number): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight = Math.min(cargoArea.maxWeight, weight);
    oldWeight.current = Math.min(cargoArea.maxWeight, weight);
    setAircraft(tmp);
  }

  let weight = 0;
  const oldWeight = useRef(cargoArea.maxWeight);
  if (cargoAreaIndex >= 0) {
    weight = aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
    oldWeight.current = aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
  }

  useEffect(() => {
    let newWeight = cargoArea.maxWeight;
    if (cargoAreaIndex >= 0) newWeight = aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
    oldWeight.current = newWeight;
  }, [opsConfigIndex]);


  checked.current = cargoAreaIndex >= 0;
  return (
    <tr className="cargoAreaSelect">
      <td onClick={selectCheckbox}>
        <input onChange={() => { }} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{cargoArea.name}</td>
      <td>
        <input disabled={!checked.current} value={weight} min={0} max={cargoArea.maxWeight} type="number" onChange={e => setWeight(Number(e.target.value))} />
      </td>
    </tr>
  );
}

interface aircraftOperationConfigProps extends aircraftProps {
  selectedConfig: string,
  setSelectedConfig: (arg0: string) => void,
  selectedOpsConfig: string,
  setSelectedOpsConfig: (arg0: string) => void
}

function AircraftOperationConfig({ aircraft, setAircraft, selectedConfig, setSelectedConfig, selectedOpsConfig, setSelectedOpsConfig }: aircraftOperationConfigProps & nameProps): ReactNode {
  const configSelectRef = useRef(null);
  const configIndex: number = aircraft.aircraftConfigs.findIndex((c: aircraftConfigT) => c.id === selectedConfig);
  const opsConfigIndex: number = aircraft.operationConfigs.findIndex((c: operationConfigT) => c.id === selectedOpsConfig);

  function addOpsConfig(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const newConfig: operationConfigT = {
      id: crypto.randomUUID(),
      name: "New Ops Config",
      config: selectedConfig,
      seats: [],
      cargoAreas: [],
    };
    tmp.operationConfigs.push(newConfig);
    setAircraft(tmp);
    setSelectedOpsConfig(newConfig.id);
  }

  function duplicateOpsConfig(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    if (opsConfigIndex < 0) return;
    const newConfig: operationConfigT = JSON.parse(JSON.stringify(tmp.operationConfigs[opsConfigIndex]));
    newConfig.id = crypto.randomUUID();
    newConfig.name = newConfig.name + " - Copy";
    tmp.operationConfigs.push(newConfig);
    setSelectedOpsConfig(newConfig.id);
    setAircraft(tmp);
  }

  function deleteOpsConfig(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    if (opsConfigIndex < 0) return;
    tmp.operationConfigs.splice(opsConfigIndex, 1);
    if (tmp.operationConfigs.length > 0)
      setSelectedOpsConfig(tmp.operationConfigs[0].id);
    else
      setSelectedOpsConfig("");
    setAircraft(tmp);
  }

  function setName(name: string): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.operationConfigs[opsConfigIndex].name = name;
    setAircraft(tmp);
  }

  function setAircraftConfig(configId: string): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.operationConfigs[opsConfigIndex].config = configId;
    tmp.operationConfigs[opsConfigIndex].seats = [];
    tmp.operationConfigs[opsConfigIndex].cargoAreas = [];
    setSelectedConfig(configId)
    setAircraft(tmp);
  }

  let seats: seatT[] = []
  let cargoAreas: cargoAreaT[] = []
  if (configIndex >= 0) {
    seats = aircraft.aircraftConfigs[configIndex].seats.map((s: string) => {
      return aircraft.seats.find((S: seatT) => S.id === s);
    }).filter(s => s != undefined);

    cargoAreas = aircraft.aircraftConfigs[configIndex].cargoAreas.map((s: string) => {
      return aircraft.cargoAreas.find((S: cargoAreaT) => S.id === s);
    }).filter(c => c != undefined);
  }

  return (
    <>
      <Subregion>
        <div id="opsConfigTitle">
          <select
            onChange={(e) => setSelectedOpsConfig(e.target.value)}
            value={selectedOpsConfig}
          >
            {aircraft.operationConfigs.map((conf) => {
              return <option key={conf.id + "selectOption"} value={conf.id}>{conf.name}</option>
            })}
          </select>
          <input
            value={opsConfigIndex >= 0 ? aircraft.operationConfigs[opsConfigIndex].name : ""}
            onChange={(e) => setName(e.target.value)} />
          <select
            ref={configSelectRef}
            disabled={aircraft.aircraftConfigs.length == 0}
            onChange={(e) => setAircraftConfig(e.target.value)}
            value={selectedConfig}
          >
            {aircraft.aircraftConfigs.map((conf) => {
              return <option key={conf.id + "selectOption"} value={conf.id}>{conf.name}</option>
            })}
          </select>
          <button
            disabled={aircraft.aircraftConfigs.length == 0}
            onClick={addOpsConfig}
          >Add</button>
          <button
            disabled={aircraft.aircraftConfigs.length == 0}
            onClick={duplicateOpsConfig}
          >Duplicate</button>
          <button
            onClick={deleteOpsConfig}
            disabled={aircraft.aircraftConfigs.length == 0}
          >Delete</button>
        </div>
      </Subregion>
      <MultiPane>
        <Subregion name={"Seats"}>
          <table id="configSeats">
            <tbody>
              <tr>
                <th>✔</th>
                <th style={{ width: "10rem" }}>Name</th>
                <th style={{ width: "3rem" }}>Weight</th>
              </tr>
              {getSortedByArm(seats).map((seat: seatT) => {
                return <SeatSelection
                  key={seat.id + " seatSelect"}
                  opsConfigIndex={opsConfigIndex}
                  seat={seat}
                  aircraft={aircraft}
                  setAircraft={setAircraft} />
              })}
            </tbody>
          </table>
        </Subregion>
        <Subregion name={"Cargo Areas"}>
          <table id="configCargo">
            <tbody>
              <tr>
                <th>✔</th>
                <th style={{ width: "10rem" }}>Name</th>
                <th style={{ width: "3rem" }}>Weight</th>
              </tr>
              {getSortedByArm(cargoAreas).map((cargoArea: cargoAreaT) => {
                return <CargoSelection
                  key={cargoArea.id + " cargoSelect"}
                  opsConfigIndex={opsConfigIndex}
                  cargoArea={cargoArea}
                  aircraft={aircraft}
                  setAircraft={setAircraft} />
              })}
            </tbody>
          </table>
        </Subregion>
      </MultiPane>
    </>
  );
}

export default AircraftOperationConfig;
