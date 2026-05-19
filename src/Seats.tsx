import { Grouping, Subregion } from "./Layout";
import type { aircraftT, seatT, aircraftProps } from "./Types";

interface seatInputProps extends aircraftProps {
  seat: seatT,
  index: number
}

function SeatInput({ seat, index, aircraft, setAircraft }: seatInputProps) {

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
        placeholder="Arm"
        type="number"
        value={seat.arm ? seat.arm : ""}
        onChange={e => setValue('arm', Number(e.target.value))} />
      <input
        name={"maxWeight" + index}
        placeholder="Max Weight"
        min={0}
        type="number"
        value={seat.maxWeight ? seat.maxWeight : ""}
        onChange={e => setValue('maxWeight', Number(e.target.value))} />
      <input
        name={"lateralDist" + index}
        placeholder="Lateral Offset"
        type="number"
        value={seat.lateralDist ? seat.lateralDist : ""}
        onChange={e => setValue('lateralDist', Number(e.target.value))} />
      <input
        name={"seatCount" + index}
        placeholder="Seat Count"
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
