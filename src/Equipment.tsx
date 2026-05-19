import './Equipment.css'
import { Subregion, Grouping } from './Layout'
import type { cargoAreaT, aircraftT, equipmentT, seatT } from './Types'
import { getSortedByArm } from './utility';

interface equipmentRowProps {
  setAircraft: (arg0: aircraftT) => void,
  values: (seatT | cargoAreaT)[],
  index: number,
  equip: equipmentT,
  aircraft: aircraftT,
}

function EquipmentRow({ equip, values, index, aircraft, setAircraft }: equipmentRowProps) {
  const areaIndex = values.findIndex((s) => s.id === equip.area);

  function deleteEquipment(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.equipment.splice(index, 1);
    setAircraft(tmp);
  }

  function setValue<K extends keyof equipmentT, V extends equipmentT[K]>(key: K, value: V): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.equipment[index][key] = value;
    setAircraft(tmp);
  }

  function setCargoArea(value: string): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.equipment[index].area = value;
    const valueIndex = values.findIndex((s) => s.id === equip.area);
    if (valueIndex >= 0)
      tmp.equipment[index].arm = values[valueIndex].arm;
    setAircraft(tmp);
  }

  return (
    <Grouping>
      <div className={"equipmentRow"}>
        <input
          defaultValue={equip.name}
          placeholder={"Name"}
          onChange={(e) => setValue('name', e.target.value)} />
        <input
          type="number"
          defaultValue={equip.weight}
          placeholder={"Weight"}
          onChange={(e) => setValue('weight', Number(e.target.value))}
          min={0} />
        <select
          value={equip.area}
          onChange={(e) => setCargoArea(e.target.value)}>
          <option value={""}>Manual</option>
          {values.map((area) => {
            return <option key={area.id} value={area.id}>{area.name}</option>
          })}
        </select>
        <input
          type="number"
          value={areaIndex < 0 ? equip.arm : values[areaIndex].arm}
          disabled={areaIndex >= 0}
          placeholder={"Arm"}
          onChange={(e) => setValue('arm', Number(e.target.value))} />
        <button onClick={deleteEquipment}>X</button>
      </div>
    </Grouping>
  );
}

interface equipmentProps {
  aircraft: aircraftT,
  setAircraft: (arg0: aircraftT) => void
}

function Equipment({ aircraft, setAircraft }: equipmentProps) {
  // S or C are appended to the start of the area id in the equipment type to denote seat or cargoArea in selection value
  const values = getSortedByArm([...aircraft.seats.map(s => { return { ...s, id: "S" + s.id } }), ...aircraft.cargoAreas.map(c => { return { ...c, id: "C" + c.id } })])

  function addEquipment(): void {
    const tmp: aircraftT = JSON.parse(JSON.stringify(aircraft));
    tmp.equipment.push({
      id: crypto.randomUUID(),
      name: "",
      weight: 0,
      arm: 0,
      area: ""
    });
    setAircraft(tmp);
  }

  return (
    <Subregion>
      <button onClick={addEquipment}>Add Equipment</button>
      <div className="title">
        <h3>Name</h3>
        <h3>Weight</h3>
        <h3>Cargo Area</h3>
        <h3>Arm</h3>
      </div>
      {[...aircraft.equipment].map((data, i) => {
        return <EquipmentRow
          key={data.id}
          equip={data}
          values={values}
          index={i}
          aircraft={aircraft}
          setAircraft={setAircraft} />
      })}
    </Subregion>
  );
}

export { Equipment }
