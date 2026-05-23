import { useContext } from "react";
import { Grouping, Subregion } from "../Layout";
import { type aircraftT, type seatT, type aircraftProps, baseLengthUnit, baseWeightUnit } from "../Types";
import { convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from "../UnitsContext";
import { roundNumber } from "../utility";

interface seatInputProps extends aircraftProps {
  seat: seatT,
  index: number
}

function SeatInput({ seat, index, aircraft, setAircraft }: seatInputProps) {
  const units = useContext(UnitContext);

  function setValue<T extends keyof seatT, V extends seatT[T]>(name: T, value: V): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.seats[index][name] = value;
    setAircraft(tmp);
  }

  function removeSeat(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.seats.splice(index, 1);
    setAircraft(tmp);
    // TODO: check if any configs use this seat id and remove it
  }

  return (
    <div className="seatInput">
      {index === 0 ? <p>{seat.name}</p> : <input name={"name" + index}
        placeholder="Name"
        value={seat.name ? seat.name : ""}
        onChange={e => setValue('name', e.target.value)} />
      }
      <input
        name={"arm" + index}
        placeholder={units.lengthUnits}
        type="number"
        value={seat.arm ? roundNumber(convertLengthUnit(seat.arm, baseLengthUnit, units.lengthUnits), unitPrecision) : ""}
        onChange={e => setValue('arm', convertLengthUnit(Number(e.target.value), units.lengthUnits, baseLengthUnit))} />
      <input
        name={"maxWeight" + index}
        placeholder={units.weightUnits}
        min={0}
        type="number"
        value={seat.maxWeight ? roundNumber(convertWeightUnit(seat.maxWeight, baseWeightUnit, units.weightUnits), unitPrecision) : ""}
        onChange={e => setValue('maxWeight', convertWeightUnit(Number(e.target.value), units.weightUnits, baseWeightUnit))} />
      <input
        name={"lateralDist" + index}
        placeholder={units.lengthUnits}
        type="number"
        value={seat.lateralDist ? roundNumber(convertLengthUnit(seat.lateralDist, baseLengthUnit, units.lengthUnits), unitPrecision) : ""}
        onChange={e => setValue('lateralDist', convertLengthUnit(Number(e.target.value), units.lengthUnits, baseLengthUnit))} />
      <input
        name={"seatCount" + index}
        placeholder="Count"
        min={1}
        type="number"
        value={seat.seatCount ? seat.seatCount : ""}
        onChange={e => setValue('seatCount', Number(e.target.value))} />
      {index !== 0 && <button onClick={() => removeSeat()}>X</button>}
    </div>
  );
}

function SeatConfig({ aircraft, setAircraft }: aircraftProps) {
  function addSeat(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.seats.push({
      id: crypto.randomUUID(),
      name: "New",
      arm: 0,
      seatCount: 1,
      maxWeight: 300,
      lateralDist: 0
    });
    setAircraft(tmp);
  }

  return (
    <Subregion>
      <div id="seatConfig">
        <h3>Seat Config</h3>
        <button onClick={addSeat}>Add Seat</button>
        <form id="seatsForm">
          {aircraft.seats.map((seat: seatT, index: number) => (
            <Grouping key={seat.id}>
              <SeatInput
                seat={seat}
                index={index}
                aircraft={aircraft}
                setAircraft={setAircraft} />
            </Grouping>
          ))}
        </form>
      </div>
    </Subregion>
  );
}

export { SeatConfig }
