import './Equipment.css'
import { Subregion, Grouping } from './Layout'
import type { cargoAreaT, configT, equipmentT, seatT } from './Types'
import { getSortedByArm } from './utility';

interface equipmentRowProps {
  setConfig: (arg0: configT) => void,
  values: (seatT | cargoAreaT)[],
  index: number,
  equip: equipmentT,
  config: configT,
}

function EquipmentRow({ equip, values, index, config, setConfig }: equipmentRowProps) {
  const areaIndex = values.findIndex((s) => s.id === equip.area);

  function deleteEquipment(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.equipment.splice(index, 1);
    setConfig(tmp);
  }

  function setValue<K extends keyof equipmentT, V extends equipmentT[K]>(key: K, value: V): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.equipment[index][key] = value;
    setConfig(tmp);
  }

  function setCargoArea(value: string): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.equipment[index].area = value;
    const valueIndex = values.findIndex((s) => s.id === equip.area);
    if (valueIndex >= 0)
      tmp.equipment[index].arm = values[valueIndex].arm;
    setConfig(tmp);
  }

  return (
    <Grouping>
      <div className={"equipmentRow"}>
        <input
          defaultValue={equip.name}
          placeholder={"Name"}
          onChange={(e) => setValue('name', e.target.value)}/>
        <input
          type="number"
          defaultValue={equip.weight}
          placeholder={"Weight"}
          onChange={(e) => setValue('weight', Number(e.target.value))}
          min={0}/>
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
          onChange={(e) => setValue('arm', Number(e.target.value))}/>
        <button onClick={deleteEquipment}>X</button>
      </div>
    </Grouping>
  );
}

interface equipmentProps {
  config: configT,
  setConfig: (arg0: configT) => void
}

function Equipment({ config, setConfig }: equipmentProps) {
  // S or C are appended to the start of the area id in the equipment type to denote seat or cargoArea in selection value
  const values = getSortedByArm([...config.seats.map(s => {return {...s, id: "S" + s.id}}), ...config.cargoAreas.map(c => {return {...c, id: "C" + c.id}})])

  function addEquipment(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.equipment.push({
      id: crypto.randomUUID(),
      name: "",
      weight: 0,
      arm: 0,
      area: ""
    });
    setConfig(tmp);
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
      {[...config.equipment].map((data, i) => {
        return <EquipmentRow
          key={data.id}
          equip={data}
          values={values}
          index={i}
          config={config}
          setConfig={setConfig}/>
      })}
    </Subregion>
  );
}

export { Equipment }
