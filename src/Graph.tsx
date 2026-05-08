import './Graph.css'
import { useRef, useEffect, useState } from 'react';

function PlotArea({width, height, padding}) {
  return (
    <rect
      width={width - padding * 2}
      height={height - padding * 2}
      x={padding}
      y={padding}
      fill='#335'
      />
  );
}

let sampleData = [
  {x: 30, y: 1400},
  {x: 30, y: 2000},
  {x: 35, y: 2550},
  {x: 50, y: 2550},
  {x: 50, y: 1400}
]

let sampleData2 = [
  {x: 20, y: 1400},
  {x: 20, y: 2000},
  {x: 35, y: 2500},
  {x: 40, y: 2500},
  {x: 70, y: 1400}
]

let sampleData3 = [
  {x: 20, y: 1400},
  {x: 20, y: 1500},
  {x: 29, y: 1500},
  {x: 29, y: 1400}
]

let testData = {regions: [{name: "Limit 1", data: sampleData}, {name: "Limit 2", data: sampleData2}, {name: "Limit 3", data: sampleData3}], limits: [{name: "MRW", value: 2600}, {name: "MLW", value: 2450}]}

function PlotLimit({data, padding, limits}) {
  if (!data.value) return;
  let x1 = padding;
  let x2 = 120 - padding;
  let yRatio = (80 - padding * 2) / (limits.maxY - limits.minY);
  let y = 80 - yRatio * (data.value - limits.minY) - padding;
  let points = `${x1},${y} ${x2},${y}`;
  return (
    <>
    <polyline points={points} stroke="#28cbce" stroke-linejoin="miter" strokeWidth='.3' fill='none'/>
    <text x={x2 + 1} y={y} alignmentBaseline='after-edge' fontSize={2} fill='#28cbce'>{data.name}</text>
    <text x={x2 + 1} y={y} alignmentBaseline='before-edge' fontSize={2} fill='#28cbce'>{data.value}</text>
    </>
  );
}

function PlotRegion({data, padding, limits}) {
  let xRatio = (120 - padding * 2) / (limits.maxX - limits.minX);
  let yRatio = (80 - padding * 2) / (limits.maxY - limits.minY);
  data.data.push(data.data[0]);
  let points = data.data.map(point => {
    let x = xRatio * (point.x - limits.minX) + padding;
    let y = 80 - yRatio * (point.y - limits.minY) - padding;
    return [x, y];
  })
  let pointsString = points.map(p => `${p[0]},${p[1]}`).join(' ');
  let middleX = (Math.max(...points.map(p => p[0])) + Math.min(...points.map(p => p[0]))) / 2;
  let middleY = (Math.max(...points.map(p => p[1])) + Math.min(...points.map(p => p[1]))) / 2;
  // let middleX = (points.map(p => p[0])).reduce((sum, current) => sum + current, 0) / points.length;
  // let middleY = (points.map(p => p[1])).reduce((sum, current) => sum + current, 0) / points.length;
  return (
    <>
    <polyline points={pointsString} stroke="#28cbce" stroke-linejoin="miter" strokeWidth='.3' fill='none'/>
    <text x={middleX} y={middleY} fontSize="2" fill="#29cbce" textAnchor='middle' alignmentBaseline='middle'>{data.name}</text>
    </>
  );
}

function PlotRegions({data, padding, limits}) {
  return (
    <>
    {data.regions.map(region => <PlotRegion data={region} padding={padding} limits={limits}/>)}
    {data.limits.map(limit => <PlotLimit data={limit} padding={padding} limits={limits}/>)}
    </>
  );
}

function Graph() {
  let width = 120;
  let height = 80;
  let padding = 7;

  let data = testData;
  const minX = Math.min(...data.regions.map(r => Math.min(...r.data.filter(v=> v.x !== null).map(p => p.x))));
  const maxX = Math.max(...data.regions.map(r => Math.max(...r.data.filter(v=> v.x !== null).map(p => p.x))));
  let minY = Math.min(...data.regions.map(r => Math.min(...r.data.filter(v=> v.y !== null).map(p => p.y))));
  let maxY = Math.max(...data.regions.map(r => Math.max(...r.data.filter(v=> v.y !== null).map(p => p.y))));
  maxY = Math.max(...data.limits.filter(v=> v.value !== null).map(lim => lim.value), maxX);
  minY = Math.min(...data.limits.filter(v=> v.value !== null).map(lim => lim.value), minY);
  const limits = {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY
  };

  return (
    <>
      <svg viewBox={'0 0 ' + width + ' ' + height}>
        <PlotArea width={width} height={height} padding={padding} />
        <PlotRegions data={testData} padding={padding} limits={limits}/>
      </svg>
    </>
  );
}

export default Graph;
