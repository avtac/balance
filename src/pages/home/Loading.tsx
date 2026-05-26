import '../../Layout.css'
import { useContext, type ReactNode } from "react";
import { baseFuelUnit, baseLengthUnit, baseWeightUnit, type aircraftT, type cargoAreaT, type fuelTankT, type loadingProps, type loadingT, type nameProps, type seatT } from "../../Types";
import { MultiPane, Subregion } from "../../Layout";
import { calculateBalanceForLanding, calculateBalanceForOperationConfig, calculateBalanceForTakeoff, calculateEmptyBalanceForConfig, getSortedByArm, roundNumber } from "../../utility";
import { convertFuelUnits, convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from "../../UnitsContext";

interface seatLoadingProps extends loadingProps {
  aircraft: aircraftT;
  opsConfigIndex: number;
  seat: seatT;
}

function SeatLoading({ loading, setLoading, aircraft, opsConfigIndex, seat }: seatLoadingProps): ReactNode {
  // const units = useContext(UnitContext);
  const seatIndex = aircraft.operationConfigs[opsConfigIndex].seats.findIndex(s => s.id === seat.id);
  let opsUsedSeats = 0;
  if (seatIndex >= 0)
    opsUsedSeats = Math.ceil(aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight / seat.maxWeight)
  const opsWeight = opsUsedSeats * seat.maxWeight;

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
            value={s ? s.count : ""}
            onChange={e => setCount(Number(e.target.value))}
            placeholder='Count'
          />}
      </td>
      <td>{totalWeight}</td>
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
      <td>{totalWeight}</td>
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
    weight = convertFuelUnits(weight, units.fuelUnits, baseFuelUnit, units.fuelDensity);
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
    weight = convertFuelUnits(weight, units.fuelUnits, baseFuelUnit, units.fuelDensity);
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
      <td>{loadedWeight - consumedFuel}</td>
    </tr>
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
  const configIndex = aircraft.aircraftConfigs.findIndex(c => c.id === aircraft.operationConfigs[opsConfigIndex].config);
  const totalSeats = loading.passengers.reduce((sum, s) => sum + s.count, 0);

  const [emptyWeight, emptyArm] = calculateEmptyBalanceForConfig(aircraft, aircraft.operationConfigs[opsConfigIndex].config);
  const [opsWeight, opsArm] = calculateBalanceForOperationConfig(aircraft, selectedOpsConfig);
  const [takeoffWeight, takeoffArm] = calculateBalanceForTakeoff(aircraft, selectedOpsConfig, loading);
  const [landWeight, landArm] = calculateBalanceForLanding(aircraft, selectedOpsConfig, loading);

  function loadSeats(count: number): void {
    const tmp: loadingT = JSON.parse(JSON.stringify(loading));
    let remaining = count;
    tmp.passengers = [];
    const seats = getSortedByArm(aircraft.aircraftConfigs[configIndex].seats.map(seatId => aircraft.seats.find(s => s.id === seatId)).filter(s => s != undefined));
    for (const seat of seats) {
      if (remaining <= 0) break;

      const seatIndex = aircraft.operationConfigs[opsConfigIndex].seats.findIndex(s => s.id === seat.id);
      let opsUsedSeats = 0;
      if (seatIndex >= 0)
        opsUsedSeats = Math.ceil(aircraft.operationConfigs[opsConfigIndex].seats[seatIndex].weight / seat.maxWeight)

      const numToSet = Math.min(remaining, seat.seatCount - opsUsedSeats);
      remaining -= numToSet;
      tmp.passengers.push({ location: seat.id, avgWeight: seat.maxWeight, count: numToSet });
    }
    setLoading(tmp);
  }

  return (
    <>
      <div>
        <h2>{aircraft.operationConfigs[opsConfigIndex].name}</h2>
        <input
          type='number'
          min={0}
          max={aircraft.seats.reduce((sum, s) => sum + s.seatCount, 0)}
          value={totalSeats}
          onChange={(e) => loadSeats(Number(e.target.value))} />
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
        <Subregion name="Passengers">
          <table className="tableData">
            <colgroup>
              <col style={{ width: "9rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
            </colgroup>
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
        <Subregion name="Cargo">
          <table className="tableData">
            <colgroup>
              <col style={{ width: "9rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
            </colgroup>
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
        <Subregion name="Fuel">
          <table className="tableData">
            <colgroup>
              <col style={{ width: "9rem" }} />
              <col style={{ width: "3rem" }} />
              <col style={{ width: "3rem" }} />
            </colgroup>
            <thead>
              <tr>
                <th>Name</th>
                <th>Fuel Load ({units.fuelUnits})</th>
                <th>Consumed Fuel ({units.fuelUnits})</th>
                <th>Landing Fuel ({units.fuelUnits})</th>
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
