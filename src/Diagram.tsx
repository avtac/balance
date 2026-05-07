import "./Diagram.css"

function Square({offX=0, offY=0}) {
  const size = 40;
  return (
    <img src={"/src/assets/Chair.svg"} style={{width: size, height: size, right: offX - size / 2, top: offY - size / 2}}/>
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
  const width = 30 + seats.reduce((max, item) => Math.max(max, item.x), seats[0].x);

  const seatItems = seats.map(seat => <Square key={seat.id} offX={seat.x} offY={seat.y}/>)
  return (
    <div id="diagram" style={{width: width}}>
      {seatItems}
    </div>
  );
}

export default Diagram;
