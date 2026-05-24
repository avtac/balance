import './Config.css'
import '../../Layout.css'
import { useContext, useEffect, useRef, useState, type ReactElement } from 'react';
import { MultiPane, Subregion } from "../../Layout";
import { type aircraftConfigT, type cargoAreaT, type aircraftT, type equipmentT, type seatT, type aircraftProps, type fuelTankT, type nameProps, baseLengthUnit, baseWeightUnit, type configT, type operationConfigT, baseFuelUnit } from "../../Types";
import { getSortedByArm, roundNumber } from '../../utility';
import { convertFuelUnits, convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from '../../UnitsContext';

interface seatSelectionProps {
  seat: seatT,
  airConfig: aircraftConfigT,
  opsConfig: operationConfigT,
}

function SeatSelection({ seat, airConfig, opsConfig }: seatSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  let seatIndex: number = -1;
  if (opsConfig) seatIndex = opsConfig.seats.findIndex((s) => s.id === seat.id);
  let checked = seatIndex >= 0;
  const inConfig = airConfig.seats.findIndex((s) => s === seat.id) >= 0;

  function selectCheckbox(): void {
    checked = !checked;
    // const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    if (checked) {
      if (airConfig.seats.findIndex((s: string) => s === seat.id) < 0)
        airConfig.seats.push(seat.id);
    } else {
      airConfig.seats.splice(seatIndex, 1);
    }
    checked = !checked;
  }

  checked = seatIndex >= 0;
  const loadedWeight = seatIndex >= 0 ? opsConfig.seats[seatIndex].weight : 0;
  return (
    <tr onClick={selectCheckbox} className={"seatSelect" + (!inConfig ? " unused" : "")}>
      <td>
        <input disabled={!inConfig} onChange={() => { }} checked={checked} type={"checkbox"} />
      </td>
      <td>{seat.name}</td>
      <td>{roundNumber(convertLengthUnit(seat.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td>{roundNumber(convertWeightUnit(seat.maxWeight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>{seat.seatCount}</td>
      <td>
        <input disabled={!inConfig} onChange={() => { }} value={roundNumber(convertWeightUnit(loadedWeight, baseWeightUnit, units.weightUnits), unitPrecision)} />
      </td>
    </tr >
  );
}

interface cargoSelectionProps {
  cargoArea: cargoAreaT,
  airConfig: aircraftConfigT,
  opsConfig: operationConfigT,
}

function CargoSelection({ cargoArea, airConfig, opsConfig }: cargoSelectionProps): ReactElement {
  const units = useContext(UnitContext);
  let cargoAreaIndex = -1;
  if (opsConfig) cargoAreaIndex = opsConfig.cargoAreas.findIndex((s) => s.id == cargoArea.id);
  let checked = cargoAreaIndex >= 0;
  const inConfig = airConfig.cargoAreas.findIndex((c) => c === cargoArea.id) >= 0;

  function selectCheckbox(): void {
    // const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    // if (checked) {
    //   if (airConfig.cargoAreas.findIndex((s: string) => s === cargoArea.id) < 0)
    //     airConfig.cargoAreas.push(cargoArea.id);
    // } else {
    //   airConfig.cargoAreas.splice(cargoAreaIndex, 1);
    //   for (const [index, opsConf] of tmp.operationConfigs.entries()) {
    //     const usesConfig = opsConf.config === airConfig.id;
    //     if (usesConfig) {
    //       const i = opsConf.cargoAreas.findIndex((s: { weight: number, id: string }) => s.id === cargoArea.id)
    //       if (i < 0) continue;
    //       opsConfig.cargoAreas.splice(i, 1);
    //     }
    //   }
    // }
    // checked = !checked;
  }

  checked = cargoAreaIndex >= 0;
  const loadedWeight = cargoAreaIndex >= 0 ? opsConfig.cargoAreas[cargoAreaIndex].weight : 0;
  return (
    <tr onClick={selectCheckbox} className={"cargoAreaSelect" + (!inConfig ? " unused" : "")}>
      <td>
        <input disabled={!inConfig} onChange={() => { }} checked={checked} type={"checkbox"} />
      </td>
      <td>{cargoArea.name}</td>
      <td>{roundNumber(convertLengthUnit(cargoArea.arm, baseLengthUnit, units.lengthUnits), unitPrecision)}</td>
      <td>{roundNumber(convertWeightUnit(cargoArea.maxWeight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>{roundNumber(convertWeightUnit(loadedWeight, baseWeightUnit, units.weightUnits), unitPrecision)}</td>
      <td>
        <input disabled={!inConfig} onChange={() => { }} value={roundNumber(convertWeightUnit(loadedWeight, baseWeightUnit, units.weightUnits), unitPrecision)} />
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
// TODO:        This needs to be changed to pull from some config value ^^^^^^^^^^^

interface AircraftConfigsProps {
  aircraft: aircraftT,
  selectedOpsConfig: string,
}

function Config({ aircraft, selectedOpsConfig }: AircraftConfigsProps & nameProps): ReactElement {
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
                  airConfig={aircraft.aircraftConfigs[configIndex]}
                  opsConfig={aircraft.operationConfigs[opsConfigIndex]}
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
                  opsConfig={aircraft.operationConfigs[opsConfigIndex]}
                  airConfig={aircraft.aircraftConfigs[configIndex]} />
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
