import './Config.css'
import '../../Layout.css'
import { useContext, useEffect, useRef, useState, type ReactElement } from 'react';
import { MultiPane, Subregion } from "../../Layout";
import { type cargoAreaT, type aircraftT, type equipmentT, type seatT, type fuelTankT, type nameProps, baseLengthUnit, baseWeightUnit, baseFuelUnit, type aircraftProps } from "../../Types";
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

  let loadedWeight = undefined;
  if (seatIndex >= 0) {
    loadedWeight = roundNumber(convertWeightUnit(aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight, baseWeightUnit, units.weightUnits), unitPrecision);
    oldWeight.current = aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight;
  }
  checked.current = seatIndex >= 0;
  return (
    <tr className={"clickable seatSelect" + (!inConfig ? " unused" : "")}>
      <td onClick={selectCheckbox}>
        <input disabled={!inConfig} onChange={() => { }} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{seat.name}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertLengthUnit(seat.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertWeightUnit(seat.maxWeight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td onClick={selectCheckbox}>{seat.seatCount}</td>
      <td>
        <input
          id={"seatWeightInput" + seat.id}
          disabled={!inConfig || seatIndex < 0}
          type='number'
          placeholder={units.weightUnits}
          value={loadedWeight ? roundNumber(convertWeightUnit(loadedWeight, baseWeightUnit, units.weightUnits), unitPrecision) : ""}
          onChange={(e) => { setWeight(Number(e.target.value)) }} />
      </td>
      <td>
        {inConfig ? <button onClick={removeFromConfig} >Remove From Aircraft</button> : <button onClick={addToConfig} >Add To Aircraft</button>}
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

  let loadedWeight = undefined;
  if (cargoAreaIndex >= 0) {
    loadedWeight = roundNumber(convertWeightUnit(aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight, baseWeightUnit, units.weightUnits), unitPrecision);
    oldWeight.current = aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight;
  }
  checked.current = cargoAreaIndex >= 0;
  return (
    <tr className={"clickable cargoAreaSelect" + (!inConfig ? " unused" : "")}>
      <td onClick={selectCheckbox}>
        <input disabled={!inConfig} onChange={() => { }} checked={checked.current} type={"checkbox"} />
      </td>
      <td onClick={selectCheckbox}>{cargoArea.name}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertLengthUnit(cargoArea.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td onClick={selectCheckbox}>{roundNumber(convertWeightUnit(cargoArea.maxWeight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>
        <input
          id={"cargoWeightInput" + cargoArea.id}
          disabled={!inConfig}
          onChange={() => { }}
          placeholder={units.weightUnits}
          value={loadedWeight ? roundNumber(convertWeightUnit(loadedWeight, baseWeightUnit, units.weightUnits), unitPrecision) : ""} />
      </td>
      <td>
        {inConfig
          ?
          <button
            onClick={removeFromConfig} >
            Remove From Aircraft
          </button>
          :
          <button
            onClick={addToConfig} >
            Add To Aircraft
          </button>}
      </td>
    </tr>
  );
}

interface fuelSelectionProps extends aircraftProps {
  fuelTank: fuelTankT,
  airConfigIndex: number
}

function FuelSelection({ aircraft, setAircraft, fuelTank, airConfigIndex }: fuelSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  let fuelTankIndex: number = -1;
  fuelTankIndex = aircraft.fuelTanks.findIndex((s) => s.id === fuelTank.id);

  const inConfig = aircraft.aircraftConfigs[airConfigIndex].fuelTanks.findIndex((s) => s === fuelTank.id) >= 0;

  function addToConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.aircraftConfigs[airConfigIndex].fuelTanks.push(fuelTank.id);
    setAircraft(tmp);
  }

  function removeFromConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const index = tmp.aircraftConfigs[airConfigIndex].fuelTanks.findIndex(a => a === fuelTank.id);
    if (index < 0) return;
    tmp.aircraftConfigs[airConfigIndex].fuelTanks.splice(index, 1);
    setAircraft(tmp);
  }

  return (
    <tr className={"fuelTankSelect" + (fuelTank.removable && !inConfig ? " unused" : "")}>
      <td>{fuelTank.name}</td>
      <td>{roundNumber(convertLengthUnit(fuelTank.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td>{roundNumber(convertFuelUnits(fuelTank.maxWeight, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision)}</td>
      <td>{roundNumber(convertFuelUnits(fuelTank.unusable, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision)}</td>
      <td>
        {fuelTank.removable && (inConfig ? <button onClick={removeFromConfig} >Remove From Aircraft</button> : <button onClick={addToConfig} >Add To Aircraft</button>)}
      </td>
    </tr>
  );
}

interface EquipmentSelectionProps extends aircraftProps {
  equipment: equipmentT,
  airConfigIndex: number
}

function EquipmentSelection({ aircraft, setAircraft, equipment, airConfigIndex }: EquipmentSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  const oldCount = useRef(1);
  const [count, setCount] = useState(1);
  const equipmentIndex = aircraft.equipment.findIndex((e) => e.id === equipment.id);

  const inConfig = aircraft.aircraftConfigs[airConfigIndex].equipment.findIndex((s) => s.id === equipment.id) >= 0;

  const locationValues = getSortedByArm([...aircraft.seats.map(s => { return { ...s, id: "S" + s.id } }), ...aircraft.cargoAreas.map(c => { return { ...c, id: "C" + c.id } })])
  const locationValueIndex = locationValues.findIndex((s) => s.id === equipment.area);

  function addToConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.aircraftConfigs[airConfigIndex].equipment.push({ id: equipment.id, count: 1 });
    setAircraft(tmp);
  }

  function removeFromConfig() {
    if (airConfigIndex < 0) return;
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const index = tmp.aircraftConfigs[airConfigIndex].equipment.findIndex(a => a.id === equipment.id);
    if (index < 0) return;
    tmp.aircraftConfigs[airConfigIndex].equipment.splice(index, 1);
    setAircraft(tmp);
  }

  function setAircraftCount(value: number): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    const index = aircraft.aircraftConfigs[airConfigIndex].equipment.findIndex((s) => s.id === equipment.id);
    tmp.aircraftConfigs[airConfigIndex].equipment[index].count = value;
    setCount(value);
    setAircraft(tmp);
  }

  function setArm(arm: number): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.equipment[equipmentIndex].arm = arm;
    setAircraft(tmp);
  }

  function setArea(value: string): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.equipment[equipmentIndex].area = value;
    const valueIndex = locationValues.findIndex(e => e.id === value);
    if (valueIndex >= 0)
      tmp.equipment[equipmentIndex].arm = locationValues[valueIndex].arm;
    setAircraft(tmp);
  }

  useEffect(() => {
    const index = aircraft.aircraftConfigs[airConfigIndex].equipment.findIndex((s) => s.id === equipment.id);
    setCount(inConfig ? aircraft.aircraftConfigs[airConfigIndex].equipment[index].count : 0);
    oldCount.current = 1;
  }, [aircraft])
  return (
    <tr className={"equipmentSelect" + (!inConfig ? " unused" : "")}>
      <td>{equipment.name}</td>
      <td onClick={() => setVisible(inConfig && true)}>
        {roundNumber(convertLengthUnit(equipment.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}
        <dialog open={visible} onClose={() => setVisible(false)} closedby='any'>
          <div className='equipmentEdit'>
            <label htmlFor={"equipSelectArmLoc-" + equipment.id}>Arm</label>
            <select
              id={"equipSelectArmLoc-" + equipment.id}
              value={equipment.area}
              onChange={e => setArea(e.target.value)}>
              <option value={""}>Manual</option>
              {locationValues.map((area) => {
                return <option key={area.id} value={area.id}>{area.name}</option>
              })}
            </select>
            {locationValueIndex < 0 &&
              <input
                id={'customEquipmentArm' + equipment.id}
                disabled={!(locationValueIndex < 0)}
                type='number'
                onChange={e => setArm(Number(e.target.value))}
                value={locationValueIndex < 0 ? (equipment.arm ? roundNumber(convertLengthUnit(equipment.arm, baseLengthUnit, units.lengthUnits), unitPrecision) : "") : roundNumber(convertLengthUnit(locationValues[locationValueIndex].arm, baseLengthUnit, units.lengthUnits), unitPrecision)} />
            }
          </div>
        </dialog>
      </td>
      <td>{roundNumber(convertWeightUnit(equipment.weight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>
        <input
          id={`equipmentCount-${equipment.id}`}
          disabled={!inConfig}
          min={0}
          value={count}
          type={"number"}
          onChange={(e) => setAircraftCount(Number(e.target.value))} />
      </td>
      <td>{roundNumber(convertWeightUnit(equipment.weight * count, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>
        {inConfig ? <button onClick={removeFromConfig} >Remove From Aircraft</button> : <button onClick={addToConfig} >Add To Aircraft</button>}
      </td>
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
            <colgroup>
              <col />
              <col style={{ width: "9rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "10rem" }} />
            </colgroup>
            <tbody>
              <tr>
                <th>✔</th>
                <th>Name</th>
                <th >{`Arm (${units.lengthUnits})`}</th>
                <th >{`Max Weight (${units.weightUnits})`}</th>
                <th ># of Seats</th>
                <th >Ops Load</th>
                <th></th>
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
            <colgroup>
              <col />
              <col style={{ width: "9rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "10rem" }} />
            </colgroup>
            <tbody>
              <tr>
                <th>✔</th>
                <th>Name</th>
                <th>{`Arm (${units.lengthUnits})`}</th>
                <th>{`Max Weight (${units.weightUnits})`}</th>
                <th>Ops Load</th>
                <th></th>
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
            <colgroup>
              <col style={{ width: "9rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "10rem" }} />
            </colgroup>
            <tbody>
              <tr>
                <th>Name</th>
                <th>{`Arm (${units.lengthUnits})`}</th>
                <th>{`Max Fuel (${units.fuelUnits})`}</th>
                <th>{`Unusable Fuel (${units.fuelUnits})`}</th>
                <th></th>
              </tr>
              {getSortedByArm(aircraft.fuelTanks).map((fuel: fuelTankT) => {
                return <FuelSelection
                  key={fuel.id + " fuelSelect"}
                  fuelTank={fuel}
                  aircraft={aircraft}
                  setAircraft={setAircraft}
                  airConfigIndex={configIndex} />
              })}
            </tbody>
          </table>
        </Subregion>
        <Subregion name={"Equipment"}>
          <table className="tableData">
            <colgroup>
              <col style={{ width: "9rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "10rem" }} />
            </colgroup>
            <tbody>
              <tr>
                <th>Name</th>
                <th>{`Arm (${units.lengthUnits})`}</th>
                <th>{`Weight (${units.weightUnits})`}</th>
                <th>Count</th>
                <th>{`Total Weight (${units.weightUnits})`}</th>
                <th></th>
              </tr>
              {getSortedByArm(aircraft.equipment).map((equipment: equipmentT) => {
                return <EquipmentSelection
                  key={equipment.id + " equipSelect"}
                  equipment={equipment}
                  aircraft={aircraft}
                  setAircraft={setAircraft}
                  airConfigIndex={configIndex} />
              })}
            </tbody>
          </table>
        </Subregion>
      </MultiPane >
    </>
  );
}


export default Config;
