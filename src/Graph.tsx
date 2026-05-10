import './Graph.css'
import type { regionPointT, regionT, weightLimitT } from './Types';

let width = 120;
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

function PlotHorizontalGrid({limits, gridSpacing}) {
  let smallestGridValue = Math.ceil(limits.minX / gridSpacing) * gridSpacing;
  let xOffset = (smallestGridValue - limits.minX) * limits.xRatio + padding;
  let numGrid = Math.floor((limits.maxX - smallestGridValue) / gridSpacing) + 1;
  let gapBetweenGrid = gridSpacing * limits.xRatio;
  if (!numGrid) return;
  let positions = Array(numGrid).fill(0).map((_, index) => {return {
    pos: gapBetweenGrid * index + xOffset,
    value: smallestGridValue + index * gridSpacing
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
  const largestGridValue = Math.floor(limits.maxY / gridSpacing) * gridSpacing;
  let yOffset = (limits.maxY - largestGridValue) * limits.yRatio + padding;
  let numGrid = Math.floor((largestGridValue - limits.minY) / gridSpacing) + 1;
  let gapBetweenGrid = gridSpacing * limits.yRatio;
  if (!numGrid) return;
  let positions = Array(numGrid).fill(0).map((_, index) => {return {
    pos: gapBetweenGrid * index + yOffset,
    value: largestGridValue - index * gridSpacing
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

function PlotPoint({point, size, style=null}) {
  let shape = <circle cx={point.x} cy={point.y} r={size} fill='#59C' stroke='black' strokeWidth={.3}/>;

  if (style == 'square') {
    shape = <rect x={point.x - size / 2} y={point.y - size / 2} width={size} height={size} fill='#59C' stroke='black' strokeWidth={.2} />;
  }

  return (
    <>
      {shape}
    </>
  );
}

function Graph({ config }) {
  if (config === undefined) return;
  let data = JSON.parse(JSON.stringify(config.limits));

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
  const limits = {
    minX: minX,
    maxX: maxX,
    minY: minY,
    maxY: maxY,
    xRatio: (width - padding * 2) / (maxX - minX),
    yRatio: (height - padding * 2) / (maxY - minY)
  };
  data.limits = cleanLimits(data.limits);
  return (
    <>
      <svg viewBox={'0 0 ' + width + ' ' + height}>
        <PlotArea width={width} height={height} />
        <PlotTitle title="Weight vs Arm" />
        {!isNaN(limits.xRatio) && <PlotHorizontalGrid limits={limits} gridSpacing={5} />}
        {!isNaN(limits.xRatio) && <PlotVerticalGrid limits={limits} gridSpacing={100} />}
        {!isNaN(limits.xRatio) && <PlotRegions data={data} limits={limits}/>}
        <PlotPoint point={{
          x: (config.config.emptyArm - limits.minX) * limits.xRatio + padding,
          y: height - (config.config.emptyWeight-limits.minY) * limits.yRatio - padding
        }} size={1.5} style='square' />
      </svg>
    </>
  );
}

export default Graph;
