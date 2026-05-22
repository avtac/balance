import './Setup.css'
import { useEffect, useState } from "react";
import { Subregion } from "../Layout";
import { weightUnits, lengthUnits, fuelUnits, type configProps, type configT, type nameProps } from "../Types";
import { saveStringToFile } from "../utility";
import { getNewConfig } from "../ConfigBuilder";

const weightUnitsElements = weightUnits.map((u) => <option key={u} value={u}>{u}</option>)
const lengthUnitsElements = lengthUnits.map((u) => <option key={u} value={u}>{u}</option>)
const fuelUnitsElements = fuelUnits.map((u) => <option key={u} value={u}>{u}</option>)

// These are saved in the lbs/gal and then converted to appropriate units
const fuelTypes: { name: string, density: number }[] = [
  { name: '100LL', density: 6 },
  { name: 'Jet A', density: 6.6 },
  { name: 'JP-8', density: 6.5 },
  { name: 'Other', density: 0 },
] as const

function Setup({ config, setConfig }: configProps & nameProps) {
  const [density, setDensity] = useState(0);
  const foundConfigs: { id: string, name: string }[] = []
  const [availableConfigList, setAvailableConfigList] = useState(foundConfigs);

  useEffect(() => {
    saveFile();
  }, [config])

  function setName(name: string): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.name = name;
    setConfig(tmp);
  }

  interface savedConfigs {
    [key: string]: configT;
  }

  function newFile(): void {
    const newConfig = getNewConfig();
    setConfig(newConfig);
    setAvailableConfigList([...availableConfigList, { id: newConfig.id, name: newConfig.name }])
  }

  function saveFile(): void {
    const dataString = localStorage.getItem("config");
    if (!dataString) return;
    const data: configT = JSON.parse(dataString);

    // Get list of saved configs
    let configString = localStorage.getItem("savedConfigs");
    if (!configString) {
      configString = "{}"
    }
    let configs: savedConfigs = JSON.parse(configString);
    configs[data.id] = data;

    localStorage.setItem("savedConfigs", JSON.stringify(configs));

    const savedConfigsString = localStorage.getItem("savedConfigs");
    if (savedConfigsString) {
      const savedConfigs: { [key: string]: configT } = JSON.parse(savedConfigsString)
      const foundConfigs: { id: string, name: string }[] = Object.entries(savedConfigs).map(([id, config]) => ({ id: id, name: config.name }));
      const activeIndex = foundConfigs.findIndex((v) => v.id === config.id);
      foundConfigs[activeIndex] = { id: data.id, name: data.name };
      setAvailableConfigList(foundConfigs);
    }
  }

  function deleteConfig() {
    // Get Configs
    const savedConfigsString = localStorage.getItem("savedConfigs");
    if (!savedConfigsString) return;
    const savedConfigs: { [key: string]: configT } = JSON.parse(savedConfigsString)
    // Does it include the one to delete
    if (!Object.keys(savedConfigs).includes(config.id)) return;
    // Delete
    delete savedConfigs[config.id];
    localStorage.setItem("savedConfigs", JSON.stringify(savedConfigs));
    // Set config to a different config
    if (Object.keys(savedConfigs).length > 0) {
      const foundConfigs: { id: string, name: string }[] = Object.entries(savedConfigs).map(([id, config]) => ({ id: id, name: config.name }));
      setAvailableConfigList(foundConfigs);
      selectConfig(Object.keys(savedConfigs)[0]);
    } else {
      setAvailableConfigList([]);
      setConfig(getNewConfig());
    }
  }

  function downloadFile() {
    const dataString = localStorage.getItem("config");
    if (!dataString) return;
    saveStringToFile(dataString, "Config.json")
  }

  function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".json";
    input.onchange = function(event) {
      const target = event.target as HTMLInputElement;
      if (!target) return;
      const files = target.files;
      if (!files) return;
      if (files.length > 1) return;
      const fileReader = new FileReader();
      fileReader.readAsText(files[0]);
      fileReader.onload = () => {
        const data: string = fileReader.result as string;
        if (!data) return;
        setConfig(JSON.parse(data));
        localStorage.setItem('config', data)
      };
    };
    input.click();
  }

  function selectConfig(configId: string): void {
    const savedConfigsString = localStorage.getItem("savedConfigs");
    if (!savedConfigsString) return;
    const savedConfigs = JSON.parse(savedConfigsString)

    const selectedConfig: (configT | undefined) = savedConfigs[configId];
    if (!selectedConfig) return;
    localStorage.setItem("config", JSON.stringify(selectedConfig));
    setConfig(selectedConfig)
  }

  let availableConfigs = availableConfigList.sort((a, b) => a.name.localeCompare(b.name)).map((v) => <option value={v.id} key={v.id}>{v.name}</option>)
  const fuelTypeElements = fuelTypes.map((t) => <option key={t.name} value={t.density}>{t.name} ({t.density})</option>)
  return (
    <>
      <Subregion id="configSelectRow">
        <div>
          <label>Active Config File</label>
          <select id="configFileSelect" value={config.id} onChange={e => selectConfig(e.target.value)}>
            {availableConfigs}
          </select>
        </div>
        <div id="buttons">
          <button onClick={newFile}>New Config</button>
          <button onClick={deleteConfig}>Delete Config</button>
          <button onClick={openFile}>Upload Config</button>
          <button onClick={downloadFile}>Download Config</button>
        </div>
      </Subregion>
      <Subregion>
        <h3>Name</h3>
        <input value={config.name} onChange={(e) => setName(e.target.value)} />
      </Subregion>
      <Subregion>
        <h3>Units</h3>
        <label>Weight</label>
        <select>
          {weightUnitsElements}
        </select>
        <label>Length</label>
        <select>
          {lengthUnitsElements}
        </select>
        <label>Fuel</label>
        <select>
          {fuelUnitsElements}
        </select>
        <label>Fuel Density</label>
        <select value={density} onChange={(e) => setDensity(Number(e.target.value))} id="fuelDensity">
          {fuelTypeElements}
        </select>
        {density == 0 && <input id="fuelDensityInput" type="number" defaultValue={density} />}
      </Subregion>
    </>
  )
}

export default Setup;
