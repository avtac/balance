import type { ReactNode } from "react";
import "./Diagram.css"
import { DiagramModes, type seatT, type cargoAreaT, type aircraftConfigT, type operationConfigT, type aircraftT, type loadingT } from "./Types";

// This is the assumed length of a seat (in arm units) where the arm is expected to be
// at the center of the seat
const seatSize = 21;
const cargoSize = seatSize;
const fontSize = 4;

interface cargoIconProps {
  name: string,
  offX: number,
  offY: number,
  width: number
  opsPercent?: number,
  loadedPercent?: number,
}

function CargoIcon({ name, offX = 0, offY = 0, width = cargoSize, opsPercent = 0, loadedPercent = 0 }: cargoIconProps): ReactNode {
  const left = offX - cargoSize / 2;
  const top = -offY - width / 2;
  return (
    <>
      <rect
        className="loadingFill"
        strokeWidth={0}
        width={cargoSize}
        height={width * loadedPercent}
        x={left}
        y={top + width * (1 - opsPercent - loadedPercent)}
        ry={.4105551} />
      <rect
        className="cargoOpsFill"
        strokeWidth={0}
        width={cargoSize}
        height={width * opsPercent}
        x={left}
        y={top + width * (1 - opsPercent)}
        ry={.4105551} />
      <rect
        className="cargo"
        stroke={"black"}
        strokeWidth={0.5}
        width={cargoSize}
        height={width}
        x={left}
        y={top}
        ry={.4105551} />
      <text
        x={offX}
        y={-offY}
        transform={`rotate(${90} ${offX} ${-offY})`}
        alignmentBaseline={'middle'}
        textAnchor="middle"
        fontSize={fontSize}>
        {name}
      </text>
    </>
  );
}

interface seatIconProps {
  name: string,
  offX: number,
  offY: number,
  count: number,
  opsCount?: number,
  loadedCount?: number,
}

// offX, offY are in canvas units
function SeatIcon({ count, name, offX = 0, offY = 0, opsCount = 0, loadedCount = 0 }: seatIconProps): ReactNode {
  const left = offX - seatSize / 2;
  return (
    <>
      {...Array(count).fill(0).map((_, i: number) => {
        const top = offY - (i - count / 2) * seatSize;
        const index = count - 1 - i;
        const opsFilled = opsCount > index;
        const loadFilled = loadedCount + opsCount > index;
        const fillClass = opsFilled ? " opsFilled" : (loadFilled ? " loadFilled" : "");
        return (
          <>
            <rect
              className={"seat" + fillClass}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize}
              height={seatSize}
              x={left}
              y={-top}
              ry={2} />
            <rect
              className={"seat" + fillClass}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize / 3}
              height={seatSize / 8}
              x={seatSize * 1 / 3 + left}
              y={-seatSize + top}
              ry={0.29849526}
              transform={"scale(1,-1)"} />
            <rect
              className={"seat" + fillClass}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize / 3}
              height={seatSize / 8}
              x={seatSize * 1 / 3 + left}
              y={-seatSize / 8 + top}
              ry={0.29849526}
              transform={"scale(1,-1)"} />
            <rect
              className={"seat" + fillClass}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize * 3 / 8}
              height={seatSize}
              x={left}
              y={-seatSize + top}
              ry={2}
              transform={"scale(1,-1)"} />
          </>
        )
      })}
      <text
        x={+left + seatSize / 2}
        y={-offY - (offY >= 0 ? 1 : -1) * (count / 2 + .2) * seatSize}
        alignmentBaseline={'middle'}
        textAnchor="middle"
        fontSize={fontSize}>
        {name}
      </text>
    </>
  );
}

function getPixelFromArm(arm: number): number {
  const pixPerUnit = seatSize / seatSize;
  return arm * pixPerUnit;
}

interface diagramProps {
  aircraft: aircraftT;
  loading?: loadingT;
  diagramMode: DiagramModes;
  selectedConfig: string;
  selectedOpsConfig: string;
}

function Diagram({ aircraft, loading, diagramMode, selectedConfig, selectedOpsConfig }: diagramProps): ReactNode {
  if (!aircraft) return (<></>);
  let seats = [...aircraft.seats]
  let cargoAreas = [...aircraft.cargoAreas]

  if (diagramMode === DiagramModes.Config || diagramMode === DiagramModes.Ops) {
    const configIndex: number = aircraft.aircraftConfigs.findIndex((c: aircraftConfigT) => c.id === selectedConfig);
    if (configIndex < 0) return;

    seats = aircraft.aircraftConfigs[configIndex].seats.map((seatId: string) => {
      const seatIndex: number = aircraft.seats.findIndex((s: seatT) => s.id === seatId);
      return aircraft.seats[seatIndex];
    }).filter(v => v != undefined);

    cargoAreas = aircraft.aircraftConfigs[configIndex].cargoAreas.map((cargoAreaId: string) => {
      const cargoAreaIndex: number = aircraft.cargoAreas.findIndex((s: cargoAreaT) => s.id === cargoAreaId);
      return aircraft.cargoAreas[cargoAreaIndex];
    }).filter(v => v != undefined);
  }

  // TODO: Find a way to not need this so no seats can exist
  if (seats.length === 0) return;

  const planePadding = 6;
  let minArm = -seats.reduce((min, item) => Math.min(min, item.arm), seats[0].arm) + planePadding + seatSize / 2;
  let maxArm = -seats.reduce((max, item) => Math.max(max, item.arm), seats[0].arm) - planePadding - seatSize / 2;

  if (cargoAreas.length !== 0) {
    minArm = Math.max(minArm, -cargoAreas.reduce((min, item) => Math.min(min, item.arm), cargoAreas[0].arm) + planePadding + cargoSize / 2);
    maxArm = Math.min(maxArm, -cargoAreas.reduce((max, item) => Math.max(max, item.arm), cargoAreas[0].arm) - planePadding - cargoSize / 2);
  }

  let minDisplacement = seats.reduce((min, item) => Math.min(min, item.lateralDist - item.seatCount * seatSize / 2), seats[0].lateralDist - seats[0].seatCount * seatSize / 2) - planePadding;
  let maxDisplacement = seats.reduce((max, item) => Math.max(max, item.lateralDist + item.seatCount * seatSize / 2), seats[0].lateralDist + seats[0].seatCount * seatSize / 2) + planePadding;

  const canvasPadding = 4;
  const planeTop = minDisplacement;
  const top = planeTop - canvasPadding;
  const planeBottom = maxDisplacement;
  const bottom = planeBottom + canvasPadding;
  const height = bottom - top;
  const planeHeight = planeBottom - planeTop;
  const planeLeft = minArm;
  const left = planeLeft + canvasPadding + planeHeight / 3;
  const planeRight = maxArm;
  const right = planeRight - canvasPadding;
  const width = left - right;
  const planeWidth = planeLeft - planeRight;


  const opsIndex: number = aircraft.operationConfigs.findIndex((o: operationConfigT) => selectedOpsConfig == o.id);
  const seatItems = seats.map((seat: seatT): ReactNode => {
    const seatIndex = opsIndex < 0 ? -1 : aircraft.operationConfigs[opsIndex].seats.findIndex(
      (v: { id: string, weight: number }) => v.id == seat.id
    )

    const isOps = diagramMode === DiagramModes.Ops && opsIndex >= 0
      && selectedOpsConfig != undefined
      && seatIndex >= 0;

    const opsUsed = isOps ? Math.ceil(aircraft.operationConfigs[opsIndex].seats[seatIndex].weight / seat.maxWeight) : 0;
    let loadedPax = 0;
    if (loading) {
      const pax = loading.passengers.find(s => s.location === seat.id);
      loadedPax = pax ? pax.count : 0;
    }
    return <SeatIcon
      key={seat.id}
      name={seat.name}
      opsCount={opsUsed}
      loadedCount={loadedPax}
      offX={-getPixelFromArm(seat.arm)}
      offY={getPixelFromArm(-seat.lateralDist)}
      count={Number(seat.seatCount)} />
  });

  const cargoItems = cargoAreas.map((cargoArea: cargoAreaT): ReactNode => {
    const cargoIndex = opsIndex < 0 ? -1 : aircraft.operationConfigs[opsIndex].cargoAreas.findIndex(
      (v: { id: string, weight: number }) => v.id == cargoArea.id
    )
    const isOps = diagramMode === DiagramModes.Ops && opsIndex >= 0
      && selectedOpsConfig != undefined
      && cargoIndex >= 0;
    const opsPercentUsed = isOps ? aircraft.operationConfigs[opsIndex].cargoAreas[cargoIndex].weight / cargoArea.maxWeight : 0;
    let loadedPercent = 0;
    if (loading) {
      const load = loading.cargo.find(c => c.location === cargoArea.id)
      loadedPercent = load ? load.weight / cargoArea.maxWeight : 0;
    }
    return <CargoIcon
      key={cargoArea.id}
      name={cargoArea.name}
      opsPercent={opsPercentUsed}
      loadedPercent={loadedPercent}
      offX={-getPixelFromArm(cargoArea.arm)}
      offY={-planeTop - planeHeight / 2}
      width={planeHeight - planePadding * 2} />
  });

  return (
    <svg
      viewBox={`${right} ${top} ${width} ${height}`}
      id="diagram">
      <path className="aircraft" d={`M ${planeLeft} ${planeTop} C ${planeLeft + planeHeight / 2} ${planeHeight / 2 + planeTop}, ${planeLeft + planeHeight / 2} ${planeHeight / 2 + planeTop} ${planeLeft} ${planeBottom}`} fill={'white'} stroke={'none'} />
      <rect className="aircraft" x={planeRight} y={planeTop} width={planeWidth} height={planeHeight} fill={'white'} stroke={'none'} />
      {seatItems}
      {cargoItems}
    </svg>
  );
}

export default Diagram;
