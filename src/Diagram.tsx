import type { ReactNode } from "react";
import "./Diagram.css"
import type { seatT, cargoAreaT, aircraftConfigT, operationConfigT, aircraftT } from "./Types";

// This is the assumed length of a seat (in arm units) where the arm is expected to be
// at the center of the seat
const seatSize = 14;
const cargoSize = 14;
const fontSize = 4;

interface cargoIconProps {
  name: string,
  color: string,
  offX: number,
  offY: number,
  width: number
}

function CargoIcon({ name, color = '#CCCCCC', offX = 0, offY = 0, width = cargoSize }: cargoIconProps): ReactNode {
  const left = offX - cargoSize / 2;
  const top = -offY - width / 2;
  return (
    <>
      <rect
        fill={color + "CC"}
        stroke={"#000000"}
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
        fontSize={fontSize} fill={'blue'}>
        {name}
      </text>
    </>
  );
}

interface seatIconProps {
  name: string,
  color: string,
  offX: number,
  offY: number,
  count: number
}

// offX, offY are in canvas units
function SeatIcon({ count, name, color = '#CCCCCC', offX = 0, offY = 0 }: seatIconProps): ReactNode {
  const left = offX - seatSize / 2;
  return (
    <>
      {...Array(count).fill(0).map((_, i: number) => {
        const top = offY - (i - count / 2) * seatSize;
        return (
          <>
            <rect
              fill={color}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize}
              height={seatSize}
              x={left}
              y={-top}
              ry={.4105551} />
            <rect
              fill={color}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize / 2}
              height={seatSize / 8}
              x={seatSize * 1 / 6 + left}
              y={-seatSize + top}
              ry={0.29849526}
              transform={"scale(1,-1)"} />
            <rect
              fill={color}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize / 2}
              height={seatSize / 8}
              x={seatSize * 1 / 6 + left}
              y={-seatSize / 8 + top}
              ry={0.29849526}
              transform={"scale(1,-1)"} />
            <rect
              fill={color}
              stroke={"#000000"}
              strokeWidth={0.5}
              width={seatSize * 3 / 8}
              height={seatSize}
              x={left}
              y={-seatSize + top}
              ry={2.3889797}
              transform={"scale(1,-1)"} />
          </>
        )
      })}
      <text x={+left + seatSize / 2} y={-offY - (offY >= 0 ? 1 : -1) * (count / 2 + .2) * seatSize} alignmentBaseline={'middle'} textAnchor="middle" fontSize={fontSize} fill={'blue'}>{name}</text>
    </>
  );
}

function getPixelFromArm(arm: number): number {
  const pixPerUnit = seatSize / seatSize;
  return arm * pixPerUnit;
}

interface diagramProps {
  aircraft: aircraftT,
  selectedPanel: number,
  selectedConfig: string,
  selectedOpsConfig: string,
}

function Diagram({ aircraft, selectedPanel, selectedConfig, selectedOpsConfig }: diagramProps): ReactNode {
  let seats = [...aircraft.seats]
  let cargoAreas = [...aircraft.cargoAreas]

  if (selectedPanel >= 3) {
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
    const isOps = selectedPanel >= 4 && opsIndex >= 0
      && selectedOpsConfig != undefined
      && aircraft.operationConfigs[opsIndex].seats.find(
        (v: { id: string, weight: number }) => v.id == seat.id
      )
    return <SeatIcon
      key={seat.id}
      name={seat.name}
      color={isOps ? "#6688AA" : "#D6D7E3"}
      offX={-getPixelFromArm(seat.arm)}
      offY={getPixelFromArm(-seat.lateralDist)}
      count={Number(seat.seatCount)} />
  });

  const cargoItems = cargoAreas.map((cargoArea: cargoAreaT): ReactNode => {
    const isOps = selectedPanel >= 4 && opsIndex >= 0
      && selectedOpsConfig != undefined
      && aircraft.operationConfigs[opsIndex].cargoAreas.find(
        (v: { id: string, weight: number }) => v.id == cargoArea.id
      )
    return <CargoIcon
      key={cargoArea.id}
      name={cargoArea.name}
      color={isOps ? "#6688AA" : "#D6D7E3"}
      offX={-getPixelFromArm(cargoArea.arm)}
      offY={-planeTop - planeHeight / 2}
      width={planeHeight - planePadding * 2} />
  });

  return (
    <svg
      viewBox={`${right} ${top} ${width} ${height}`}
      id="diagram">
      <path d={`M ${planeLeft} ${planeTop} C ${planeLeft + planeHeight / 2} ${planeHeight / 2 + planeTop}, ${planeLeft + planeHeight / 2} ${planeHeight / 2 + planeTop} ${planeLeft} ${planeBottom}`} fill={'white'} stroke={'none'} />
      <rect x={planeRight} y={planeTop} width={planeWidth} height={planeHeight} fill={'white'} stroke={'none'} />
      {seatItems}
      {cargoItems}
    </svg>
  );
}

export default Diagram;
