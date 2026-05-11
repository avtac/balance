import './Equipment.css'
import { Subregion, Grouping } from './Layout'

function EquipmentRow({ equip, index, config, setConfig }) {

  function deleteEquipment() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.equipment.splice(index, 1);
    setConfig(tmp);
  }

  function setValue(key, value) {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.equipment[index][key] = value;
    setConfig(tmp);
  }

  return (
    <Grouping>
      <div className={"equipmentRow"}>
        <input defaultValue={equip.name} placeholder={"Name"} onChange={(e) => setValue('name', e.target.value)}/>
        <input min={0} type="number" defaultValue={equip.weight} placeholder={"Weight"} onChange={(e) => setValue('weight', e.target.value)}/>
        <input type="number" defaultValue={equip.arm} placeholder={"Arm"} onChange={(e) => setValue('arm', e.target.value)}/>
        <button onClick={deleteEquipment}>X</button>
      </div>
    </Grouping>
  );
}


function Equipment({ config, setConfig }) {

  function addEquipment() {
    const tmp = JSON.parse(JSON.stringify(config));
    tmp.equipment.push({
      id: crypto.randomUUID(),
      name: "",
      weight: 0,
      defaultCount: 1,
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
      {config.equipment.map((equip, index) => {
        return <EquipmentRow key={equip.id} equip={equip} index={index} config={config} setConfig={setConfig}/>
      })}
    </Subregion>
  );
}

export { Equipment }
