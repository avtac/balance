import './Equipment.css'
import { Subregion, Grouping } from './Layout'
import type { configT, equipmentT } from './Types'

interface equipmentRowProps {
  setConfig: (arg0: configT) => void,
  index: number,
  equip: equipmentT,
  config: configT,
}

function EquipmentRow({ equip, index, config, setConfig }: equipmentRowProps) {

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
        <input
          type="number"
          defaultValue={equip.arm}
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

  function addEquipment(): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.equipment.push({
      id: crypto.randomUUID(),
      name: "",
      weight: 0,
      arm: 0
    });
    setConfig(tmp);
  }

  return (
    <Subregion>
      <button onClick={addEquipment}>Add Equipment</button>
      <div className="title">
        <h3>Name</h3>
        <h3>Weight</h3>
        <h3>Arm</h3>
      </div>
      {config.equipment.map((data, i) => {
        return <EquipmentRow
          key={data.id}
          equip={data}
          index={i}
          config={config}
          setConfig={setConfig}/>
      })}
    </Subregion>
  );
}

export { Equipment }
