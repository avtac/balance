import "./Diagram.css"

function Square({offX=0, offY=0}) {
  const size = 40;
  return (
    <svg viewBox={"0 0 100 100"} width={size} height={size} style={{right: offX - size / 2, top: offY - size / 2}}>
      <rect fill="white" width="100" height="100" />
    </svg>
  );
}

function Diagram() {
  const seats = [
    {id: "A", x: 40, y:30},
    {id: "B", x: 40, y:-30},
    {id: "C", x: 90, y:34},
    {id: "D", x: 140, y:34},
    {id: "E", x: 90, y:-34},
    {id: "F", x: 160, y:-34},
    {id: "G", x: 90, y:-84},
    {id: "H", x: 160, y:-84}
  ];

  const seatItems = seats.map(seat => <Square key={seat.id} offX={seat.x} offY={seat.y}/>)
  return (
    <div id="diagram">
      {seatItems}
    </div>
  );
}

export default Diagram;
