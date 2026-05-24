import './Config.css'
import '../../Layout.css'
import { useContext, useEffect, useRef, useState, type ReactElement } from 'react';
import { MultiPane, Subregion } from "../../Layout";
import { type aircraftConfigT, type cargoAreaT, type aircraftT, type equipmentT, type seatT, type fuelTankT, type nameProps, baseLengthUnit, baseWeightUnit, type operationConfigT, baseFuelUnit, type aircraftProps } from "../../Types";
import { getSortedByArm, roundNumber } from '../../utility';
import { convertFuelUnits, convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from '../../UnitsContext';

interface seatSelectionProps extends aircraftProps {
  seat: seatT,
  opsConfigIndex: number
  airConfigIndex: number
}

function SeatSelection({ aircraft, setAircraft, seat, opsConfigIndex, airConfigIndex }: seatSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  let seatIndex: number = -1;
  if (opsConfigIndex >= 0) seatIndex = aircraft.operationConfigs[opsConfigIndex].seats.findIndex((s) => s.id === seat.id);

  let checked = useRef(seatIndex >= 0);
  const oldWeight = useRef(convertWeightUnit(seat.maxWeight * seat.seatCount, baseWeightUnit, units.weightUnits));

  const inConfig = aircraft.aircraftConfigs[airConfigIndex].seats.findIndex((s) => s === seat.id) >= 0;

  function selectCheckbox(): void {
    if (opsConfigIndex < 0 || !inConfig) return;
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

  function addToConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.aircraftConfigs[airConfigIndex].seats.push(seat.id);
    setAircraft(tmp);
  }

  function removeFromConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const index = tmp.aircraftConfigs[airConfigIndex].seats.findIndex(a => a === seat.id);
    if (index < 0) return;
    tmp.aircraftConfigs[airConfigIndex].seats.splice(index, 1);
    const opsIndex = tmp.operationConfigs[opsConfigIndex].seats.findIndex(a => a.id === seat.id);
    if (opsIndex >= 0) {
      tmp.operationConfigs[opsConfigIndex].seats.splice(opsIndex, 1);
    }
    setAircraft(tmp);
  }

  function setWeight(weight: number): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const newWeight = Math.min(seat.maxWeight * seat.seatCount, convertWeightUnit(weight, units.weightUnits, baseWeightUnit));
    tmp.operationConfigs[opsConfigIndex].seats[seatIndex].weight = newWeight;
    oldWeight.current = newWeight;
    setAircraft(tmp);
  }

  let loadedWeight = 0;
  if (seatIndex >= 0) {
    loadedWeight = roundNumber(convertWeightUnit(aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight, baseWeightUnit, units.weightUnits), unitPrecision);
    oldWeight.current = aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight;
  }
  checked.current = seatIndex >= 0;
  return (
    <tr className={"seatSelect" + (!inConfig ? " unused" : "")}>
      <td onClick={selectCheckbox}>
        <input disabled={!inConfig} onChange={() => { }} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{seat.name}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertLengthUnit(seat.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertWeightUnit(seat.maxWeight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td onClick={selectCheckbox}>{seat.seatCount}</td>
      <td>
        <input
          disabled={!inConfig || seatIndex < 0}
          type='number'
          value={roundNumber(convertWeightUnit(loadedWeight, baseWeightUnit, units.weightUnits), unitPrecision)}
          onChange={(e) => { setWeight(Number(e.target.value)) }} />
      </td>
      <td>
        {inConfig ? <button onClick={removeFromConfig} >Remove From Config</button> : <button onClick={addToConfig} >Add To Config</button>}
      </td>
    </tr >
  );
}

interface cargoSelectionProps extends aircraftProps {
  cargoArea: cargoAreaT,
  opsConfigIndex: number
  airConfigIndex: number
}

function CargoSelection({ aircraft, setAircraft, cargoArea, opsConfigIndex, airConfigIndex }: cargoSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  let cargoAreaIndex: number = -1;
  if (opsConfigIndex >= 0) cargoAreaIndex = aircraft.operationConfigs[opsConfigIndex].cargoAreas.findIndex((s) => s.id === cargoArea.id);

  let checked = useRef(cargoAreaIndex >= 0);
  const oldWeight = useRef(convertWeightUnit(cargoArea.maxWeight, baseWeightUnit, units.weightUnits));

  const inConfig = aircraft.aircraftConfigs[airConfigIndex].cargoAreas.findIndex((s) => s === cargoArea.id) >= 0;

  function selectCheckbox(): void {
    if (opsConfigIndex < 0 || !inConfig) return;
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

  function addToConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.aircraftConfigs[airConfigIndex].cargoAreas.push(cargoArea.id);
    setAircraft(tmp);
  }

  function removeFromConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const index = tmp.aircraftConfigs[airConfigIndex].cargoAreas.findIndex(a => a === cargoArea.id);
    if (index < 0) return;
    tmp.aircraftConfigs[airConfigIndex].cargoAreas.splice(index, 1);
    const opsIndex = tmp.operationConfigs[opsConfigIndex].cargoAreas.findIndex(a => a.id === cargoArea.id);
    if (opsIndex >= 0) {
      tmp.operationConfigs[opsConfigIndex].cargoAreas.splice(opsIndex, 1);
    }
    setAircraft(tmp);
  }

  let loadedWeight = 0;
  if (cargoAreaIndex >= 0) {
    loadedWeight = roundNumber(convertWeightUnit(aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight, baseWeightUnit, units.weightUnits), unitPrecision);
    oldWeight.current = aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
  }
  checked.current = cargoAreaIndex >= 0;
  return (
    <tr className={"cargoAreaSelect" + (!inConfig ? " unused" : "")}>
      <td onClick={selectCheckbox}>
        <input disabled={!inConfig} onChange={() => { }} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{cargoArea.name}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertLengthUnit(cargoArea.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertWeightUnit(cargoArea.maxWeight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>
        <input disabled={!inConfig} onChange={() => { }} value={roundNumber(convertWeightUnit(loadedWeight, baseWeightUnit, units.weightUnits), unitPrecision)} />
      </td>
      <td>
        {inConfig ? <button onClick={removeFromConfig} >Remove From Config</button> : <button onClick={addToConfig} >Add To Config</button>}
      </td>
    </tr>
  );
}

interface fuelSelectionProps {
  fuelTank: fuelTankT,
  airConfig: aircraftConfigT,
  opsConfig: operationConfigT,
}

function FuelSelection({ fuelTank, airConfig, opsConfig }: fuelSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  let fuelTankIndex = -1;
  if (opsConfig) fuelTankIndex = airConfig.fuelTanks.findIndex((s: string) => s == fuelTank.id);
  const checked = useRef(fuelTankIndex >= 0 || !fuelTank.removable);

  function selectCheckbox(): void {
    if (!fuelTank.removable) return;
    checked.current = !checked.current;
    // const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    if (checked.current) {
      if (airConfig.fuelTanks.findIndex((s: string) => s === fuelTank.id) < 0)
        airConfig.fuelTanks.push(fuelTank.id);
    } else {
      airConfig.fuelTanks.splice(fuelTankIndex, 1);
    }
    checked.current = !checked.current;
  }

  checked.current = fuelTankIndex >= 0;
  return (
    <tr className="fuelTankSelect" onClick={selectCheckbox}>
      <td>
        <input
          disabled={!fuelTank.removable}
          onChange={() => { }}
          checked={!fuelTank.removable || checked.current}
          type={"checkbox"} />
      </td>
      <td>{fuelTank.name}</td>
      <td>{roundNumber(convertLengthUnit(fuelTank.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td>{roundNumber(convertFuelUnits(fuelTank.maxWeight, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision)}</td>
      <td>{roundNumber(convertFuelUnits(fuelTank.unusable, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision)}</td>
    </tr>
  );
}

interface EquipmentSelectionProps {
  equipment: equipmentT,
  airConfig: aircraftConfigT,
  opsConfig: operationConfigT,
}

function EquipmentSelection({ equipment, airConfig, opsConfig }: EquipmentSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  const oldCount = useRef(1);
  const [count, setCount] = useState(1);
  let equipmentIndex = -1;
  if (airConfig) equipmentIndex = airConfig.equipment.findIndex((s: { id: string, count: number }) => s.id == equipment.id);
  const checked = useRef(equipmentIndex >= 0);

  function selectCheckbox(): void {
    if (airConfig) return;
    checked.current = !checked.current;
    // const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    // if (checked.current) {
    //   if (tmp.aircraftConfigs[configIndex].equipment.findIndex((s: { id: string, count: number }) => s.id === equipment.id) < 0) {
    //     tmp.aircraftConfigs[configIndex].equipment.push({ id: equipment.id, count: Math.max(count, oldCount.current) });
    //     setCount(Math.max(count, oldCount.current));
    //   }
    // } else {
    //   tmp.aircraftConfigs[configIndex].equipment.splice(equipmentIndex, 1);
    //   oldCount.current = count;
    //   setCount(0);
    // }
    // setAircraft(tmp);
  }

  function setAircraftCount(value: number): void {
    if (!checked.current) return;
    // const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    airConfig.equipment[equipmentIndex].count = value;
    if (value === 0) {
      selectCheckbox();
      return;
    }
    setCount(value);
    // setAircraft(tmp);
  }

  checked.current = equipmentIndex >= 0;
  useEffect(() => {
    setCount(equipmentIndex >= 0 ? airConfig.equipment[equipmentIndex].count : 0);
    oldCount.current = 1;
  }, [airConfig])
  return (
    <tr className={"equipmentSelect"}>
      <td onClick={selectCheckbox}>
        <input onChange={() => { }} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{equipment.name}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertLengthUnit(equipment.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertWeightUnit(equipment.weight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>
        <input
          id={`equipmentCount-${equipment.id}`}
          disabled={!checked.current}
          min={0}
          value={count}
          type={"number"}
          onChange={(e) => setAircraftCount(Number(e.target.value))} />
      </td>
      <td onClick={selectCheckbox}>{roundNumber(convertWeightUnit(equipment.weight * count, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
    </tr>
  );
}

interface AircraftConfigsProps extends aircraftProps {
  selectedOpsConfig: string,
}

function Config({ aircraft, setAircraft, selectedOpsConfig }: AircraftConfigsProps & nameProps): ReactElement {
  if (!aircraft) return (<></>);
  const units = useContext(UnitContext);
  const opsConfigIndex = aircraft.operationConfigs.findIndex(c => c.id === selectedOpsConfig);
  if (opsConfigIndex < 0) return (<></>);
  const configIndex = aircraft.aircraftConfigs.findIndex(c => c.id === aircraft.operationConfigs[opsConfigIndex].config);

  return (
    <>
      <Subregion id="aircraftTitle">
        <h3>{aircraft.operationConfigs[opsConfigIndex].name}</h3>
      </Subregion>
      <MultiPane>
        <Subregion name={"Seats"}>
          <table className="tableData">
            <tbody>
              <tr>
                <th>✔</th>
                <th style={{ width: "10rem" }}>Name</th>
                <th style={{ width: "3rem" }}>{`Arm (${units.lengthUnits})`}</th>
                <th style={{ width: "3rem" }}>{`Max Weight (${units.weightUnits})`}</th>
                <th style={{ width: "3rem" }}># of Seats</th>
                <th style={{ width: "3rem" }}>Ops Load</th>
              </tr>
              {getSortedByArm(aircraft.seats).map((seat: seatT) => {
                return <SeatSelection
                  key={seat.id + " seatSelect"}
                  aircraft={aircraft}
                  setAircraft={setAircraft}
                  airConfigIndex={configIndex}
                  opsConfigIndex={opsConfigIndex}
                  seat={seat} />
              })}
            </tbody>
          </table>
        </Subregion>
        <Subregion name={"Cargo Areas"}>
          <table className="tableData">
            <tbody>
              <tr>
                <th>✔</th>
                <th style={{ width: "10rem" }}>Name</th>
                <th style={{ width: "3rem" }}>{`Arm (${units.lengthUnits})`}</th>
                <th style={{ width: "3rem" }}>{`Max Weight (${units.weightUnits})`}</th>
                <th style={{ width: "3rem" }}>Ops Load</th>
              </tr>
              {getSortedByArm(aircraft.cargoAreas).map((cargo: cargoAreaT) => {
                return <CargoSelection
                  key={cargo.id + " cargoSelect"}
                  cargoArea={cargo}
                  aircraft={aircraft}
                  setAircraft={setAircraft}
                  opsConfigIndex={opsConfigIndex}
                  airConfigIndex={configIndex} />
              })}
            </tbody>
          </table>
        </Subregion>
        <Subregion name={"Fuel Tanks"}>
          <table className="tableData">
            <tbody>
              <tr>
                <th>✔</th>
                <th style={{ width: "10rem" }}>Name</th>
                <th style={{ width: "3rem" }}>{`Arm (${units.lengthUnits})`}</th>
                <th style={{ width: "3rem" }}>{`Max Fuel (${units.fuelUnits})`}</th>
                <th style={{ width: "3rem" }}>{`Unusable Fuel (${units.fuelUnits})`}</th>
              </tr>
              {getSortedByArm(aircraft.fuelTanks).map((fuel: fuelTankT) => {
                return <FuelSelection
                  key={fuel.id + " fuelSelect"}
                  fuelTank={fuel}
                  opsConfig={aircraft.operationConfigs[opsConfigIndex]}
                  airConfig={aircraft.aircraftConfigs[configIndex]} />
              })}
            </tbody>
          </table>
        </Subregion>
        <Subregion name={"Equipment"}>
          <table className="tableData">
            <tbody>
              <tr>
                <th>✔</th>
                <th style={{ width: "10rem" }}>Name</th>
                <th style={{ width: "3rem" }}>{`Arm (${units.lengthUnits})`}</th>
                <th style={{ width: "3rem" }}>{`Weight (${units.weightUnits})`}</th>
                <th style={{ width: "3rem" }}>Count</th>
                <th style={{ width: "3rem" }}>{`Total Weight (${units.weightUnits})`}</th>
              </tr>
              {getSortedByArm(aircraft.equipment).map((equipment: equipmentT) => {
                return <EquipmentSelection
                  key={equipment.id + " equipSelect"}
                  equipment={equipment}
                  opsConfig={aircraft.operationConfigs[opsConfigIndex]}
                  airConfig={aircraft.aircraftConfigs[configIndex]} />
              })}
            </tbody>
          </table>
        </Subregion>
      </MultiPane>
    </>
  );
}


export default Config;
