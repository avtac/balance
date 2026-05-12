import { useMemo, useRef } from 'react';
import './Graph.css'
import type { cargoAreaT, configT, regionPointT, regionT, seatT, weightLimitT } from './Types';
import { calculateBalanceForOperationConfig, calculateEmptyBalanceForConfig, calculateMaxBalanceForConfig } from './utility';

let width = 140;
let height = 80;
let padding = 12;

function cleanLimits(limits: weightLimitT[]) {
  const ret: weightLimitT[] = [];
  for (const i in limits) {
    let limit = limits[i];
    if (ret.find(a => a.value === limit.value)) {
      const index = ret.findIndex(a => a.value === limit.value);
      ret[index].name += ";" + limit.name;
      continue;
    }
    ret.push({ id: limit.id, value: limit.value, name: limit.name, color: limit.color, lineStyle: limit.lineStyle });
  }
  return ret;
}

function generateConfigArea(config: configT, limits, selectedConfig: string): string[] {
  const selectedConfigIndex = config.aircraftConfigs.findIndex(v => v.id === selectedConfig);

  const [configEmptyWeight, configEmptyArm] = calculateEmptyBalanceForConfig(config, selectedConfig);

  // Create list of used seats and cargoAreas from smallest to largest arm
  let positions: {weight: number, arm: number}[] = [];

  const pointData: {weight: number, arm: number}[] = [];
  config.aircraftConfigs[selectedConfigIndex].seats.map((s: string) => {
    const seat = config.seats.find((S: seatT) => S.id == s);
    if (!seat) return;
    pointData.push({weight: seat.maxWeight * seat.seatCount, arm: seat.arm});
  })
  .filter(s => s != undefined)

  config.aircraftConfigs[selectedConfigIndex].cargoAreas.map((c: string) => {
    const cargoArea = config.cargoAreas.find((C: cargoAreaT) => C.id == c);
    if (!cargoArea) return;
    pointData.push({weight: cargoArea.maxWeight, arm: cargoArea.arm});
  })
  .filter(s => s != undefined)

  pointData.sort((a, b) => a.arm - b.arm);

  let totalWeight = configEmptyWeight;
  let totalArm = configEmptyArm;
  pointData.map((s: {weight: number, arm: number}) => {
    totalArm = (totalArm * totalWeight + s.weight * s.arm) / (totalWeight + s.weight);
    totalWeight += s.weight;
    positions.push({weight: totalWeight, arm: totalArm})
  });

  let x = limits.xRatio * (configEmptyArm - limits.minX) + padding;
  let y = height - limits.yRatio * (configEmptyWeight - limits.minY) - padding;
  const points: string[] = [`${x},${y}`];
  // Generate bottom
  for (let i = 0; i < positions.length; i++) {
    x = limits.xRatio * (positions[i].arm - limits.minX) + padding;
    y = height - limits.yRatio * (positions[i].weight - limits.minY) - padding;
    points.push(`${x},${y}`);
  }

  pointData.sort((a, b) => b.arm - a.arm);

  positions = [];
  totalWeight = configEmptyWeight;
  totalArm = configEmptyArm;

  pointData.map((s: {weight: number, arm: number}) => {
    totalArm = (totalArm * totalWeight + s.weight * s.arm) / (totalWeight + s.weight);
    totalWeight += s.weight;
    positions.push({weight: totalWeight, arm: totalArm})
  });

  // Generate Top
  for (let i = positions.length - 1; i >= 0; i--) {
    x = limits.xRatio * (positions[i].arm - limits.minX) + padding;
    y = height - limits.yRatio * (positions[i].weight - limits.minY) - padding;
    points.push(`${x},${y}`);
  }

  points.push(points[0]);
  return points;
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

function PlotLimit({data, limits}) {
  if (!data.value) return;
  let x1 = padding;
  let x2 = width - padding;
  let y = height - limits.yRatio * (data.value - limits.minY) - padding;
  let points = `${x1},${y} ${x2},${y}`;
  return (
    <>
    <polyline points={points} stroke={data.color ?? 'white'} strokeDasharray={data.lineStyle ?? ''} strokeWidth='.3' fill='none'/>
    <text x={x2 + 1} y={y} alignmentBaseline={data.name != "" ? 'after-edge' : 'middle'} fontSize={2} fill={data.color ?? 'white'}>{data.value}</text>
    {data.name.split(";").map((name: string, i: number) => {
      return <text key={name} x={x2 + 1} y={y + i * 2} alignmentBaseline='before-edge' fontSize={2} fill={data.color ?? 'white'}>{name}</text>
    })}
    </>
  );
}

function PlotRegion({data, limits}) {
  const withEnd = [...data.data, data.data[0]];
  let points = withEnd.map((point: regionPointT) => {;
    let x = limits.xRatio * (point.arm - limits.minX) + padding;
    let y = height - limits.yRatio * (point.weight - limits.minY) - padding;
    return [x, y];
  })
  let pointsString = points.map((p: number[]) => `${p[0]},${p[1]}`).join(' ');
  let middleX = (Math.max(...points.map((p: number[]) => p[0])) + Math.min(...points.map((p: number[]) => p[0]))) / 2;
  let middleY = (Math.max(...points.map((p: number[]) => p[1])) + Math.min(...points.map((p: number[]) => p[1]))) / 2;
  // let middleX = (points.map((p: number[]) => p[0])).reduce((sum, current) => sum + current, 0) / points.length;
  // let middleY = (points.map((p: number[]) => p[1])).reduce((sum, current) => sum + current, 0) / points.length;

  return (
    <>
    <polyline points={pointsString} stroke={data.color ?? 'white'} strokeDasharray={data.lineStyle ?? ''} strokeWidth='.3' fill='none'/>
    <text x={middleX} y={middleY} fontSize="2" fill={data.color} textAnchor='middle' alignmentBaseline='middle'>{data.name}</text>
    </>
  );
}

function PlotRegions({data, limits}) {
  return (
    <>
    {data.regions.map((region: regionT) => <PlotRegion data={region} limits={limits}/>)}
    {data.limits.map((limit: weightLimitT) => <PlotLimit data={limit} limits={limits}/>)}
    </>
  );
}

const precision = 10000;

function PlotHorizontalGrid({limits, gridSpacing}) {
  const smallestGridValue = Math.ceil(limits.minX / gridSpacing) * gridSpacing;
  const xOffset = (smallestGridValue - limits.minX) * limits.xRatio + padding;
  const numGrid = Math.floor((limits.maxX - smallestGridValue) / gridSpacing) + 1;
  const gapBetweenGrid = gridSpacing * limits.xRatio;
  if (!numGrid) return;
  let positions = Array(numGrid).fill(0).map((_, index) => {return {
    pos: gapBetweenGrid * index + xOffset,
    value: (Math.floor(smallestGridValue * precision) + Math.floor(index * gridSpacing * precision)) / precision
  }});
  return (
    <>
      {positions.map(x => (
        <>
          <polyline points={`${x.pos},${padding} ${x.pos},${height - padding}`} stroke="#9993" strokeWidth='.2' strokeDasharray={".5"} />)
          <text x={x.pos} y={height - padding / 2} transform={`rotate(${x.value.toString().length > 4 ? 45 : 0}, ${x.pos}, ${height - padding / 2})`} fontSize="2" fill="#888" textAnchor='middle' alignmentBaseline='after-edge'>{x.value}</text>
        </>
      ))};
    </>
  );
}

function PlotVerticalGrid({limits, gridSpacing}) {
  const largestGridValue = Math.floor(limits.maxY / gridSpacing) * gridSpacing;
  let yOffset = (limits.maxY - largestGridValue) * limits.yRatio + padding;
  let numGrid = Math.floor((largestGridValue - limits.minY) / gridSpacing) + 1;
  let gapBetweenGrid = gridSpacing * limits.yRatio;
  if (!numGrid) return;
  let positions = Array(numGrid).fill(0).map((_, index) => {return {
    pos: gapBetweenGrid * index + yOffset,
    value: (Math.floor(largestGridValue * precision) - Math.floor(index * gridSpacing * precision)) / precision
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

function PlotPoint({point, size, label=undefined, style=null}) {
  let shape = <circle cx={point.x} cy={point.y} r={size} fill='#59C' stroke='black' strokeWidth={.3}/>;

  if (style == 'square') {
    shape = <rect x={point.x - size / 2} y={point.y - size / 2} width={size} height={size} fill='#59C' stroke='black' strokeWidth={.2} />;
  }

  return (
    <>
      {shape}
      {label != undefined && <text x={point.x + size / 2} y={point.y - size / 2 - 1.2} textAnchor='middle' fontSize={2} fill='#888'>{label}</text>}
    </>
  );
}

function Graph({ config, selectedConfig, selectedOpsConfig }) {
  if (config === undefined) return;
  let data = JSON.parse(JSON.stringify(config.limits));
  const configAreaPoints = useRef("");

  // Add any desired points to graph
  const points: {weight: number, arm: number, style: string, size: number, label?: string}[] = []
  // Add any desired lines to graph
  const lines: {weight1: number, arm1: number, weight2: number, arm2: number, color: string, style?: string}[] = []

  points.push({
    weight: config.config.emptyWeight,
    arm: config.config.emptyArm,
    style: 'square',
    size: 2,
    label: "Empty Aircraft"
  });

  if (selectedConfig) {
    const [weight, arm] = calculateEmptyBalanceForConfig(config, selectedConfig);
    const [weightFull, armFull] = calculateMaxBalanceForConfig(config, selectedConfig);
    if (weight != config.config.emptyWeight || arm != config.config.emptyArm)
      points.push({
        weight: weight,
        arm: arm,
        style: 'circle',
        size: 1,
        label: "Empty Config"
      });
    if (weightFull != config.config.emptyWeight || armFull != config.config.emptyArm)
      points.push({
        weight: weightFull,
        arm: armFull,
        style: 'circle',
        size: 1,
        label: "Max Config"
      });

  }

  if (selectedOpsConfig) {
    const [weight, arm] = calculateBalanceForOperationConfig(config, selectedConfig, selectedOpsConfig);
    if (weight != config.config.emptyWeight || arm != config.config.emptyArm)
      points.push({
        weight: weight,
        arm: arm,
        style: 'square',
        size: 2,
        label: "Ops Config"
      });
  }

  // Calculate graph bounding box

  let minX: number = NaN;
  let maxX: number = NaN;
  let minY: number = NaN;
  let maxY: number = NaN;

  if (data.regions.length > 0) {
    minX = Math.min(...data.regions.map((r: regionT) => Math.min(...r.data.filter((v: regionPointT) => v.arm !== null).map(p => p.arm))));
    maxX = Math.max(...data.regions.map((r: regionT) => Math.max(...r.data.filter((v: regionPointT)=> v.arm !== null).map(p => p.arm))));
    minY = Math.min(...data.regions.map((r: regionT) => Math.min(...r.data.filter((v: regionPointT) => v.weight !== null).map(p => p.weight))));
    maxY = Math.max(...data.regions.map((r: regionT) => Math.max(...r.data.filter((v: regionPointT) => v.weight !== null).map(p => p.weight))));
  }

  if (data.limits.length > 0) {
    maxY = Math.max(...data.limits.filter((v: weightLimitT) => v.value !== null).map((lim: weightLimitT) => lim.value), maxY) ?? maxY;
    minY = Math.min(...data.limits.filter((v: weightLimitT) => v.value !== null).map((lim: weightLimitT) => lim.value), minY) ?? minY;
  }

  if (points.length > 0) {
    maxX = Math.max(...points.filter((v) => v.arm !== null).map((lim) => lim.arm), maxX) ?? maxX;
    minX = Math.min(...points.filter((v) => v.arm !== null).map((lim) => lim.arm), minX) ?? minX;
    maxY = Math.max(...points.filter((v) => v.weight !== null).map((lim) => lim.weight), maxY) ?? maxY;
    minY = Math.min(...points.filter((v) => v.weight !== null).map((lim) => lim.weight), minY) ?? minY;
  }

  const limits = {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    xRatio: (width - padding * 2) / (maxX - minX),
    yRatio: (height - padding * 2) / (maxY - minY)
  };

  useMemo(() => {
    if (selectedConfig)
      configAreaPoints.current = generateConfigArea(config, limits, selectedConfig).join(" ");
  }, [config, selectedConfig]);

  // Convert interval to spacing of 1, 2, or 5 * 10^x
  function getCleanInterval( width, desiredTicks ) {
    const desiredInterval = (width / desiredTicks);
    const power = Math.ceil(Math.log10(desiredInterval))
    const spacing = desiredInterval / Math.pow(10, power - 1);
    const number = (spacing < 5 ? (spacing < 2 ? 1 : 2) : 5) * Math.pow(10, power - 1);
    return number;
  }

  // Unit spacing for grid lines
  const desiredTicks = 10;
  const horSpacing = getCleanInterval(maxX - minX, desiredTicks);
  const verSpacing = getCleanInterval(maxY - minY, desiredTicks);

  // Gird base components
  const title = useRef(<PlotTitle title="Weight vs Arm" />);
  const horizontalBars = <PlotHorizontalGrid limits={limits} gridSpacing={horSpacing} />;
  const verticalBars = <PlotVerticalGrid limits={limits} gridSpacing={verSpacing} />;

  const dataAvailable = isFinite(limits.xRatio) && isFinite(limits.yRatio);

  data.limits = cleanLimits(data.limits);
  return (
    <>
      <svg viewBox={'0 0 ' + width + ' ' + height}>
        <PlotArea width={width} height={height} />
        {title.current}
        {dataAvailable && horizontalBars}
        {dataAvailable && verticalBars}
        {dataAvailable && selectedConfig && <polyline points={configAreaPoints.current} fill={'#8883'} stroke={'none'}/>}
        {dataAvailable && <PlotRegions data={data} limits={limits}/>}
        {dataAvailable && lines.map(l => {
          return <line
            x1={(l.arm1 - limits.minX) * limits.xRatio + padding}
            y1={height - (l.weight1 - limits.minY) * limits.yRatio - padding}
            x2={(l.arm2 - limits.minX) * limits.xRatio + padding}
            y2={height - (l.weight2 - limits.minY) * limits.yRatio - padding}
            stroke={l.color}
            strokeWidth={.3}
            strokeDasharray={l.style}
          />
        })}
        {dataAvailable && points.map(p => {
          return <PlotPoint point={{
            x: (p.arm - limits.minX) * limits.xRatio + padding,
            y: height - (p.weight - limits.minY) * limits.yRatio - padding
          }}
          size={p.size}
          label={p.label}
          style={p.style}
          />
        })}
      </svg>
    </>
  );
}

export default Graph;
