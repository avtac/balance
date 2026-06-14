import './Export.css'
import parse, { attributesToProps, domToReact, Element, type DOMNode, type HTMLReactParserOptions } from 'html-react-parser';
import { useContext, useEffect, useRef, useState, type ComponentPropsWithRef, type CSSProperties, type ReactNode, type RefObject, type JSX } from "react";
import { baseFuelUnit, baseLengthUnit, baseWeightUnit, DiagramModes, type aircraftT, type loadingT, type nameProps, type setupT } from "../../Types";
import { calculateBalanceForLanding, calculateBalanceForOperationConfig, calculateBalanceForTakeoff, calculateBalanceForZeroFuel, calculateEmptyBalanceForConfig, calculateMAC, roundNumber } from '../../utility';
import { convertFuelUnits, convertLengthUnit, convertWeightUnit, UnitContext, unitPrecision } from '../../UnitsContext';
import { createPortal } from 'react-dom';
import Graph from '../../Graph';
import Diagram from '../../Diagram';
import { Subregion } from '../../Layout';

interface templateComponentT {
  type: (keyof HTMLElementTagNameMap);
  action?: ("function" | "manual");
  content?: (string | templateComponentT | templateComponentT[]);
  style?: CSSProperties;
  className?: string;
  id?: string;
}

interface templateT {
  type: ("json" | "html");
  name?: string;
  size?: ("Letter" | "A4" | "Legal");
  style?: string;
  id?: string;
  body: (templateComponentT | templateComponentT[] | string)
}

function generateScopeData(aircraft: aircraftT, loading: loadingT, selectedOpsConfig: string, units: setupT) {
  const opsConfigIndex = aircraft.operationConfigs.findIndex(c => c.id === selectedOpsConfig);
  if (opsConfigIndex < 0) return (<></>);
  const configIndex = aircraft.aircraftConfigs.findIndex(c => c.id === aircraft.operationConfigs[opsConfigIndex].config);

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

  const globalData = {
    date: date,
    units: units,
    graph: graph,
    diagram: diagram,

    aircraftType: aircraftType,
    aircraftTailNumber: aircraftTailNumber,

    emptyWeight: emptyWeight,
    emptyArm: emptyArm,
    configWeight: configWeight,
    configArm: configArm,
    opsWeight: opsWeight,
    opsArm: opsArm,
    takeoffWeight: takeoffWeight,
    takeoffArm: takeoffArm,
    landingWeight: landingWeight,
    landingArm: landingArm,
    zeroFuelWeight: zeroFuelWeight,
    zeroFuelArm: zeroFuelArm,

    numCrew: numCrew,
    crewWeight: crewWeight,
    crewArm: crewArm,
    crewCargoWeight: crewCargoWeight,
    crewCargoArm: crewCargoArm,

    numPassengers: numPassengers,
    passengerWeight: passengerWeight,
    passengerArm: passengerArm,

    cargoWeight: cargoWeight,
    cargoArm: cargoArm,

    equipmentWeight: equipmentWeight,
    equipmentArm: equipmentArm,

    totalFuel: totalFuel,
    totalFuelWeight: totalFuelWeight,
    totalFuelArm: totalFuelArm,
    fuelBurn: fuelBurn,
    fuelBurnWeight: fuelBurnWeight,
    landingFuel: landingFuel,
    landingFuelWeight: landingFuelWeight,
    landingFuelArm: landingFuelArm,

    getMac: getMac,
    roundNumber: roundNumber,
  }

  return globalData;
}

interface Window {
  safeFunction?: (arg: object) => string;
}

interface exportProps {
  loading: loadingT;
  aircraft: aircraftT;
  selectedOpsConfig: string;
}

const protectedGlobals = [
  "document",
  "window",
  "navigator",
  "fetch",
  "print",

  "localStorage",
  "sessionStorage",
  "indexedDB",
  "caches",
  "cookieStore",

  "alert",
  "confirm",
  "prompt",

  "XMLHttpRequest",
  "eval",
  "setTimeout",
  "setInterval",
  "clearTimeout",
  "clearInterval",

  "Boolean",
  "String",
  "Number",
  "Object",
  "Array",
  "Text",
  "Blob"
]

const whitelistTags = [
  "body",
  "head",
  "abbr",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "br",
  "caption",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "dfn",
  "div",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hgroup",
  "hr",
  "html",
  "i",
  "label",
  "legend",
  "li",
  "main",
  "mark",
  "ol",
  "output",
  "p",
  "pre",
  "q",
  "s",
  "samp",
  "section",
  "small",
  "span",
  "strong",
  "style",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "time",
  "title",
  "tr",
  "u",
  "ul",
  "var"
]

export function Export({ loading, aircraft, selectedOpsConfig }: exportProps & nameProps): ReactNode {
  const units = useContext(UnitContext);
  const ref: RefObject<(null | HTMLIFrameElement)> = useRef(null);
  const globalData = useRef(generateScopeData(aircraft, loading, selectedOpsConfig, units));
  const active: string = localStorage.getItem("activeTemplate") ?? "";
  const [activeTemplate, setTemplate] = useState(active);
  const [iframeParts, setIframeParts] = useState(null as (null | { body: (string | JSX.Element | JSX.Element[]), head: (string | JSX.Element | JSX.Element[]) }));
  const [inputParts, setInputParts] = useState(null as (null | ReactNode[]));

  function setTemplateSpecial(tempId: string) {
    localStorage.setItem("activeTemplate", tempId);
    setTemplate(tempId);
  }

  function safeExecute(func: string) {
    const iframe = document.getElementById("exportPreview") as HTMLIFrameElement;
    if (!iframe) return;
    const frameDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!frameDoc) return;
    const script = document.createElement("script");
    script.type = 'text/javascript';
    script.text = `function safeFunction(global) {
            let ${protectedGlobals.join(", ")} = undefined;
            return (${func})();
          }`;
    frameDoc.body.appendChild(script);
    const iWindow = iframe.contentWindow as Window;
    let ret = "";
    if (iWindow && iWindow.safeFunction)
      ret = iWindow.safeFunction(globalData.current);
    script.remove();
    return ret;
  }

  function buildComponent(component: (templateComponentT | templateComponentT[])): JSX.Element {
    if (Array.isArray(component)) {
      const ret: ReactNode[] = [];
      component.forEach(c => ret.push(buildComponent(c)));
      return <>{ret}</>;
    }

    let content: (string | ReactNode) = "";
    if (component.content !== undefined) {
      if (component.action === "function")
        try {
          content = safeExecute(component.content as string);
        } catch (error) {
          console.log(error);
          content = "bad function"
        }
      else if (component.action === "manual") {
        const element = document.getElementById(component.content + "-manual-input") as HTMLInputElement;
        content = element ? element.value : "";
      } else if (typeof component.content === "string")
        content = component.content;
      else // Array
        content = buildComponent(component.content);
    } else return <></>

    const id = component.id ? component.id : "";
    const className = component.className ? component.className : "";
    const style = component.style ? component.style : undefined;

    if (!whitelistTags.includes(component.type)) return <p>Unsafe Tag</p>
    let ret = (<component.type key={crypto.randomUUID() + "-" + id + "-" + className + "-" + content} className={className} id={id} style={style}>{content}</ component.type >)
    return ret;
  }

  function buildFromTemplate(tempId: string) {
    const templates: templateT[] = JSON.parse(localStorage.getItem("savedTemplates") ?? "[]");
    const temp = templates.find(f => f.id === tempId);
    if (!temp || !temp.body) return { body: <></>, head: <></> };

    let head, body: (string | JSX.Element | JSX.Element[]);

    // Add general style to all templates
    const headBase = `
      <link rel="stylesheet" href="/src/index.css" />
      <link rel="stylesheet" href="/src/Graph.css" />
      <link rel="stylesheet" href="/src/Diagram.css" />
      <style>
        #graph .background {
          fill: none !important;
        }

        #diagram #aircraft {
          fill: none !important;
          stroke: black !important;
          stroke-width: .5% !important;
        }
      </style>`
    head = parse(headBase.replace(/>[\s]*</g, '><').trim());
    body = <></>;

    // JSON template
    if (typeof temp.body !== 'string' && !(temp.body instanceof String)) {
      // Handle main style and size
      const h = <style>{temp.style}</style>;
      if (Array.isArray(head) && !(typeof h === 'string'))
        head.push(h);

      // Recursive build components
      body = buildComponent(temp.body);

      // HTML Template
    } else if (typeof temp.body === 'string' || temp.body instanceof String) {
      const m = (temp.body as string).match(/<head>(?<head>.*)<\/head>.*<body>(?<body>.*)<\/body>/s);
      const tmpFrameParts: ReactNode[] = [];

      const options: HTMLReactParserOptions = {
        replace(domNode) {
          if (!(domNode instanceof Element) || !domNode.attribs) return;
          let content: (string | undefined) = ""
          if (domNode.attribs.function) {
            const func = domNode.attribs.function;
            if (func)
              try { content = safeExecute(func) } catch { content = "bad function" }
            delete domNode.attribs.function;
          }
          if (domNode.attribs.manual) {
            const key = domNode.attribs.manual + "-manual-input"
            tmpFrameParts.push(
              <div key={key + "-holder"}>
                <label style={{ paddingRight: "4px" }} htmlFor={key}>{domNode.attribs.manual as string}</label>
                <input
                  className="manualInput"
                  id={key}
                  placeholder={domNode.attribs.manual as string}
                  onInput={() => setIframeParts(buildFromTemplate(activeTemplate))} />
              </div>
            )

            delete domNode.attribs.manual;
            content = (content ?? "") + ((document.getElementById(key) as HTMLInputElement)?.value ?? "");
          }
          const props = attributesToProps((domNode.attribs));

          if (!whitelistTags.includes(domNode.name)) return <p>Unsafe Tag</p>
          return (
            <>
              <domNode.name {...props}>{domToReact(domNode.children as DOMNode[], options)} {content}</domNode.name>
            </>
          );
        }
      }

      setInputParts(tmpFrameParts);

      const h = parse(m?.groups?.head?.replace(/>[\s]*</g, '><').trim() ?? "", options);
      if (Array.isArray(head))
        if (Array.isArray(h))
          head.push(...h);
        else if (!(typeof h === 'string'))
          head.push(h);
      body = parse(m?.groups?.body?.replace(/>[\s]*</g, '><').trim() ?? "", options);
    }
    return { body: body, head: head };
  }

  function openFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = ".json, .html";
    input.onchange = function(event) {
      const target = event.target as HTMLInputElement;
      if (!target) return;
      const files = target.files;
      if (!files || files.length > 1) return;
      const fileReader = new FileReader();
      fileReader.readAsText(files[0]);
      fileReader.onload = () => {
        const data: string = fileReader.result as string;
        if (!data) return;
        let newTemplate: templateT = { body: data, type: "html" };
        try {
          newTemplate = JSON.parse(data) as templateT;
          newTemplate.type = "json";
        } catch {
          const t = (newTemplate.body as string).match(/<title>(?<name>.*)<\/title>/);
          newTemplate.name = t?.groups?.name ?? "";
        }

        newTemplate.id = crypto.randomUUID();
        setTemplateSpecial(newTemplate.id);
        const templates: templateT[] = JSON.parse(localStorage.getItem("savedTemplates") ?? "[]");
        const index = templates.findIndex(t => t.id === newTemplate.id);
        if (index < 0) templates.push(newTemplate);
        else templates[index] = newTemplate;
        localStorage.setItem("savedTemplates", JSON.stringify(templates));
      };
    };
    input.click();
  }

  function buildInputs(component: (templateComponentT | templateComponentT[])): ReactNode[] {
    if (Array.isArray(component)) {
      let tmp: ReactNode[] = []
      component.forEach(c => tmp = [...tmp, ...buildInputs(c)]);
      return tmp
    } else if (Array.isArray(component?.content)) {
      let tmp: ReactNode[] = []
      component.content.forEach(c => tmp = [...tmp, ...buildInputs(c)]);
      return tmp
    } else if (component?.action !== 'manual') return [];

    return [
      <div key={component.content + "-manual-input-holder"}>
        <label style={{ paddingRight: "4px" }} htmlFor={component.content + "-manual-input"}>{component.content as string}</label>
        <input className="manualInput" id={component.content + "-manual-input"} placeholder={component.content as string} onInput={() => setIframeParts(buildFromTemplate(activeTemplate))} />
      </div>
    ]
  }

  useEffect(() => {
    const templates: templateT[] = JSON.parse(localStorage.getItem("savedTemplates") ?? "[]");
    const temp = templates.find(f => f.id === activeTemplate);
    if (!temp) return;
    globalData.current = generateScopeData(aircraft, loading, selectedOpsConfig, units);
    if (temp.type === "json" && typeof temp.body !== 'string')
      setInputParts(buildInputs(temp.body)); // Inputs are build for HTML elsewhere
    setIframeParts(buildFromTemplate(activeTemplate));
  }, [activeTemplate, loading]);

  const templates: templateT[] = JSON.parse(localStorage.getItem("savedTemplates") ?? "[]");
  const options = templates.sort((a, b) => a.name?.localeCompare(b.name ?? "") ?? -1).map(t => <option key={t.id} value={t.id}>{t.name}</option>)

  return (
    <>
      <Subregion id='exportButtonHolder'>
        <select
          id="templateSelect"
          value={activeTemplate}
          onChange={(e) => {
            setTemplateSpecial(e.target.value);
          }}>{options}</select>
        <button
          id="openFile"
          onClick={() => openFile()}>Upload Template</button>
        <button
          id="deleteButton"
          onClick={() => {
            const templates: templateT[] = JSON.parse(localStorage.getItem("savedTemplates") ?? "[]");
            const index = templates.findIndex(t => t.id === activeTemplate);
            if (index >= 0) {
              templates.splice(index, 1);
              setTemplateSpecial(templates.length > 0 ? (templates[0].id ?? "") : "");
              localStorage.setItem("savedTemplates", JSON.stringify(templates));
            }
          }}>Delete Template</button>
      </Subregion>

      {inputParts && inputParts.length > 0 && <Subregion id='inputsHolder'>{inputParts}</Subregion>}

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

  const saveIframe = () => {
    if (!contentRef || !contentRef.contentWindow) return;
    contentRef.contentWindow.focus();
    contentRef.contentWindow.print();
  };

  function fitToContainer() {
    const parent = document.getElementById("iframeHolder");
    const container = document.getElementById("scaleHolder");
    const content = document.getElementById("exportPreview");
    if (!parent || !container || !content) return;

    const containerWidth = container.clientWidth;
    const contentWidth = content.clientWidth;

    // Calculate scale factor based on height
    const scale = Math.min(containerWidth / contentWidth, 1);

    // Apply transform to fit height
    content.style.transform = scale === 1 ? "" : `scale(${scale})`;
    content.style.transformOrigin = scale === 1 ? "" : 'top left';

    const size = content.getBoundingClientRect();
    container.style.height = size.height + "px";
  }

  useEffect(() => {
    window.addEventListener("resize", fitToContainer);
    fitToContainer();
  }, [])

  return (
    <>
      <Subregion id="iframeButton">
        <button
          id="exportButton"
          onClick={() => saveIframe()}>Save</button>
      </Subregion>
      <Subregion id="iframeHolder">
        <div id="scaleHolder">
          <iframe sandbox='allow-scripts allow-same-origin allow-modals' {...props} ref={setContentRef}>
            {headNode && createPortal(head, headNode)}
            {bodyNode && createPortal(body, bodyNode)}
          </iframe>
        </div>
      </Subregion>
    </>
  )
}

