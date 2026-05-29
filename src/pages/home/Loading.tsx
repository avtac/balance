import '../../Layout.css'
import './Loading.css'
import { useContext, useRef, useState, type ReactNode, type RefObject } from "react";
import { baseFuelUnit, baseLengthUnit, baseWeightUnit, type aircraftT, type cargoAreaT, type cargoT, type fuelTankT, type loadingProps, type loadingT, type nameProps, type passengerT, type seatT } from "../../Types";
import { MultiPane, Subregion } from "../../Layout";
import { calculateBalanceForLanding, calculateBalanceForOperationConfig, calculateBalanceForTakeoff, calculateEmptyBalanceForConfig, getSortedByArm, getSortedByArmClosest, roundNumber } from "../../utility";
import { convertFuelUnits, convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from "../../UnitsContext";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons';

interface seatLoadingProps extends loadingProps {
  aircraft: aircraftT;
  opsConfigIndex: number;
  seat: seatT;
}

function SeatLoading({ loading, setLoading, aircraft, opsConfigIndex, seat }: seatLoadingProps): ReactNode {
  const units = useContext(UnitContext);
  const seatIndex = aircraft.operationConfigs[opsConfigIndex].seats.findIndex(s => s.id === seat.id);
  let opsUsedSeats = 0;
  if (seatIndex >= 0)
    opsUsedSeats = Math.ceil(aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight / seat.maxWeight)
  const opsWeight = seatIndex >= 0 ? aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight : 0;

  const s = loading.passengers.find(s => s.location === seat.id);
  const loadedWeight = (s ? s.count * s.avgWeight : 0);
  const totalWeight = loadedWeight + opsWeight;

  function setCount(count: number): void {
    const tmp: loadingT = JSON.parse(JSON.stringify(loading));
    if (!tmp.passengers.some(s => s.location === seat.id))
      tmp.passengers.push({ location: seat.id, avgWeight: seat.maxWeight, count: Math.min(count, seat.seatCount - opsUsedSeats) });
    else {
      const index = tmp.passengers.findIndex(s => s.location === seat.id);
      tmp.passengers[index].count = Math.min(count, seat.seatCount - opsUsedSeats);
    }
    setLoading(tmp);
  }

  return (
    <tr>
      <td>{seat.name}</td>
      <td>
        {opsUsedSeats === seat.seatCount ?
          <p>Seats Filled</p>
          :
          <input
            type='number'
            min={0}
            max={seat.seatCount - opsUsedSeats}
            value={s && s.count > 0 ? s.count : ""}
            onChange={e => setCount(Number(e.target.value))}
            placeholder='Count'
          />}
      </td>
      <td>{totalWeight} {units.weightUnits}</td>
    </tr>
  )
}

interface cargoLoadingProps extends loadingProps {
  aircraft: aircraftT;
  opsConfigIndex: number;
  cargoArea: cargoAreaT;
}

function CargoLoading({ loading, setLoading, aircraft, opsConfigIndex, cargoArea }: cargoLoadingProps): ReactNode {
  const units = useContext(UnitContext);
  const cargoAreaIndex = aircraft.operationConfigs[opsConfigIndex].cargoAreas.findIndex(s => s.id === cargoArea.id);
  const opsWeight = cargoAreaIndex >= 0 ? aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoAreaIndex].weight : 0;

  const cargo = loading.cargo.find(c => c.location === cargoArea.id);
  const loadedWeight = (cargo ? cargo.weight : 0)
  const totalWeight = loadedWeight + opsWeight

  function setWeight(weight: number): void {
    const tmp: loadingT = JSON.parse(JSON.stringify(loading));
    weight = convertWeightUnit(weight, units.weightUnits, baseWeightUnit);
    if (!tmp.cargo.some(c => c.location === cargoArea.id))
      tmp.cargo.push({ location: cargoArea.id, weight: weight });
    else {
      const index = tmp.cargo.findIndex(c => c.location === cargoArea.id);
      tmp.cargo[index].weight = Math.min(cargoArea.maxWeight - opsWeight, weight);
    }
    setLoading(tmp);
  }

  return (
    <tr>
      <td>{cargoArea.name}</td>
      <td>
        {opsWeight === cargoArea.maxWeight ?
          <p>Cargo Filled</p>
          :
          <input
            type='number'
            min={0}
            max={roundNumber(convertWeightUnit(cargoArea.maxWeight - opsWeight, baseWeightUnit, units.weightUnits), unitPrecision)}
            step={5}
            value={loadedWeight ? loadedWeight : ""}
            onChange={e => setWeight(Number(e.target.value))}
            placeholder={units.weightUnits}
          />}
      </td>
      <td>{totalWeight} {units.weightUnits}</td>
    </tr>
  )
}

interface fuelLoadingProps extends loadingProps {
  aircraft: aircraftT;
  opsConfigIndex: number;
  fuelTank: fuelTankT;
}

function FuelLoading({ loading, setLoading, fuelTank }: fuelLoadingProps): ReactNode {
  const units = useContext(UnitContext);

  const fuel = loading.fuel.find(f => f.tank === fuelTank.id);
  const loadedWeight = roundNumber(convertFuelUnits(fuel ? fuel.loadedFuel : 0, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision);
  const consumedFuel = roundNumber(convertFuelUnits(fuel ? fuel.tripFuel : 0, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision);

  function setLoad(weight: number): void {
    const tmp: loadingT = JSON.parse(JSON.stringify(loading));
    weight = convertFuelUnits(Math.min(weight, fuelTank.maxWeight), units.fuelUnits, baseFuelUnit, units.fuelDensity);
    if (!tmp.fuel.some(c => c.tank === fuelTank.id))
      tmp.fuel.push({ tank: fuelTank.id, tripFuel: weight, loadedFuel: weight });
    else {
      const index = tmp.fuel.findIndex(c => c.tank === fuelTank.id);
      tmp.fuel[index].loadedFuel = weight;
      tmp.fuel[index].tripFuel = Math.min(weight - fuelTank.unusable, tmp.fuel[index].tripFuel);
    }
    setLoading(tmp);
  }

  function setUsed(weight: number): void {
    const tmp: loadingT = JSON.parse(JSON.stringify(loading));
    weight = convertFuelUnits(Math.min(weight, loadedWeight - fuelTank.unusable), units.fuelUnits, baseFuelUnit, units.fuelDensity);
    if (!tmp.fuel.some(c => c.tank === fuelTank.id))
      tmp.fuel.push({ tank: fuelTank.id, tripFuel: weight, loadedFuel: fuelTank.maxWeight });
    else {
      const index = tmp.fuel.findIndex(c => c.tank === fuelTank.id);
      tmp.fuel[index].tripFuel = weight;
    }
    setLoading(tmp);
  }

  return (
    <tr>
      <td>{fuelTank.name}</td>
      <td>
        <input
          type='number'
          min={roundNumber(convertFuelUnits(fuelTank.unusable, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision)}
          max={roundNumber(convertFuelUnits(fuelTank.maxWeight, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision)}
          step={1}
          value={loadedWeight ? loadedWeight : ""}
          onChange={e => setLoad(Number(e.target.value))}
          placeholder={units.fuelUnits}
        />
      </td>
      <td>
        <input
          type='number'
          min={0}
          max={loadedWeight - roundNumber(convertFuelUnits(fuelTank.unusable, baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision)}
          step={1}
          value={consumedFuel ? consumedFuel : ""}
          onChange={e => setUsed(Number(e.target.value))}
          placeholder={units.fuelUnits}
        />
      </td>
      <td className='narrowFilter'>{roundNumber(loadedWeight - consumedFuel, unitPrecision)} {units.fuelUnits}</td>
    </tr>
  )
}

const loadingDirections = ['frontToBack', 'backToFront', 'point'] as const;
const loadingDirectionsNames = { frontToBack: "Front To Back", backToFront: "Back To Front", point: "Point" } as const;
type loadingDirectionsT = typeof loadingDirections[number];

function PassengerLoader({ loading, setLoading, aircraft, selectedOpsConfig }: titleProps) {
  const units = useContext(UnitContext);
  const [fillCenter, setFillCenter] = useState(0);
  const [direction, setDirection] = useState('frontToBack' as loadingDirectionsT)
  const dialogRef: RefObject<(null | HTMLDialogElement)> = useRef(null);

  const opsConfigIndex = aircraft.operationConfigs.findIndex(c => c.id === selectedOpsConfig);
  if (opsConfigIndex < 0) return (<></>);

  const configIndex = aircraft.aircraftConfigs.findIndex(c => c.id === aircraft.operationConfigs[opsConfigIndex].config);
  const totalSeats = loading.passengers.reduce((sum, s) => sum + s.count, 0);

  function loadSeats(count: number, direction: loadingDirectionsT): void {
    let remainingToLoad = count;
    const tmp: loadingT = JSON.parse(JSON.stringify(loading));
    tmp.passengers = [];

    // Seat locations sorted by arm
    let seats: seatT[] = [];
    if (['frontToBack', 'backToFront'].includes(direction)) {
      seats = getSortedByArm(aircraft.aircraftConfigs[configIndex].seats.map(seatId => aircraft.seats.find(s => s.id === seatId)).filter(s => s != undefined));
      if ('backToFront' === direction)
        seats = seats.reverse();
    }
    else if ('point' === direction)
      seats = getSortedByArmClosest(aircraft.aircraftConfigs[configIndex].seats.map(seatId => aircraft.seats.find(s => s.id === seatId)).filter(s => s != undefined), fillCenter);

    const originalFill: passengerT[] = loading.passengers;
    // Fill original seats to ensure they don't move
    for (const seat of seats) {
      if (remainingToLoad <= 0) break;
      const originalSeat = originalFill.find(s => s.location === seat.id);
      if (!originalSeat) continue;
      const numToLoad = Math.min(originalSeat.count, remainingToLoad);
      tmp.passengers.push({ ...originalSeat, count: numToLoad });
      remainingToLoad -= numToLoad;
    }

    // Fill seats with new passengers
    for (const seat of seats) {
      if (remainingToLoad <= 0) break;

      const seatIndex = aircraft.operationConfigs[opsConfigIndex].seats.findIndex(s => s.id === seat.id);
      let opsUsedSeats = 0;
      if (seatIndex >= 0)
        opsUsedSeats = Math.ceil(aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight / seat.maxWeight)
      if (opsUsedSeats === seat.seatCount) continue;

      // If seat already taken skip it
      let takenSeatIndex = originalFill.findIndex(c => c.location === seat.id);
      let alreadyTaken = 0;
      if (takenSeatIndex >= 0)
        alreadyTaken = originalFill[takenSeatIndex].count;
      if (opsUsedSeats + alreadyTaken === seat.seatCount) continue;

      const numToLoad = Math.min(remainingToLoad, seat.seatCount - opsUsedSeats - alreadyTaken);
      remainingToLoad -= numToLoad;
      let newSeatIndex = tmp.passengers.findIndex(c => c.location === seat.id);
      if (newSeatIndex < 0)
        tmp.passengers.push({ location: seat.id, avgWeight: seat.maxWeight, count: numToLoad + alreadyTaken });
      else {
        tmp.passengers[newSeatIndex].count = numToLoad + alreadyTaken;
      }
    }
    setLoading(tmp);
  }

  return (
    <div className='filler'>
      <label htmlFor='seatTotalPassengersLoaded'>Passengers</label>
      <div>
        <input
          id='seatTotalPassengersLoaded'
          type='number'
          min={0}
          max={aircraft.seats.reduce((sum, s) => sum + s.seatCount, 0)}
          placeholder='Count'
          value={totalSeats ? totalSeats : ""}
          onChange={(e) => loadSeats(Number(e.target.value), direction)} />
        <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faEllipsisV} onClick={() => dialogRef.current ? dialogRef.current.show() : undefined} />
        <dialog ref={dialogRef} className='rightDialog' closedby='any'>
          <div>
            <label htmlFor='seatLoadingDirectionSelect'>Seat Load Mode</label>
            <select id='seatLoadingDirectionSelect' value={direction} onChange={(e) => setDirection(e.target.value as loadingDirectionsT)}>
              {loadingDirections.map(d => <option value={d} key={d + "seatLoadingDirections"} >{loadingDirectionsNames[d]}</option>)}
            </select>
            {direction === 'point' &&
              <>
                <input
                  id='seatLoadCenterPoint'
                  type='number'
                  style={{ width: "5rem" }}
                  placeholder={units.lengthUnits}
                  value={fillCenter ? roundNumber(convertLengthUnit(fillCenter, baseLengthUnit, units.lengthUnits), unitPrecision) : ""}
                  onChange={(e) => setFillCenter(convertLengthUnit(Number(e.target.value), units.lengthUnits, baseLengthUnit))} />
              </>
            }
          </div>
        </dialog>
      </div>
    </div>
  )
}

function CargoLoader({ loading, setLoading, aircraft, selectedOpsConfig }: titleProps) {
  const units = useContext(UnitContext);
  const [fillCenter, setFillCenter] = useState(0);
  const [direction, setDirection] = useState('frontToBack' as loadingDirectionsT)
  const dialogRef: RefObject<(null | HTMLDialogElement)> = useRef(null);

  const opsConfigIndex = aircraft.operationConfigs.findIndex(c => c.id === selectedOpsConfig);
  if (opsConfigIndex < 0) return (<></>);

  const configIndex = aircraft.aircraftConfigs.findIndex(c => c.id === aircraft.operationConfigs[opsConfigIndex].config);
  const totalCargo = loading.cargo.reduce((sum, s) => sum + s.weight, 0);

  function loadCargo(weight: number, direction: loadingDirectionsT): void {
    let remainingToLoad = weight;
    const tmp: loadingT = JSON.parse(JSON.stringify(loading));
    tmp.cargo = [];

    // Cargo locations sorted by arm
    let sortedCargoAreas: cargoAreaT[] = [];
    if (['frontToBack', 'backToFront'].includes(direction)) {
      sortedCargoAreas = getSortedByArm(aircraft.aircraftConfigs[configIndex].cargoAreas.map(cargoId => aircraft.cargoAreas.find(c => c.id === cargoId)).filter(c => c != undefined));
      if ('backToFront' === direction)
        sortedCargoAreas = sortedCargoAreas.reverse();
    }
    else if ('point' === direction)
      sortedCargoAreas = getSortedByArmClosest(aircraft.aircraftConfigs[configIndex].cargoAreas.map(cargoId => aircraft.cargoAreas.find(c => c.id === cargoId)).filter(c => c != undefined), fillCenter);

    const originalFill: cargoT[] = loading.cargo;
    // Fill original cargoAreas to ensure they don't move
    for (const cargoArea of sortedCargoAreas) {
      if (remainingToLoad <= 0) break;
      const originalCargoArea = originalFill.find(c => c.location === cargoArea.id);
      if (!originalCargoArea) continue;
      const numToLoad = Math.min(originalCargoArea.weight, remainingToLoad);
      if (numToLoad == 0) continue;
      tmp.cargo.push({ ...originalCargoArea, weight: numToLoad });
      remainingToLoad -= numToLoad;
    }

    // Fill cargoAreas with new cargo
    for (const cargoArea of sortedCargoAreas) {
      if (remainingToLoad <= 0) break;

      const cargoIndex = aircraft.operationConfigs[opsConfigIndex].cargoAreas.findIndex(s => s.id === cargoArea.id);
      let opsUsedCargo = 0;
      if (cargoIndex >= 0)
        opsUsedCargo = aircraft.operationConfigs[opsConfigIndex].cargoAreas[cargoIndex].weight
      if (opsUsedCargo === cargoArea.maxWeight) continue;

      // If cargoArea already taken skip it
      let takenCargoIndex = originalFill.findIndex(c => c.location === cargoArea.id);
      let alreadyTaken = 0;
      if (takenCargoIndex >= 0)
        alreadyTaken = originalFill[takenCargoIndex].weight;
      if (opsUsedCargo + alreadyTaken === cargoArea.maxWeight) continue;

      const numToLoad = Math.min(remainingToLoad, cargoArea.maxWeight - opsUsedCargo - alreadyTaken);
      remainingToLoad -= numToLoad;
      let newCargoIndex = tmp.cargo.findIndex(c => c.location === cargoArea.id);
      if (newCargoIndex < 0)
        tmp.cargo.push({ location: cargoArea.id, weight: numToLoad + alreadyTaken });
      else {
        tmp.cargo[newCargoIndex].weight = numToLoad + alreadyTaken;
      }
    }
    setLoading(tmp);
  }

  return (
    <div className='filler'>
      <label htmlFor='cargoTotalLoaded'>Cargo</label>
      <div>
        <input
          id='cargoTotalLoaded'
          type='number'
          min={0}
          max={aircraft.cargoAreas.reduce((sum, s) => sum + s.maxWeight, 0)}
          step={5}
          placeholder={units.weightUnits}
          value={totalCargo ? totalCargo : ""}
          onChange={(e) => loadCargo(convertWeightUnit(Number(e.target.value), baseWeightUnit, units.weightUnits), direction)} />
        <FontAwesomeIcon style={{ cursor: 'pointer' }} icon={faEllipsisV} onClick={() => dialogRef.current ? dialogRef.current.show() : undefined} />
        <dialog ref={dialogRef} className='rightDialog' closedby='any'>
          <div>
            <label htmlFor='cargoLoadingDirectionSelect'>Cargo Load Mode</label>
            <select id='cargoLoadingDirectionSelect' value={direction} onChange={(e) => setDirection(e.target.value as loadingDirectionsT)}>
              {loadingDirections.map(d => <option value={d} key={d + "cargoLoadingDirections"} >{loadingDirectionsNames[d]}</option>)}
            </select>
            {direction === 'point' &&
              <>
                <input
                  id='cargoLoadCenterPoint'
                  type='number'
                  style={{ width: "5rem" }}
                  placeholder={units.lengthUnits}
                  value={fillCenter ? roundNumber(convertLengthUnit(fillCenter, baseLengthUnit, units.lengthUnits), unitPrecision) : ""}
                  onChange={(e) => setFillCenter(convertLengthUnit(Number(e.target.value), units.lengthUnits, baseLengthUnit))} />
              </>
            }
          </div>
        </dialog>
      </div>
    </div>
  )
}

interface titleProps extends loadingProps {
  aircraft: aircraftT;
  selectedOpsConfig: string;
}

function Title({ aircraft, selectedOpsConfig, loading, setLoading }: titleProps): ReactNode {
  const units = useContext(UnitContext);
  const opsConfigIndex = aircraft.operationConfigs.findIndex(c => c.id === selectedOpsConfig);
  if (opsConfigIndex < 0) return (<></>);

  const [emptyWeight, emptyArm] = calculateEmptyBalanceForConfig(aircraft, aircraft.operationConfigs[opsConfigIndex].config);
  const [opsWeight, opsArm] = calculateBalanceForOperationConfig(aircraft, selectedOpsConfig);
  const [takeoffWeight, takeoffArm] = calculateBalanceForTakeoff(aircraft, selectedOpsConfig, loading);
  const [landWeight, landArm] = calculateBalanceForLanding(aircraft, selectedOpsConfig, loading);

  return (
    <>
      <div id='loadingTitle'>
        <h2>{aircraft.operationConfigs[opsConfigIndex].name}</h2>
        <PassengerLoader aircraft={aircraft} selectedOpsConfig={selectedOpsConfig} loading={loading} setLoading={setLoading} />
        <CargoLoader aircraft={aircraft} selectedOpsConfig={selectedOpsConfig} loading={loading} setLoading={setLoading} />
      </div>
      <div id='configTitleData'>
        <h4>Empty Weight</h4>
        <p>{roundNumber(convertWeightUnit(emptyWeight, baseWeightUnit, units.weightUnits), 100)} {units.weightUnits}</p>
        <h4>Empty Arm</h4>
        <p>{roundNumber(convertLengthUnit(emptyArm, baseLengthUnit, units.lengthUnits), 100)} {units.lengthUnits}</p>
        <h4>Ops Weight</h4>
        <p>{roundNumber(convertWeightUnit(opsWeight, baseWeightUnit, units.weightUnits), 100)} {units.weightUnits}</p>
        <h4>Ops Arm</h4>
        <p>{roundNumber(convertLengthUnit(opsArm, baseLengthUnit, units.lengthUnits), 100)} {units.lengthUnits}</p>
        <h4>Takeoff Weight</h4>
        <p>{roundNumber(convertWeightUnit(takeoffWeight, baseWeightUnit, units.weightUnits), 100)} {units.weightUnits}</p>
        <h4>Takeoff Arm</h4>
        <p>{roundNumber(convertLengthUnit(takeoffArm, baseLengthUnit, units.lengthUnits), 100)} {units.lengthUnits}</p>
        <h4>Land Weight</h4>
        <p>{roundNumber(convertWeightUnit(landWeight, baseWeightUnit, units.weightUnits), 100)} {units.weightUnits}</p>
        <h4>Land Arm</h4>
        <p>{roundNumber(convertLengthUnit(landArm, baseLengthUnit, units.lengthUnits), 100)} {units.lengthUnits}</p>
      </div>
    </>
  )
}

interface localLoadingProps extends loadingProps {
  aircraft: aircraftT;
  selectedOpsConfig: string;
}

function Loading({ loading, setLoading, aircraft, selectedOpsConfig }: localLoadingProps & nameProps): ReactNode {
  const units = useContext(UnitContext);
  const opsConfigIndex = aircraft.operationConfigs.findIndex(c => c.id === selectedOpsConfig);
  if (opsConfigIndex < 0) return (<></>);
  const configIndex = aircraft.aircraftConfigs.findIndex(c => c.id === aircraft.operationConfigs[opsConfigIndex].config);

  let seatRows = getSortedByArm(aircraft.seats)
    .filter(seat => aircraft.aircraftConfigs[configIndex].seats.some(s => s === seat.id))
    .map((seat: seatT) => {
      return <SeatLoading
        key={seat.id + " seatFill"}
        loading={loading}
        setLoading={setLoading}
        aircraft={aircraft}
        opsConfigIndex={opsConfigIndex}
        seat={seat} />
    })

  let cargoRows = getSortedByArm(aircraft.cargoAreas)
    .filter(cargoArea => aircraft.aircraftConfigs[configIndex].cargoAreas.some(s => s === cargoArea.id))
    .map((cargoArea: cargoAreaT) => {
      return <CargoLoading
        key={cargoArea.id + " cargoFill"}
        loading={loading}
        setLoading={setLoading}
        aircraft={aircraft}
        opsConfigIndex={opsConfigIndex}
        cargoArea={cargoArea} />
    })

  let fuelRows = getSortedByArm(aircraft.fuelTanks)
    .filter(fuelTank => !fuelTank.removable || aircraft.aircraftConfigs[configIndex].fuelTanks.some(t => t === fuelTank.id))
    .map((fuelTank: fuelTankT) => {
      return <FuelLoading
        key={fuelTank.id + " cargoFill"}
        loading={loading}
        setLoading={setLoading}
        aircraft={aircraft}
        opsConfigIndex={opsConfigIndex}
        fuelTank={fuelTank} />
    })

  return (
    <>
      <Subregion id='balancr-configTitle'>
        <Title
          aircraft={aircraft}
          selectedOpsConfig={selectedOpsConfig}
          loading={loading}
          setLoading={setLoading} />
      </Subregion>
      <MultiPane>
        <Subregion id='passengers' name="Passengers">
          <table className="tableData">
            <thead>
              <tr>
                <th>Name</th>
                <th>Passenger Count</th>
                <th>Total Weight ({units.weightUnits})</th>
              </tr>
            </thead>
            <tbody>
              {seatRows}
            </tbody>
          </table>
        </Subregion>
        <Subregion id='cargo' name="Cargo">
          <table className="tableData">
            <thead>
              <tr>
                <th>Name</th>
                <th>Cargo Weight ({units.weightUnits})</th>
                <th>Total Weight ({units.weightUnits})</th>
              </tr>
            </thead>
            <tbody>
              {cargoRows}
            </tbody>
          </table>
        </Subregion>
        <Subregion id='fuel' name="Fuel">
          <table className="tableData">
            <thead>
              <tr>
                <th>Name</th>
                <th>Fuel Load ({units.fuelUnits})</th>
                <th>Consumed Fuel ({units.fuelUnits})</th>
                <th className='narrowFilter'>Landing Fuel ({units.fuelUnits})</th>
              </tr>
            </thead>
            <tbody>
              {fuelRows}
            </tbody>
          </table>
        </Subregion>
      </MultiPane>
    </>
  )
}

export default Loading;
