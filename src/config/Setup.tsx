import './Setup.css'
import { useEffect, useState, type ReactNode } from "react";
import { Subregion } from "../Layout";
import { weightUnits, lengthUnits, fuelUnits, type configProps, type configT, type nameProps, type weightUnitsT, type setupT, type lengthUnitsT, type fuelUnitsT } from "../Types";
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

function Units({ config, setConfig }: configProps): ReactNode {
  const [selectedDensity, setSelectedDensity] = useState(config.setup.fuelDensity ?? fuelTypes[0].density);
  function setValue<T extends keyof setupT, V extends setupT[T]>(name: T, value: V): void {
    const tmp: configT = JSON.parse(JSON.stringify(config));
    tmp.setup[name] = value;
    setConfig(tmp);
  }

  function setSelectedDensitySpecial(selection: number) {
    setSelectedDensity(selection);
    setValue('fuelDensity', fuelTypes[selection].density);
  }

  const fuelTypeElements = fuelTypes.map((t, i) => <option key={t.name} value={i}>{t.name} ({i < fuelTypes.length - 1 ? t.density : config.setup.fuelDensity})</option>)
  return (
    <Subregion>
      <h3>Units</h3>
      <div id='unitsSelect'>
        <label>Weight</label>
        <label>Length</label>
        <label>Fuel</label>
        <label>Fuel Density</label>
        <select value={config.setup.weightUnits} onChange={e => setValue('weightUnits', e.target.value as weightUnitsT)}>
          {weightUnitsElements}
        </select>
        <select value={config.setup.lengthUnits} onChange={e => setValue('lengthUnits', e.target.value as lengthUnitsT)}>
          {lengthUnitsElements}
        </select>
        <select value={config.setup.fuelUnits} onChange={e => setValue('fuelUnits', e.target.value as fuelUnitsT)}>
          {fuelUnitsElements}
        </select>
        <div id='fuelDensityHolder'>
          <select value={selectedDensity} onChange={(e) => setSelectedDensitySpecial(Number(e.target.value))} id="fuelDensity">
            {fuelTypeElements}
          </select>
          {selectedDensity === fuelTypes.length - 1 && <input id="fuelDensityInput" type="number" value={config.setup.fuelDensity} onChange={(e) => setValue('fuelDensity', Number(e.target.value))} />}
        </div>
      </div>
    </Subregion>
  )
}

function Setup({ config, setConfig }: configProps & nameProps): ReactNode {
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
      <Units config={config} setConfig={setConfig} />
    </>
  )
}

export default Setup;
