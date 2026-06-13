import './Export.css'
import { useContext, useEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type ReactNode, type RefObject } from "react";
import { baseFuelUnit, baseLengthUnit, baseWeightUnit, DiagramModes, type aircraftT, type loadingT, type nameProps } from "../../Types";
import { calculateBalanceForLanding, calculateBalanceForOperationConfig, calculateBalanceForTakeoff, calculateBalanceForZeroFuel, calculateEmptyBalanceForConfig, calculateMAC, roundNumber } from '../../utility';
import { convertFuelUnits, convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from '../../UnitsContext';
import { createPortal } from 'react-dom';
import Graph from '../../Graph';
import Diagram from '../../Diagram';

interface templateComponentT {
  type: (keyof HTMLElementTagNameMap);
  action?: ("function" | "manual");
  content?: (string | templateComponentT | templateComponentT[]);
  style?: CSSProperties;
  className?: string;
  id?: string;
}

interface templateT {
  name?: string;
  size?: ("Letter" | "A4" | "Legal");
  style?: string;
  body: (templateComponentT[])
}

const styleToString = (style: object) => {
  return Object.entries(style).map(([key, value]) => {
    // Convert camelCase to kebab-case
    const cssKey = key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
    return `${cssKey}:${value}`;
  }).join(';');
};

interface exportProps {
  loading: loadingT;
  aircraft: aircraftT;
  selectedOpsConfig: string;
}

// Available
// graph
// diagram
//
// date
//
// aircraftType
// aircraftTailNumber
//
// emptyWeight
// emptyArm
// configWeight
// configArm
// opsWeight
// opsArm
// takeoffWeight
// takeoffArm
// landingWeight
// landingArm
// zeroFuelWeight
// zeroFuelArm
//
// numOfCrew
// crewWeight
// crewArm
// crewCargoWeight
// crewCargoArm
//
// numOfPassengers
// passengerWeight
// passengerArm
//
// cargoWeight
// cargoArm
//
// totalEquipmentWeight
// totalEquipmentArm
//
// totalFuel
// totalFuelWeight
// fuelBurn
// fuelBurnWeight
// landingFuel
// landingFuelWeight
//
// getMac(arm)
// roundNumber(number, precision)

export function Export({ loading, aircraft, selectedOpsConfig }: exportProps & nameProps): ReactNode {
  const units = useContext(UnitContext);
  const ref: RefObject<(null | HTMLIFrameElement)> = useRef(null);
  const [temp, setTemplate] = useState({} as templateT);
  const [iframeParts, setIframeParts] = useState(null as (null | { body: ReactNode, head: ReactNode }));

  const opsConfigIndex = aircraft.operationConfigs.findIndex(c => c.id === selectedOpsConfig);
  if (opsConfigIndex < 0) return (<></>);
  const configIndex = aircraft.aircraftConfigs.findIndex(c => c.id === aircraft.operationConfigs[opsConfigIndex].config);

  const saveIframe = () => {
    if (!ref.current || !ref.current.contentWindow) return;
    ref.current.contentWindow.focus();
    ref.current.contentWindow.print();
  };

  const graph = (<Graph aircraft={aircraft} loading={loading} selectedOpsConfig={selectedOpsConfig} selectedConfig={aircraft.operationConfigs[opsConfigIndex].config} />);
  const diagram = (
    <Diagram
      aircraft={aircraft}
      loading={loading}
      setLoading={(_) => { }}
      selectedOpsConfig={selectedOpsConfig}
      selectedConfig={aircraft.operationConfigs[opsConfigIndex].config}
      diagramMode={DiagramModes.Ops} />);

  const _date = new Date();
  const _formatter = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const date = _formatter.format(_date);

  const aircraftType = aircraft.config.type;
  const aircraftTailNumber = aircraft.config.tailNumber;

  const emptyWeight = roundNumber(convertWeightUnit(aircraft.config.emptyWeight, baseWeightUnit, units.weightUnits), unitPrecision);
  const emptyArm = roundNumber(convertLengthUnit(aircraft.config.emptyArm, baseLengthUnit, units.lengthUnits), unitPrecision);
  let [configWeight, configArm] = calculateEmptyBalanceForConfig(aircraft, aircraft.operationConfigs[opsConfigIndex].config)
  configWeight = roundNumber(convertWeightUnit(configWeight, baseWeightUnit, units.weightUnits), unitPrecision);
  configArm = roundNumber(convertLengthUnit(configArm, baseLengthUnit, units.lengthUnits), unitPrecision);
  let [opsWeight, opsArm] = calculateBalanceForOperationConfig(aircraft, selectedOpsConfig);
  opsWeight = roundNumber(convertWeightUnit(opsWeight, baseWeightUnit, units.weightUnits), unitPrecision);
  opsArm = roundNumber(convertLengthUnit(opsArm, baseLengthUnit, units.lengthUnits), unitPrecision);
  let [zeroFuelWeight, zeroFuelArm] = calculateBalanceForZeroFuel(aircraft, selectedOpsConfig, loading);
  zeroFuelWeight = roundNumber(convertWeightUnit(zeroFuelWeight, baseWeightUnit, units.weightUnits), unitPrecision);
  zeroFuelArm = roundNumber(convertLengthUnit(zeroFuelArm, baseLengthUnit, units.lengthUnits), unitPrecision);
  let [landingWeight, landingArm] = calculateBalanceForLanding(aircraft, selectedOpsConfig, loading);
  landingWeight = roundNumber(convertWeightUnit(landingWeight, baseWeightUnit, units.weightUnits), unitPrecision);
  landingArm = roundNumber(convertLengthUnit(landingArm, baseLengthUnit, units.lengthUnits), unitPrecision);
  let [takeoffWeight, takeoffArm] = calculateBalanceForTakeoff(aircraft, selectedOpsConfig, loading);
  takeoffWeight = roundNumber(convertWeightUnit(takeoffWeight, baseWeightUnit, units.weightUnits), unitPrecision);
  takeoffArm = roundNumber(convertLengthUnit(takeoffArm, baseLengthUnit, units.lengthUnits), unitPrecision);

  const numCrew = aircraft.operationConfigs[opsConfigIndex].seats.reduce((sum, p) => sum + Math.ceil(p.weight / 200), 0);

  const crewWeight = aircraft.operationConfigs[opsConfigIndex].seats.reduce((sum, p) => sum + p.weight, 0);
  const crewArm = crewWeight === 0 ? 0 : aircraft.operationConfigs[opsConfigIndex].seats.reduce((sum, p) => { const s = aircraft.seats.find(s => s.id === p.id); if (!s) return sum; return sum + (p.weight * s.arm) }, 0) / crewWeight;

  const crewCargoWeight = aircraft.operationConfigs[opsConfigIndex].cargoAreas.reduce((sum, c) => sum + c.weight, 0);
  const crewCargoArm = crewCargoWeight === 0 ? 0 : roundNumber(aircraft.operationConfigs[opsConfigIndex].cargoAreas.reduce((sum, c) => { const C = aircraft.cargoAreas.find(v => v.id === c.id); if (!C) return sum; return sum + (c.weight * C.arm) }, 0) / crewCargoWeight, 100);

  const numPassengers = loading.passengers.reduce((sum, p) => sum + p.count, 0);
  const passengerWeight = loading.passengers.reduce((sum, s) => sum + s.avgWeight * s.count, 0);
  const passengerArm = passengerWeight === 0 ? 0 : roundNumber(loading.passengers.reduce((sum, s) => { const S = aircraft.seats.find(v => v.id === s.location); if (!S) return sum; return sum + (s.avgWeight * s.count * S.arm) }, 0) / passengerWeight, 100);

  const cargoWeight = loading.cargo.reduce((sum, c) => sum + c.weight, 0);
  const cargoArm = cargoWeight === 0 ? 0 : roundNumber(loading.cargo.reduce((sum, c) => { const area = aircraft.cargoAreas.find(C => C.id === c.location); if (!area) return sum; return sum + (c.weight * area?.arm) }, 0) / cargoWeight, 100);

  const equipmentWeight = aircraft.aircraftConfigs[configIndex].equipment.reduce((sum, e) => { const equip = aircraft.equipment.find(E => E.id === e.id); if (!equip) return sum; return sum + e.count * equip.weight }, 0);
  const equipmentArm = equipmentWeight === 0 ? 0 : roundNumber(aircraft.aircraftConfigs[configIndex].equipment.reduce((sum, e) => { const equip = aircraft.equipment.find(E => E.id === e.id); if (!equip) return sum; return sum + e.count * equip.weight * equip.arm }, 0) / equipmentWeight, 100);

  const totalFuel = roundNumber(convertFuelUnits(loading.fuel.reduce((sum, f) => sum + f.loadedFuel, 0), baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision);
  const totalFuelWeight = roundNumber(convertFuelUnits(totalFuel, units.fuelUnits, units.weightUnits, units.fuelDensity), unitPrecision);
  const totalFuelArm = totalFuelWeight === 0 ? 0 : roundNumber(convertFuelUnits(loading.fuel.reduce((sum, f) => { const t = aircraft.fuelTanks.find(v => v.id === f.tank); if (!t) return sum; return sum + (t.arm * f.loadedFuel) }, 0), units.fuelUnits, units.weightUnits, units.fuelDensity) / totalFuelWeight, unitPrecision);
  const fuelBurn = roundNumber(convertFuelUnits(loading.fuel.reduce((sum, f) => sum + f.tripFuel, 0), baseFuelUnit, units.fuelUnits, units.fuelDensity), unitPrecision);
  const fuelBurnWeight = roundNumber(convertFuelUnits(fuelBurn, units.fuelUnits, units.weightUnits, units.fuelDensity), unitPrecision);
  const landingFuel = totalFuel - fuelBurn;
  const landingFuelWeight = roundNumber(convertFuelUnits(landingFuel, units.fuelUnits, units.weightUnits, units.fuelDensity), unitPrecision);
  const landingFuelArm = landingFuelWeight === 0 ? 0 : roundNumber(convertFuelUnits(loading.fuel.reduce((sum, f) => { const t = aircraft.fuelTanks.find(v => v.id === f.tank); if (!t) return sum; return sum + (t.arm * f.loadedFuel) }, 0), units.fuelUnits, units.weightUnits, units.fuelDensity) / landingFuelWeight, unitPrecision);

  const getMac = (arm: number) => roundNumber(calculateMAC(arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC), unitPrecision);

  function buildComponent(component: (templateComponentT | templateComponentT[])): ReactNode {
    if (Array.isArray(component)) {
      const ret: ReactNode[] = [];
      component.forEach(c => ret.push(buildComponent(c)));
      return <>{ret}</>;
    }

    let content: (string | ReactNode) = "";
    if (component.content) {
      if (component.action === "function")
        try {
          content = eval(component.content as string)();
        } catch (error) {
          content = "bad function"
        }
      else if (component.action === "manual") {
        const element = document.getElementById(component.content + "-manual-input") as HTMLInputElement;
        content = element ? element.value : "Missing Input";
      } else if (typeof component.content === "string")
        content = component.content;
      else // Array
        content = buildComponent(component.content);
    } else return <></>

    const id = component.id ? component.id : "";
    const className = component.className ? component.className : "";
    const style = component.style ? component.style : undefined;

    let ret = (<component.type className={className} id={id} style={style}>{content}</ component.type >)
    return ret;
  }

  function buildFromTemplate(template: templateT) {
    if (!template.body) return { body: <></>, head: <></> };
    // Handle main style and size
    const head = (
      <>
        <link rel="stylesheet" href="/src/index.css" />
        <link rel="stylesheet" href="/src/Graph.css" />
        <link rel="stylesheet" href="/src/Diagram.css" />
        <style>{template.style}</style>
      </>
    )

    // Recursive build components
    const body = buildComponent(template.body);

    return { body: body, head: head };
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
        setTemplate(JSON.parse(data));
      };
    };
    input.click();
  }

  function buildInputs(component: (templateComponentT | templateComponentT[])) {
    if (Array.isArray(component)) {
      component.forEach(c => buildInputs(c));
      return
    }

    if (Array.isArray(component?.content)) {
      component?.content.forEach(c => buildInputs(c));
      return
    }

    if (component?.action !== 'manual') return;
    const input = document.createElement("input");
    input.classList.add("manualInput");
    input.id = component.content + "-manual-input";
    input.placeholder = component.content as string;
    input.oninput = () => setIframeParts(buildFromTemplate(temp));
    const holder = document.getElementById("inputsHolder");
    holder?.appendChild(input);
  }

  useEffect(() => {
    const holder = document.getElementById("inputsHolder");
    while (holder?.firstChild) holder.firstChild.remove();
    buildInputs(temp.body)
    setIframeParts(buildFromTemplate(temp));
  }, [temp])

  return (
    <>
      <div id='inputsHolder'></div>
      <button
        id="openFile"
        onClick={() => openFile()}>OPEN</button>
      <button
        id="exportButton"
        onClick={() => saveIframe()}>TEST</button>
      <CustomIframe
        ref={ref}
        id="exportPreview"
        body={iframeParts && iframeParts.body}
        head={iframeParts && iframeParts.head}
      />
    </>
  );
}

interface customIframeProps extends ComponentPropsWithRef<"iframe"> {
  body: (ReactNode | ReactNode[]);
  head: (ReactNode | ReactNode[]);
}

function CustomIframe({ body, head, ...props }: customIframeProps) {
  const [contentRef, setContentRef] = useState(null as (HTMLIFrameElement | null));

  const headNode = contentRef?.contentWindow?.document?.head;
  const bodyNode = contentRef?.contentWindow?.document?.body;

  return (
    <iframe {...props} ref={setContentRef}>
      {headNode && createPortal(head, headNode)}
      {bodyNode && createPortal(body, bodyNode)}
    </iframe>
  )
}

// TODO: Now that css can be set for all elements and class and ids can be set.
// There should be complete control over building the output layout
// Is there a way to upload either JSON or HTML directly where the HTML can have
// the style directly? This would need a way to handle the dynamic content and
// manual input items. Is it possible to create an html file where the values are
// set by functions that are called internal to the frame that gets the data?
// Is it possible to use React to build the entire iFrame?
//
//
// Something like
// <div>
//  getData("takeoffWeight")
// </div>
