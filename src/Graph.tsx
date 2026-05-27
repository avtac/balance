import { Fragment, useContext, useMemo, useRef, type ReactNode } from 'react';
import './Graph.css'
import { type aircraftLimitsT, type cargoAreaT, type aircraftT, type momentObjectT, type regionPointT, type regionT, type seatT, type weightLimitT, type setupT, baseLengthUnit, baseWeightUnit, type loadingT } from './Types';
import { calculateBalanceForLanding, calculateBalanceForOperationConfig, calculateBalanceForTakeoff, calculateEmptyBalanceForConfig, calculateMAC, calculateMaxBalanceForConfig, truncateNumber } from './utility';
import { convertLengthUnit, convertWeightUnit, UnitContext } from './UnitsContext';

let width = 140;
let height = 80;
let padding = 12;
let graphInsetPadding = 5;

interface limitsT {
  minX: number,
  maxX: number,
  minY: number,
  maxY: number,
  xRatio: number,
  yRatio: number
}

function calculatePointX(limits: limitsT, arm: number): number {
  return (arm - limits.minX) * limits.xRatio + padding + graphInsetPadding;
}

function calculatePointY(limits: limitsT, weight: number): number {
  return height - (weight - limits.minY) * limits.yRatio - padding - graphInsetPadding;
}

function calculateArm(weight1: number, arm1: number, weight2: number, arm2: number): number {
  return (arm1 * weight1 + arm2 * weight2) / (weight1 + weight2);
}

function cleanLimits(limits: weightLimitT[]): weightLimitT[] {
  const ret: weightLimitT[] = [];
  for (const i in limits) {
    let limit = limits[i];
    if (ret.find(a => a.weight === limit.weight)) {
      const index = ret.findIndex(a => a.weight === limit.weight);
      ret[index].name += ";" + limit.name;
      continue;
    }
    ret.push({ id: limit.id, weight: limit.weight, name: limit.name, color: limit.color, lineStyle: limit.lineStyle });
  }
  return ret;
}

function generateConfigArea(aircraft: aircraftT, limits: limitsT, selectedConfig: string, units: setupT): string[] {
  const selectedConfigIndex: number = aircraft.aircraftConfigs.findIndex(v => v.id === selectedConfig);
  if (selectedConfigIndex < 0) return [];

  const [configEmptyWeight, configEmptyArm] = calculateEmptyBalanceForConfig(aircraft, selectedConfig);

  // Create list of used seats and cargoAreas from smallest to largest arm
  let positions: momentObjectT[] = [];

  const pointData: momentObjectT[] = [];
  aircraft.aircraftConfigs[selectedConfigIndex].seats.map((s: string) => {
    const seat = aircraft.seats.find((S: seatT) => S.id == s);
    if (!seat) return;
    pointData.push({ weight: seat.maxWeight * seat.seatCount, arm: seat.arm });
  })
    .filter(s => s != undefined)

  aircraft.aircraftConfigs[selectedConfigIndex].cargoAreas.map((c: string) => {
    const cargoArea = aircraft.cargoAreas.find((C: cargoAreaT) => C.id == c);
    if (!cargoArea) return;
    pointData.push({ weight: cargoArea.maxWeight, arm: cargoArea.arm });
  })
    .filter(s => s != undefined)

  aircraft.fuelTanks.map(
    (fuelTank) => {
      const usedTank = !fuelTank.removable || aircraft.aircraftConfigs[selectedConfigIndex].fuelTanks.includes(fuelTank.id);
      if (!usedTank) return;
      pointData.push({ weight: fuelTank.maxWeight, arm: fuelTank.arm });
    })
    .filter(s => s != undefined);

  // Generate bottom
  pointData.sort((a, b) => a.arm - b.arm);

  let totalWeight = configEmptyWeight;
  let totalArm = configEmptyArm;
  pointData.map((s: { weight: number, arm: number }) => {
    totalArm = calculateArm(totalWeight, totalArm, s.weight, s.arm);
    totalWeight += s.weight;
    positions.push({ weight: totalWeight, arm: totalArm })
  });

  let x = units.useMAC ? calculateMAC(configEmptyArm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(configEmptyArm, baseLengthUnit, units.lengthUnits);
  x = calculatePointX(limits, x);
  let y = calculatePointY(limits, convertWeightUnit(configEmptyWeight, baseWeightUnit, units.weightUnits));
  const points: string[] = [`${x},${y}`];

  for (let i = 0; i < positions.length; i++) {
    x = units.useMAC ? calculateMAC(positions[i].arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(positions[i].arm, baseLengthUnit, units.lengthUnits);
    x = calculatePointX(limits, x);
    y = calculatePointY(limits, convertWeightUnit(positions[i].weight, baseWeightUnit, units.weightUnits));
    points.push(`${x},${y}`);
  }

  // Generate Top
  pointData.sort((a, b) => b.arm - a.arm);

  positions = [];
  totalWeight = configEmptyWeight;
  totalArm = configEmptyArm;

  pointData.map((s: { weight: number, arm: number }) => {
    totalArm = calculateArm(totalWeight, totalArm, s.weight, s.arm);
    totalWeight += s.weight;
    positions.push({ weight: totalWeight, arm: totalArm })
  });

  for (let i = positions.length - 1; i >= 0; i--) {
    x = units.useMAC ? calculateMAC(positions[i].arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(positions[i].arm, baseLengthUnit, units.lengthUnits);
    x = calculatePointX(limits, x);
    y = calculatePointY(limits, convertWeightUnit(positions[i].weight, baseWeightUnit, units.weightUnits));
    points.push(`${x},${y}`);
  }

  points.push(points[0]);
  return points;
}

interface plotAreaProps {
  width: number,
  height: number
}

function PlotArea({ width, height }: plotAreaProps): ReactNode {
  return (
    <rect
      className='background'
      width={width - padding * 2}
      height={height - padding * 2}
      x={padding}
      y={padding}
    />
  );
}

interface plotLimitProps {
  data: weightLimitT,
  limits: limitsT
}

function PlotLimit({ data, limits }: plotLimitProps): ReactNode {
  if (!data.weight) return;
  let x1 = padding;
  let x2 = width - padding;
  let y = calculatePointY(limits, data.weight);
  let points = `${x1},${y} ${x2},${y}`;
  return (
    <>
      <polyline
        points={points}
        stroke={data.color ?? 'white'}
        strokeDasharray={data.lineStyle ?? ''}
        strokeWidth='.3' />
      <text
        x={x2 + 1}
        y={y}
        alignmentBaseline={data.name != "" ? 'after-edge' : 'middle'}
        fill={data.color ?? 'white'}>
        {data.weight}
      </text>
      {data.name.split(";").map((name: string, i: number) => {
        return <text
          key={data.id + "TEXT" + i}
          x={x2 + 1}
          y={y + i * 2}
          alignmentBaseline='before-edge'
          fill={data.color ?? 'white'}>
          {name}
        </text>
      })}
    </>
  );
}

interface plotRegionProps {
  data: regionT,
  limits: limitsT
}

function PlotRegion({ data, limits }: plotRegionProps): ReactNode {
  const withEnd = [...data.data, data.data[0]];
  let points = withEnd.map((point: regionPointT) => {
    let x = calculatePointX(limits, point.arm);
    let y = calculatePointY(limits, point.weight);
    return [x, y];
  })
  let pointsString = points.map((p: number[]) => `${p[0]},${p[1]}`).join(' ');
  let middleX = (
    Math.max(...points.map((p: number[]) => p[0]))
    + Math.min(...points.map((p: number[]) => p[0]))
  ) / 2;
  let middleY = (
    Math.max(...points.map((p: number[]) => p[1]))
    + Math.min(...points.map((p: number[]) => p[1]))
  ) / 2;

  return (
    <>
      <polyline
        className='region'
        points={pointsString}
        stroke={data.color ?? 'black'}
        strokeDasharray={data.lineStyle ?? ''}
        strokeWidth='.3'
        fill={(data.color ?? 'black') + "33"} />
      <text
        x={middleX}
        y={middleY}
        fill={data.color}
        textAnchor='middle'
        alignmentBaseline='middle'>
        {data.name}
      </text>
    </>
  );
}

interface plotRegionsProps {
  aircraft: aircraftLimitsT,
  limits: limitsT
}

function PlotRegions({ aircraft, limits }: plotRegionsProps): ReactNode {
  return (
    <>
      {aircraft.regions.map((region: regionT) => <PlotRegion key={region.id} data={region} limits={limits} />)}
      {aircraft.limits.map((limit: weightLimitT) => <PlotLimit key={limit.id} data={limit} limits={limits} />)}
    </>
  );
}

const precision = 10000;

interface plotGridProps {
  limits: limitsT,
  gridSpacing: number,
  units: string
}

function PlotHorizontalGrid({ limits, gridSpacing, units }: plotGridProps): ReactNode {
  const gapBetweenGrid = gridSpacing * limits.xRatio;
  const smallestGridValue = Math.ceil((limits.minX - graphInsetPadding / limits.xRatio) / gridSpacing) * gridSpacing;
  const largestGridValue = Math.floor((limits.maxX + graphInsetPadding / limits.xRatio) / gridSpacing) * gridSpacing;
  const smallestGridPosition = calculatePointX(limits, smallestGridValue);
  const largestGridPosition = calculatePointX(limits, largestGridValue);
  const numGrid = Math.ceil(truncateNumber((largestGridPosition - smallestGridPosition) / gapBetweenGrid, precision)) + 1;
  if (!numGrid) return;
  const startValue = truncateNumber(smallestGridValue, precision);
  let positions: { pos: number, value: string }[] = Array(numGrid).fill(0).map((_, index) => {
    return {
      pos: gapBetweenGrid * index + smallestGridPosition,
      value: truncateNumber(startValue + index * gridSpacing, 1000) + units
    }
  });
  return (
    <>
      {positions.map((x, i) => (
        <Fragment key={i}>
          <polyline
            className={"gridLines"}
            points={`${x.pos},${padding} ${x.pos},${height - padding}`}
            strokeWidth='.2'
            strokeDasharray={".5"} />
          <text
            className={"gridLines"}
            x={x.pos}
            y={height - padding / 2}
            transform={`rotate(${x.value.toString().length > 4 ? 45 : 0}, ${x.pos}, ${height - padding / 2})`}
            textAnchor='middle'
            alignmentBaseline='after-edge'>
            {x.value}
          </text>
        </Fragment >
      ))};
    </>
  );
}

function PlotVerticalGrid({ limits, gridSpacing, units }: plotGridProps): ReactNode {
  const gapBetweenGrid = gridSpacing * limits.yRatio;
  const smallestGridValue = Math.ceil((limits.minY - graphInsetPadding / limits.yRatio) / gridSpacing) * gridSpacing;
  const largestGridValue = Math.floor((limits.maxY + graphInsetPadding / limits.yRatio) / gridSpacing) * gridSpacing;
  const smallestGridPosition = calculatePointY(limits, largestGridValue);
  const largestGridPosition = calculatePointY(limits, smallestGridValue);
  const numGrid = Math.ceil(truncateNumber((largestGridPosition - smallestGridPosition) / gapBetweenGrid, precision)) + 1;
  if (!numGrid) return;
  const startValue = truncateNumber(smallestGridValue, precision);
  let positions: { pos: number, value: string }[] = Array(numGrid).fill(0).map((_, index) => {
    return {
      pos: largestGridPosition - gapBetweenGrid * index,
      value: truncateNumber(startValue + index * gridSpacing, 1000) + units
    }
  });
  return (
    <>
      {positions.map((y, i) =>
      (
        <Fragment key={i}>
          <polyline
            className='gridLines'
            points={`${padding},${y.pos} ${width - padding},${y.pos}`}
            strokeWidth='.2'
            strokeDasharray={".5"} />)
          <text
            className='gridLines'
            x={1}
            y={y.pos}
            alignmentBaseline='middle'>
            {y.value}
          </text>
        </Fragment>
      )
      )};
    </>
  );
}

interface plotTitleProps {
  title: string
}

function PlotTitle({ title }: plotTitleProps): ReactNode {
  return (
    <text
      className='title'
      x={width / 2}
      y={4}
      fill='white'
      textAnchor='middle'
      alignmentBaseline='middle'>
      {title}
    </text>
  )
}

interface plotPointT {
  weight: number,
  arm: number,
  style: string,
  size: number,
  label?: string
}

interface plotPointProps {
  point: plotPointT,
  limits: limitsT
}

function PlotPoint({ point, limits }: plotPointProps): ReactNode {
  const x = calculatePointX(limits, point.arm)
  const y = calculatePointY(limits, point.weight)
  let shape = <circle
    className='point'
    cx={x}
    cy={y}
    r={point.size}
    fill='#59C'
    stroke='black'
    strokeWidth={.3} />;

  if (point.style == 'square') {
    shape = <rect
      className='point'
      x={x - point.size / 2}
      y={y - point.size / 2}
      width={point.size}
      height={point.size}
      fill='#59C'
      stroke='black'
      strokeWidth={.2} />;
  }

  return (
    <>
      {shape}
      {point.label != undefined &&
        <text
          className='point'
          x={x + point.size / 2}
          y={y - point.size / 2 - 1.2}
          textAnchor='middle'>
          {point.label}
        </text>
      }
    </>
  );
}

interface graphProps {
  aircraft: aircraftT;
  loading?: loadingT;
  selectedConfig: string;
  selectedOpsConfig: string;
}

interface lineProps {
  weight1: number;
  arm1: number;
  weight2: number;
  arm2: number;
  color: string;
  style?: string;
}

function Graph({ aircraft, loading, selectedConfig, selectedOpsConfig }: graphProps): ReactNode {
  const units = useContext(UnitContext);
  if (aircraft === undefined) return;
  let data: aircraftLimitsT = JSON.parse(JSON.stringify(aircraft.limits));

  // Ensure that the arm is in MAC or distance units
  data.regions = [...data.regions.map(a => {
    const newData = a.data.map(d => ({ ...d, weight: convertWeightUnit(d.weight, baseWeightUnit, units.weightUnits), arm: units.useMAC ? calculateMAC(d.arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(d.arm, baseLengthUnit, units.lengthUnits) }));
    return { ...a, data: newData };
  })];

  data.limits = [...data.limits.map(a => {
    return { ...a, weight: convertWeightUnit(a.weight ?? 0, baseWeightUnit, units.weightUnits) }
  })];
  const configAreaPoints = useRef("");

  // Add any desired points to graph
  const points: plotPointT[] = []
  // Add any desired lines to graph
  const lines: lineProps[] = []

  points.push({
    weight: convertWeightUnit(aircraft.config.emptyWeight, baseWeightUnit, units.weightUnits),
    arm: units.useMAC ? calculateMAC(aircraft.config.emptyArm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(aircraft.config.emptyArm, baseLengthUnit, units.lengthUnits),
    style: 'square',
    size: 2,
    label: "Empty Aircraft"
  });

  if (selectedConfig) {
    const [weight, arm] = calculateEmptyBalanceForConfig(aircraft, selectedConfig);
    const [weightFull, armFull] = calculateMaxBalanceForConfig(aircraft, selectedConfig);
    if (weight != aircraft.config.emptyWeight || arm != aircraft.config.emptyArm)
      points.push({
        weight: convertWeightUnit(weight, baseWeightUnit, units.weightUnits),
        arm: units.useMAC ? calculateMAC(arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(arm, baseLengthUnit, units.lengthUnits),
        style: 'circle',
        size: 1,
        label: "Empty Config"
      });
    if (weightFull != aircraft.config.emptyWeight || armFull != aircraft.config.emptyArm)
      points.push({
        weight: convertWeightUnit(weightFull, baseWeightUnit, units.weightUnits),
        arm: units.useMAC ? calculateMAC(armFull, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(armFull, baseLengthUnit, units.lengthUnits),
        style: 'circle',
        size: 1,
        label: "Max Config"
      });

  }

  if (selectedOpsConfig) {
    const [weight, arm] = calculateBalanceForOperationConfig(aircraft, selectedOpsConfig);
    if (weight != aircraft.config.emptyWeight || arm != aircraft.config.emptyArm)
      points.push({
        weight: convertWeightUnit(weight, baseWeightUnit, units.weightUnits),
        arm: units.useMAC ? calculateMAC(arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(arm, baseLengthUnit, units.lengthUnits),
        style: 'square',
        size: 2,
        label: "Ops Config"
      });
  }

  if (loading) {
    let [weight, arm] = calculateBalanceForLanding(aircraft, selectedOpsConfig, loading);
    points.push({
      weight: convertWeightUnit(weight, baseWeightUnit, units.weightUnits),
      arm: units.useMAC ? calculateMAC(arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(arm, baseLengthUnit, units.lengthUnits),
      style: 'square',
      size: 2,
      label: "Land"
    });
    [weight, arm] = calculateBalanceForTakeoff(aircraft, selectedOpsConfig, loading);
    points.push({
      weight: convertWeightUnit(weight, baseWeightUnit, units.weightUnits),
      arm: units.useMAC ? calculateMAC(arm, aircraft.config.mac, aircraft.config.leadingEdgeMAC, units.useMAC) : convertLengthUnit(arm, baseLengthUnit, units.lengthUnits),
      style: 'square',
      size: 2,
      label: "Takeoff"
    });
  }

  // Calculate graph bounding box

  let minX: number = NaN;
  let maxX: number = NaN;
  let minY: number = NaN;
  let maxY: number = NaN;

  if (data.regions.length > 0) {
    minX = Math.min(...data.regions.map((r: regionT) => Math.min(...r.data.filter((v: regionPointT) => v.arm !== null).map(p => p.arm))));
    maxX = Math.max(...data.regions.map((r: regionT) => Math.max(...r.data.filter((v: regionPointT) => v.arm !== null).map(p => p.arm))));
    minY = Math.min(...data.regions.map((r: regionT) => Math.min(...r.data.filter((v: regionPointT) => v.weight !== null).map(p => p.weight))));
    maxY = Math.max(...data.regions.map((r: regionT) => Math.max(...r.data.filter((v: regionPointT) => v.weight !== null).map(p => p.weight))));
  }

  if (data.limits.length > 0) {
    maxY = Math.max(...data.limits.map((lim: weightLimitT) => lim.weight).filter((v: (number | null)) => v !== null), maxY) ?? maxY;
    minY = Math.min(...data.limits.map((lim: weightLimitT) => lim.weight).filter((v: (number | null)) => v !== null), minY) ?? minY;
  }

  if (points.length > 0) {
    maxX = Math.max(...points.filter((v) => v.arm !== null).map((lim) => lim.arm), maxX) ?? maxX;
    minX = Math.min(...points.filter((v) => v.arm !== null).map((lim) => lim.arm), minX) ?? minX;
    maxY = Math.max(...points.filter((v) => v.weight !== null).map((lim) => lim.weight), maxY) ?? maxY;
    minY = Math.min(...points.filter((v) => v.weight !== null).map((lim) => lim.weight), minY) ?? minY;
  }

  const limits: limitsT = {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    xRatio: (width - graphInsetPadding * 2 - padding * 2) / (maxX - minX),
    yRatio: (height - graphInsetPadding * 2 - padding * 2) / (maxY - minY)
  };

  useMemo(() => {
    if (selectedConfig)
      configAreaPoints.current = generateConfigArea(aircraft, limits, selectedConfig, units).join(" ");
  }, [aircraft, selectedConfig, limits]);

  // Convert interval to spacing of 1, 2, or 5 * 10^x
  function getCleanInterval(width: number, desiredTicks: number): number {
    const desiredInterval = (width / desiredTicks);
    const power = Math.ceil(Math.log10(desiredInterval))
    const spacing = desiredInterval / Math.pow(10, power - 1);
    const number = (spacing < 5 ? (spacing < 2 ? 1 : 2) : 5) * Math.pow(10, power - 1);
    return number;
  }

  // Unit spacing for grid lines
  const desiredTicks = 10;
  const horSpacing = getCleanInterval(maxX - minX, desiredTicks);
  const verSpacing = getCleanInterval(maxY - minY, desiredTicks * height / width);

  // Gird base components
  const title = <PlotTitle title={`Weight (${units.weightUnits}) vs Arm (${units.useMAC ? "% MAC" : units.lengthUnits})`} />;
  const horizontalBars = <PlotHorizontalGrid
    limits={limits}
    gridSpacing={horSpacing}
    units={units.useMAC && (aircraft.config.mac && aircraft.config.leadingEdgeMAC) ? "%" : ""} />;
  const verticalBars = <PlotVerticalGrid
    limits={limits}
    gridSpacing={verSpacing}
    units='' />;

  const dataAvailable = isFinite(limits.xRatio) && isFinite(limits.yRatio);

  // lines
  const lineComponents = lines.map((l, i) => {
    return <line
      key={[l.arm1, l.weight2, i].join(" ")}
      x1={calculatePointX(limits, l.arm1)}
      y1={calculatePointY(limits, l.weight1)}
      x2={calculatePointX(limits, l.arm2)}
      y2={calculatePointY(limits, l.weight2)}
      stroke={l.color}
      strokeWidth={.3}
      strokeDasharray={l.style}
    />
  })

  // points
  const pointComponents = points.map((p, i) => {
    return <PlotPoint
      key={[p.weight, p.arm, i].join(' ')}
      point={p}
      limits={limits}
    />
  })

  data.limits = cleanLimits(data.limits);
  return (
    <svg className='graph' viewBox={'0 0 ' + width + ' ' + height}>
      <PlotArea width={width} height={height} />
      {title}
      {dataAvailable && horizontalBars}
      {dataAvailable && verticalBars}
      {dataAvailable && selectedConfig && <polyline className="configArea" points={configAreaPoints.current} />}
      {dataAvailable && <PlotRegions aircraft={data} limits={limits} />}
      {dataAvailable && lineComponents}
      {dataAvailable && pointComponents}
    </svg>
  );
}

export default Graph;
