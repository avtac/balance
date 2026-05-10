import "./Diagram.css"
import type { seatT, cargoAreaT } from "./Types";

// This is the assumed length of a seat (in arm units) where the arm is expected to be
// at the center of the seat
const seatSize = 14;
const cargoSize = 14;

function CargoIcon({name, offX=0, offY=0, width=cargoSize}) {
  const left = offX - cargoSize / 2;
  const top = -offY - width / 2;
  return (
    <>
      <rect
        fill={"#9793"}
        stroke={"#000000"}
        strokeWidth={0.5}
        width={cargoSize}
        height={width}
        x={left}
        y={top}
        ry={.4105551} />
      <text x={offX} y={-offY} transform={`rotate(${90} ${offX} ${-offY})`}alignmentBaseline={'middle'} textAnchor="middle" fontSize={4} fill={'blue'}>{name}</text>
   </>
  );
}

// offX, offY are in pixel units
function SeatIcon({count, name, offX=0, offY=0}) {
  const left = offX - seatSize / 2;
  return (
    <>
    {...Array(count).fill(0).map((_, i: number) => {
      const top = offY - (i - count / 2) * seatSize;
      let chairColor = name == "Pilot Seat" ? "#ff8060" : "#d6d7e3";
      return (
        <>
          <rect
             fill={chairColor}
             stroke={"#000000"}
             strokeWidth={0.5}
             width={seatSize}
             height={seatSize}
             x={left}
             y={-top}
             ry={.4105551} />
          <rect
             fill={chairColor}
             stroke={"#000000"}
             strokeWidth={0.5}
             width={seatSize / 2}
             height={seatSize / 8}
             x={seatSize * 1 / 6 + left}
             y={-seatSize + top}
             ry={0.29849526}
             transform={"scale(1,-1)"} />
          <rect
             fill={chairColor}
             stroke={"#000000"}
             strokeWidth={0.5}
             width={seatSize / 2}
             height={seatSize / 8}
             x={seatSize * 1 / 6 + left}
             y={-seatSize / 8 + top}
             ry={0.29849526}
             transform={"scale(1,-1)"} />
          <rect
             fill={chairColor}
             stroke={"#000000"}
             strokeWidth={0.5}
             width={seatSize * 3 / 8}
             height={seatSize}
             x={left}
             y={-seatSize + top}
             ry={2.3889797}
             transform={"scale(1,-1)"} />
        </>
      )})}
      <text x={+left + seatSize / 2} y={-offY - (offY >= 0 ? 1 : -1) * (count / 2 + .2) * seatSize} alignmentBaseline={'middle'} textAnchor="middle" fontSize={4} fill={'blue'}>{name}</text>
    </>
  );
}

function getPixelFromArm(arm) {
  const pixPerUnit = seatSize / seatSize;
  return arm * pixPerUnit;
}

function Diagram({config}) {
  const seats = [...config.seats]
  const cargoAreas = [...config.cargoAreas]
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

  const canvasPadding = 12;
  const planeTop = minDisplacement;
  const top = planeTop - canvasPadding;
  const planeBottom = maxDisplacement;
  const bottom = planeBottom + canvasPadding;
  const planeLeft = minArm;
  const left = planeLeft + canvasPadding + 12;
  const planeRight = maxArm;
  const right = planeRight - canvasPadding;
  const width = left - right;
  const height = bottom - top;
  const planeWidth = planeLeft - planeRight;
  const planeHeight = planeBottom - planeTop;

  const seatItems = seats.map((seat: seatT) => {
    return <SeatIcon key={seat.id} name={seat.name} offX={-getPixelFromArm(seat.arm)} offY={getPixelFromArm(-seat.lateralDist)} count={Number(seat.seatCount)}/>
  });

  const cargoItems = cargoAreas.map((cargoArea: cargoAreaT) => {
    return <CargoIcon key={cargoArea.id} name={cargoArea.name} offX={-getPixelFromArm(cargoArea.arm)} offY={-planeTop - planeHeight / 2} width={planeHeight - planePadding * 2} />
  });

  return (
    <svg viewBox={`${right} ${top} ${width} ${height}`} overflow={"visible"} id="diagram">
      <path d={`M ${planeLeft} ${planeTop} C 14 ${minDisplacement / 5}, 14 ${maxDisplacement / 5} ${planeLeft} ${planeBottom}`} fill={'white'} stroke={'none'}/>
      <rect x={planeRight} y={planeTop} width={planeWidth} height={planeHeight} fill={'white'} stroke={'none'} />
      {seatItems}
      {cargoItems}
    </svg>
  );
}

export default Diagram;
