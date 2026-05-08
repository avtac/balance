import './Graph.css'
import { useRef, useEffect, useState } from 'react';

let width = 120;
let height = 80;
let padding = 8;

function cleanLimits(limits: Array<{ value: number; name: string }>) {
  const ret: Array<{ value: number; name: string }> = [];
  for (const i in limits) {
    let limit = limits[i];
    if (ret.find(a => a.value === limit.value)) {
      const index = ret.findIndex(a => a.value === limit.value);
      ret[index].name += " " + limit.name;
      continue;
    }
    ret.push({ value: limit.value, name: limit.name });
  }
  return ret;
}

function PlotArea({width, height}) {
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

let testData = {
  regions: [
    {name: "Limit 1", data: sampleData},
    {name: "Limit 2", data: sampleData2},
    {name: "Limit 3", data: sampleData3}
  ],
  limits: [
    {name: "MRW", value: 2550},
    {name: "MZFW", value: 1800},
    {name: "MLW", value: 2500},
    {name: "MTOW", value: 2500}
  ]}

function PlotLimit({data, limits}) {
  if (!data.value) return;
  let x1 = padding;
  let x2 = width - padding;
  let y = height - limits.yRatio * (data.value - limits.minY) - padding;
  let points = `${x1},${y} ${x2},${y}`;
  return (
    <>
    <polyline points={points} stroke="#28cbce" stroke-linejoin="miter" strokeWidth='.3' fill='none'/>
    <text x={x2 + 1} y={y} alignmentBaseline='after-edge' fontSize={2} fill='#28cbce'>{data.value}</text>
    {data.name.split(" ").map((name, i) => <text x={x2 + 1} y={y + i * 2} alignmentBaseline='before-edge' fontSize={2} fill='#28cbce'>{name}</text>)}
    </>
  );
}

function PlotRegion({data, limits}) {
  data.data.push(data.data[0]);
  let points = data.data.map(point => {
    let x = limits.xRatio * (point.x - limits.minX) + padding;
    let y = height - limits.yRatio * (point.y - limits.minY) - padding;
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

function PlotRegions({data, limits}) {
  return (
    <>
    {data.regions.map(region => <PlotRegion data={region} limits={limits}/>)}
    {data.limits.map(limit => <PlotLimit data={limit} limits={limits}/>)}
    </>
  );
}

function PlotHorizontalGrid({limits, gridSpacing}) {
  let numGrid = Math.floor((limits.maxX - limits.minX) / gridSpacing) + 1;
  let gapBetweenGrid = gridSpacing * limits.xRatio;
  let xOffset = (limits.minX % gridSpacing) * limits.xRatio;
  let positions = Array(numGrid).fill(0).map((_, index) => {return {
    pos: gapBetweenGrid * (index + 1) + padding - xOffset,
    value: (index + 1) * gridSpacing - limits.minX % gridSpacing + limits.minX
  }});
  return (
    <>
      {positions.map(x => (
        <>
          <polyline points={`${x.pos},${padding} ${x.pos},${height - padding}`} stroke="#9993" strokeWidth='.2' strokeDasharray={".5"} />)
          <text x={x.pos} y={height - padding / 2} fontSize="2" fill="#888" textAnchor='middle' alignmentBaseline='after-edge'>{x.value}</text>
        </>
      ))};
    </>
  );
}

function PlotVerticalGrid({limits, gridSpacing}) {
  let numGrid = Math.floor((limits.maxY - limits.minY) / gridSpacing);
  let gapBetweenGrid = gridSpacing * limits.yRatio;
  let yOffset = (limits.maxY % gridSpacing) * limits.yRatio;
  let positions = Array(numGrid).fill(0).map((_, index) => {return {
    pos: gapBetweenGrid * (index + 1) + padding - yOffset,
    value: (numGrid - index) * gridSpacing - limits.minY % gridSpacing + limits.minY
  }});
  return (
    <>
      {positions.map(y =>
        (
        <>
          <polyline points={`${padding},${y.pos} ${width - padding},${y.pos}`} stroke="#9993" strokeWidth='.2' strokeDasharray={".5"} />)
          <text x={1} y={y.pos} fontSize="2" fill="#888" alignmentBaseline='middle'>{y.value}</text>
        </>
        )
       )};
    </>
  );
}

function PlotTitle({title}) {
  return (
    <text x={width / 2} y={4} fontSize={4} fill='white' textAnchor='middle' alignmentBaseline='middle'>{title}</text>
  )
}

function Graph() {
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
    maxY: maxY,
    xRatio: (width - padding * 2) / (maxX - minX),
    yRatio: (height - padding * 2) / (maxY - minY)
  };
  testData.limits = cleanLimits(testData.limits);
  return (
    <>
      <svg viewBox={'0 0 ' + width + ' ' + height}>
        <PlotArea width={width} height={height} />
        <PlotTitle title="Weight vs Arm" />
        <PlotHorizontalGrid limits={limits} gridSpacing={5} />
        <PlotVerticalGrid limits={limits} gridSpacing={100} />
        <PlotRegions data={testData} limits={limits}/>
      </svg>
    </>
  );
}

export default Graph;
