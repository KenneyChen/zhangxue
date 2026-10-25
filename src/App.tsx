import { useCallback, useEffect, useRef, useState } from 'react'

const W = 1280
const H = 720
const WATER = 470
const ORANGE = '#ff5a1f'
const CYAN = '#5fd0e6'
const INK = '#f2efe9'

const SCENES = [
  { dur: 6, label: '开场' },
  { dur: 8, label: '受力' },
  { dur: 9, label: '动压' },
  { dur: 8, label: '拍水' },
  { dur: 9, label: '临界速度' },
  { dur: 8, label: '转弯' },
  { dur: 6, label: '总结' },
]
const TOTAL = SCENES.reduce((a, s) => a + s.dur, 0)

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x))
const seg = (p: number, a: number, b: number) => clamp((p - a) / (b - a))
const ease = (x: number) => x * x * (3 - 2 * x)

function Arrow({
  x1,
  y1,
  x2,
  y2,
  color,
  w = 6,
}: {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  w?: number
}) {
  const len = Math.hypot(x2 - x1, y2 - y1)
  if (len < 4) return null
  const a = Math.atan2(y2 - y1, x2 - x1)
  const hl = Math.min(22, len * 0.5)
  const bx = x2 - Math.cos(a) * hl * 0.8
  const by = y2 - Math.sin(a) * hl * 0.8
  const px = Math.cos(a + Math.PI / 2) * hl * 0.45
  const py = Math.sin(a + Math.PI / 2) * hl * 0.45
  return (
    <g>
      <line x1={x1} y1={y1} x2={bx} y2={by} stroke={color} strokeWidth={w} strokeLinecap="round" />
      <polygon points={`${x2},${y2} ${bx + px},${by + py} ${bx - px},${by - py}`} fill={color} />
    </g>
  )
}

function Head({ n, title, sub }: { n: string; title: string; sub?: string }) {
  return (
    <g>
      <text x={80} y={92} fill={ORANGE} className="font-mono" fontSize={20} letterSpacing={4}>
        {n}
      </text>
      <text x={80} y={160} fill={INK} className="font-display" fontSize={66} fontWeight={900}>
        {title}
      </text>
      {sub && (
        <text x={80} y={200} fill={INK} fillOpacity={0.62} className="font-body" fontSize={22}>
          {sub}
        </text>
      )}
    </g>
  )
}

function Backdrop({ shift }: { shift: number }) {
  const waves = [0, 1, 2, 3, 4, 5].map((k) => {
    const y0 = WATER + 22 + k * 36
    const amp = 3 + k * 1.6
    const len = 140 + k * 40
    const speed = 1 + k * 0.45
    let d = ''
    for (let x = -20; x <= W + 20; x += 20) {
      const y = y0 + Math.sin((x + shift * speed) / len * Math.PI * 2) * amp
      d += (d ? 'L' : 'M') + x + ',' + y.toFixed(1)
    }
    return <path key={k} d={d} fill="none" stroke={CYAN} strokeOpacity={0.12 + k * 0.03} strokeWidth={2} />
  })
  return (
    <g>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#07090e" />
          <stop offset="0.6" stopColor="#2a1311" />
          <stop offset="1" stopColor="#6b2a14" />
        </linearGradient>
        <linearGradient id="river" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#123446" />
          <stop offset="1" stopColor="#050c12" />
        </linearGradient>
        <radialGradient id="sun" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff8a3c" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff5a1f" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width={W} height={H} fill="url(#sky)" />
      <circle cx={930} cy={WATER - 10} r={230} fill="url(#sun)" />
      <polygon
        points={`0,${WATER} 0,380 130,330 260,380 380,300 520,390 640,350 760,410 900,340 1040,400 1160,330 1280,380 1280,${WATER}`}
        fill="#0b0d12"
        opacity={0.92}
      />
      <polygon
        points={`0,${WATER} 0,430 180,400 320,440 500,410 700,445 900,415 1100,445 1280,420 1280,${WATER}`}
        fill="#07090c"
      />
      <rect y={WATER} width={W} height={H - WATER} fill="url(#river)" />
      <rect x={760} y={WATER + 4} width={340} height={4} fill={ORANGE} opacity={0.5} />
      <rect x={810} y={WATER + 16} width={240} height={3} fill={ORANGE} opacity={0.3} />
      {waves}
    </g>
  )
}

function Bike({ rot }: { rot: number }) {
  const spokes = [0, 60, 120].map((a) => (
    <line key={a} x1={0} y1={-34} x2={0} y2={34} stroke={INK} strokeOpacity={0.55} strokeWidth={3} transform={`rotate(${a})`} />
  ))
  const lugs = Array.from({ length: 12 }, (_, i) => (
    <rect key={i} x={-4} y={-46} width={8} height={12} fill={ORANGE} transform={`rotate(${i * 30})`} />
  ))
  return (
    <g strokeLinecap="round" strokeLinejoin="round">
      <g transform="translate(-95,0)">
        <g transform={`rotate(${rot})`}>
          {lugs}
          {spokes}
        </g>
        <circle r={38} fill="none" stroke={INK} strokeWidth={6} />
      </g>
      <g transform="translate(95,0)">
        <g transform={`rotate(${rot})`}>{spokes}</g>
        <circle r={38} fill="none" stroke={INK} strokeWidth={6} />
      </g>
      <line x1={-95} y1={0} x2={-20} y2={-10} stroke={INK} strokeWidth={7} />
      <line x1={95} y1={0} x2={62} y2={-72} stroke={INK} strokeWidth={7} />
      <line x1={62} y1={-72} x2={50} y2={-86} stroke={INK} strokeWidth={6} />
      <rect x={-34} y={-46} width={64} height={38} rx={6} fill="#1b1f27" stroke={INK} strokeWidth={3} />
      <path d="M-76,-50 L-14,-58 L28,-66 L62,-60 L56,-40 L-62,-30 Z" fill={ORANGE} />
      <path d="M-30,-62 L30,-112" stroke={INK} strokeWidth={18} />
      <path d="M-24,-52 L16,-30 L8,2" stroke={INK} strokeWidth={9} fill="none" />
      <path d="M30,-106 L54,-86" stroke={INK} strokeWidth={8} />
      <circle cx={44} cy={-130} r={14} fill={INK} />
      <path d="M32,-134 A14,14 0 0 1 58,-136 L58,-128 L32,-126 Z" fill={ORANGE} />
    </g>
  )
}

function Spray({ x, y, t, amount }: { x: number; y: number; t: number; amount: number }) {
  const n = 26
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const r = ((i * 37) % 11) / 11
        const ph = (t * 1.5 + i / n) % 1
        const px = x - ph * (150 + r * 260) * amount
        const py = y - Math.sin(ph * Math.PI) * (30 + r * 90) * amount
        return <circle key={i} cx={px} cy={py} r={(2 + r * 4) * (1 - ph * 0.5)} fill="#dff6fb" opacity={(1 - ph) * 0.8 * clamp(amount)} />
      })}
    </g>
  )
}

function SceneOpen({ p, t }: { p: number; t: number }) {
  const bx = -200 + ease(seg(p, 0, 0.9)) * 1100
  return (
    <g>
      <g transform={`translate(${bx},${WATER - 38 - Math.sin(t * 9) * 2})`}>
        <Spray x={-130} y={38} t={t} amount={1} />
        <Bike rot={t * 900} />
      </g>
      <g opacity={ease(seg(p, 0.1, 0.35))}>
        <text x={80} y={92} fill={ORANGE} className="font-mono" fontSize={20} letterSpacing={4}>
          湖南 · 麻阳锦江 · 2026.10.25
        </text>
        <text x={72} y={250} fill={INK} className="font-display" fontSize={170} fontWeight={900}>
          水上漂
        </text>
      </g>
      <g opacity={ease(seg(p, 0.45, 0.7))}>
        <text x={80} y={330} fill={INK} fillOpacity={0.8} className="font-body" fontSize={30}>
          张雪 MX450 两栖改装摩托车 · 从物理角度看
        </text>
        <text x={80} y={410} fill={ORANGE} className="font-numeral" fontSize={84} fontWeight={900}>
          40.74
          <tspan fontSize={34} className="font-mono" fill={INK} dx={10}>
            km
          </tspan>
        </text>
      </g>
    </g>
  )
}

function SceneForces({ p, t }: { p: number; t: number }) {
  const g = ease(seg(p, 0.12, 0.35))
  const l = ease(seg(p, 0.4, 0.62))
  const eq = ease(seg(p, 0.72, 0.9))
  const bob = Math.sin(t * 7) * 2
  return (
    <g>
      <Head n="01 / 受力" title="谁在托着车?" sub="答案不是浮力,是水的动升力" />
      <g transform={`translate(640,${WATER - 38 + bob})`}>
        <Spray x={-130} y={38} t={t} amount={0.9} />
        <Bike rot={t * 900} />
      </g>
      <Arrow x1={650} y1={352} x2={650} y2={352 + 118 * g} color={ORANGE} w={8} />
      <Arrow x1={545} y1={640} x2={545} y2={640 - 150 * l} color={CYAN} w={8} />
      <Arrow x1={735} y1={640} x2={735} y2={640 - 150 * l} color={CYAN} w={8} />
      <g opacity={g}>
        <text x={700} y={400} fill={ORANGE} className="font-mono" fontSize={26}>
          G ≈ 2000 N
        </text>
        <text x={700} y={430} fill={INK} fillOpacity={0.6} className="font-body" fontSize={18}>
          车+人约 200 kg(估算)
        </text>
      </g>
      <g opacity={l}>
        <text x={300} y={640} fill={CYAN} className="font-mono" fontSize={26} textAnchor="middle">
          F升
        </text>
      </g>
      <g opacity={eq}>
        <rect x={80} y={650} width={560} height={48} fill={ORANGE} />
        <text x={100} y={683} fill="#05070a" className="font-body" fontSize={26} fontWeight={700}>
          F升 = G → 车身悬在水面上
        </text>
      </g>
    </g>
  )
}

function SceneDynamic({ p, t }: { p: number; t: number }) {
  const pv = seg(p, 0.08, 0.85)
  const v = 22 * pv
  const lift = 5 * v * v
  const ratio = clamp(lift / 2000)
  const sink = 70 * (1 - ease(ratio))
  const kmh = v * 3.6
  const ok = lift >= 2000
  return (
    <g>
      <Head n="02 / 动压" title="速度越快,水越硬" sub="水的动压 ½ρv² 随速度的平方增长" />
      <g transform={`translate(520,${WATER - 38 + sink})`}>
        <Spray x={-130} y={38 - sink} t={t} amount={clamp(v / 22)} />
        <Bike rot={t * v * 45} />
      </g>
      <g transform="translate(900,230)">
        <text x={0} y={0} fill={INK} fillOpacity={0.6} className="font-mono" fontSize={16} letterSpacing={3}>
          车速 v
        </text>
        <text x={0} y={70} fill={INK} className="font-numeral" fontSize={72} fontWeight={900}>
          {v.toFixed(1)}
          <tspan className="font-mono" fontSize={22} dx={8}>
            m/s
          </tspan>
        </text>
        <text x={0} y={104} fill={INK} fillOpacity={0.6} className="font-mono" fontSize={20}>
          ≈ {kmh.toFixed(0)} km/h
        </text>
        <text x={0} y={170} fill={CYAN} className="font-mono" fontSize={22}>
          F升 ≈ 5·v² = {lift.toFixed(0)} N
        </text>
        <g transform="translate(0,200)">
          <rect x={0} y={0} width={300} height={22} fill="#fff" fillOpacity={0.08} />
          <rect x={0} y={0} width={Math.min(1.25, lift / 2000) * 240} height={22} fill={ok ? ORANGE : CYAN} />
          <rect x={238} y={-10} width={4} height={42} fill={INK} />
          <text x={240} y={58} fill={INK} className="font-mono" fontSize={16} textAnchor="middle">
            G = 2000 N
          </text>
        </g>
        <text x={0} y={310} fill={ok ? ORANGE : INK} className="font-display" fontSize={34} fontWeight={900}>
          {ok ? '托住了:进入滑行' : '升力不足:车在下沉'}
        </text>
      </g>
      <text x={80} y={690} fill={INK} fillOpacity={0.5} className="font-body" fontSize={17}>
        假设有效升力面积×升力系数 ≈ 0.01 m²。量级估算,非官方数据。
      </text>
    </g>
  )
}

function SceneSlap({ p, t }: { p: number; t: number }) {
  const cx = 540
  const cy = 380
  const contactY = cy + 130
  const rot = t * 700
  const a1 = ease(seg(p, 0.25, 0.45))
  const a2 = ease(seg(p, 0.5, 0.7))
  return (
    <g>
      <Head n="03 / 拍水" title="轮子在“拍水”" sub="每一次拍击,都把水推向后下方" />
      <rect x={0} y={contactY} width={W} height={H - contactY} fill="#0a2230" />
      <line x1={0} y1={contactY} x2={W} y2={contactY} stroke={CYAN} strokeOpacity={0.5} strokeWidth={2} />
      <g transform={`translate(${cx},${cy})`}>
        <g transform={`rotate(${rot})`}>
          {Array.from({ length: 12 }, (_, i) => (
            <rect key={i} x={-9} y={-146} width={18} height={26} fill={ORANGE} transform={`rotate(${i * 30})`} />
          ))}
          {[0, 45, 90, 135].map((a) => (
            <line key={a} x1={0} y1={-118} x2={0} y2={118} stroke={INK} strokeOpacity={0.4} strokeWidth={4} transform={`rotate(${a})`} />
          ))}
        </g>
        <circle r={120} fill="none" stroke={INK} strokeWidth={10} />
        <circle r={14} fill={INK} />
      </g>
      {Array.from({ length: 28 }, (_, i) => {
        const r = ((i * 53) % 13) / 13
        const ph = (t * 1.8 + i / 28) % 1
        const px = cx - 20 - ph * (240 + r * 320)
        const py = contactY - 10 - Math.sin(ph * Math.PI) * (40 + r * 110)
        return <circle key={i} cx={px} cy={py} r={2 + r * 5} fill="#dff6fb" opacity={(1 - ph) * 0.85} />
      })}
      <g opacity={a1}>
        <Arrow x1={cx - 10} y1={contactY + 6} x2={cx - 190} y2={contactY + 80} color={ORANGE} w={7} />
        <text x={cx - 420} y={contactY + 125} fill={ORANGE} className="font-body" fontSize={24} fontWeight={700}>
          水被推向 后下方
        </text>
      </g>
      <g opacity={a2}>
        <Arrow x1={cx + 20} y1={contactY - 4} x2={cx + 200} y2={contactY - 100} color={CYAN} w={7} />
        <text x={cx + 215} y={contactY - 110} fill={CYAN} className="font-body" fontSize={24} fontWeight={700}>
          反作用力
        </text>
        <text x={cx + 215} y={contactY - 78} fill={INK} fillOpacity={0.75} className="font-body" fontSize={20}>
          向上托起 + 向前推进
        </text>
      </g>
      <g opacity={ease(seg(p, 0.78, 0.94))}>
        <text x={80} y={690} fill={INK} className="font-mono" fontSize={22}>
          F = Δ(mv) / Δt — 动量定理
        </text>
      </g>
    </g>
  )
}

function SceneCritical({ p, t }: { p: number; t: number }) {
  const px0 = 120
  const py0 = 590
  const cw = 640
  const ch = 380
  const vmax = 30
  const fmax = 4500
  const X = (v: number) => px0 + (v / vmax) * cw
  const Y = (f: number) => py0 - (f / fmax) * ch
  let d = ''
  for (let v = 0; v <= vmax; v += 0.5) d += (d ? 'L' : 'M') + X(v).toFixed(1) + ',' + Y(5 * v * v).toFixed(1)
  const v = 28 * ease(seg(p, 0.1, 0.9))
  const f = 5 * v * v
  const ok = v >= 20
  const draw = ease(seg(p, 0, 0.3))
  return (
    <g>
      <Head n="04 / 临界速度" title="过线才能飘" sub="升力曲线穿过重力线的那一点" />
      <rect x={px0} y={Y(4500)} width={X(20) - px0} height={py0 - Y(4500)} fill="#ff5a1f" fillOpacity={0.07} />
      <rect x={X(20)} y={Y(4500)} width={X(30) - X(20)} height={py0 - Y(4500)} fill={CYAN} fillOpacity={0.07} />
      <line x1={px0} y1={py0} x2={px0 + cw} y2={py0} stroke={INK} strokeOpacity={0.5} strokeWidth={2} />
      <line x1={px0} y1={py0} x2={px0} y2={py0 - ch} stroke={INK} strokeOpacity={0.5} strokeWidth={2} />
      <text x={px0 + cw} y={py0 + 36} fill={INK} fillOpacity={0.6} className="font-mono" fontSize={16} textAnchor="end">
        速度 v (m/s)
      </text>
      <text x={px0 + 8} y={py0 - ch - 10} fill={INK} fillOpacity={0.6} className="font-mono" fontSize={16}>
        力 (N)
      </text>
      <line x1={px0} y1={Y(2000)} x2={px0 + cw} y2={Y(2000)} stroke={ORANGE} strokeWidth={3} strokeDasharray="10 8" opacity={draw} />
      <text x={px0 + cw - 4} y={Y(2000) - 12} fill={ORANGE} className="font-mono" fontSize={18} textAnchor="end" opacity={draw}>
        重力 G = 2000 N
      </text>
      <path d={d} fill="none" stroke={CYAN} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <text x={X(25)} y={Y(5 * 25 * 25) + 4} fill={CYAN} className="font-mono" fontSize={18} textAnchor="end" opacity={draw}>
        F升 = 5v²
      </text>
      <text x={X(20)} y={py0 + 36} fill={INK} className="font-mono" fontSize={16} textAnchor="middle">
        20
      </text>
      <circle cx={X(v)} cy={Y(f)} r={11} fill={ok ? ORANGE : INK} stroke="#05070a" strokeWidth={3} />
      <line x1={X(v)} y1={Y(f)} x2={X(v)} y2={py0} stroke={INK} strokeOpacity={0.3} strokeDasharray="4 6" />
      <g transform="translate(860,260)">
        <text x={0} y={0} fill={ok ? CYAN : ORANGE} className="font-display" fontSize={52} fontWeight={900}>
          {ok ? '滑行' : '下沉'}
        </text>
        <text x={0} y={44} fill={INK} fillOpacity={0.8} className="font-body" fontSize={22}>
          {ok ? '车身抬起,接触面小,阻力占比下降' : '排水造波,阻力暴增,越慢越沉'}
        </text>
        <text x={0} y={120} fill={INK} className="font-numeral" fontSize={64} fontWeight={900}>
          {v.toFixed(1)}
          <tspan className="font-mono" fontSize={20} dx={8}>
            m/s
          </tspan>
        </text>
        <g transform={`translate(0,${190 + (ok ? 0 : 26)})`}>
          <g transform={`scale(0.6) translate(130,0)`}>
            <Bike rot={t * 600} />
          </g>
        </g>
      </g>
    </g>
  )
}

function SceneTurns({ p }: { p: number }) {
  const lane = 840
  const arc = 78.5
  const cyc = lane + arc
  const total = 7 * cyc + lane
  const d = ease(seg(p, 0.06, 0.94)) * total
  const k = Math.min(7, Math.floor(d / cyc))
  const r = d - k * cyc
  const dir = k % 2 === 0 ? 1 : -1
  let x: number
  let y: number
  let f = 1
  if (r <= lane) {
    x = dir > 0 ? 220 + r : 1060 - r
    y = 200 + 50 * k
  } else {
    const a = ((r - lane) / arc) * Math.PI
    const cxx = dir > 0 ? 1060 : 220
    x = cxx + dir * 25 * Math.sin(a)
    y = 200 + 50 * k + 25 - 25 * Math.cos(a)
    f = 1 - 0.3 * Math.sin(a)
  }
  let path = 'M220,200'
  for (let i = 0; i < 8; i++) {
    path += i % 2 === 0 ? ' H1060' : ' H220'
    if (i < 7) path += ` A25,25 0 0 ${i % 2 === 0 ? 1 : 0} ${i % 2 === 0 ? 1060 : 220},${250 + 50 * i}`
  }
  const turns = k + (r > lane ? 1 : 0)
  return (
    <g>
      <rect width={W} height={H} fill="#06141c" />
      <rect x={160} y={160} width={960} height={440} rx={4} fill="#0b2a3a" />
      <rect x={160} y={160} width={960} height={440} fill="none" stroke={CYAN} strokeOpacity={0.35} strokeWidth={2} />
      <path d={path} fill="none" stroke={INK} strokeOpacity={0.15} strokeWidth={3} />
      <path d={path} fill="none" stroke={ORANGE} strokeWidth={4} pathLength={total} strokeDasharray={`${d} ${total}`} />
      <circle cx={x} cy={y} r={16} fill={ORANGE} opacity={0.25} />
      <circle cx={x} cy={y} r={8} fill={INK} />
      <Head n="05 / 转弯" title="七次掉头" sub="水面几乎没有侧向抓地,转弯靠倾斜车身借水的侧向力" />
      <g transform="translate(160,640)">
        <text x={0} y={0} fill={INK} className="font-mono" fontSize={22}>
          转弯 <tspan fill={ORANGE}>{turns}</tspan> / 7
        </text>
        <text x={280} y={0} fill={INK} className="font-mono" fontSize={22}>
          v ≈ {(20 * f).toFixed(1)} m/s
        </text>
        <rect x={520} y={-18} width={300} height={16} fill="#fff" fillOpacity={0.1} />
        <rect x={520} y={-18} width={300 * f * (20 / 20) * 1} height={16} fill={f < 0.85 ? ORANGE : CYAN} />
        <rect x={520 + 300 * 0.78} y={-26} width={3} height={32} fill={INK} />
        <text x={520 + 300 * 0.78} y={26} fill={INK} fillOpacity={0.6} className="font-mono" fontSize={14} textAnchor="middle">
          临界
        </text>
      </g>
    </g>
  )
}

function SceneOutro({ p }: { p: number }) {
  const rows = [
    ['01', '靠动升力,不靠浮力', 'F升 ∝ v²'],
    ['02', '轮子拍水,动量换升力与推力', 'F = Δp / Δt'],
    ['03', '速度必须守在临界线之上', 'v > v临界'],
  ]
  return (
    <g>
      <text x={80} y={92} fill={ORANGE} className="font-mono" fontSize={20} letterSpacing={4}>
        总结
      </text>
      <text x={80} y={190} fill={INK} className="font-display" fontSize={92} fontWeight={900}>
        快,就是浮力
      </text>
      {rows.map((row, i) => {
        const o = ease(seg(p, 0.15 + i * 0.15, 0.3 + i * 0.15))
        return (
          <g key={i} opacity={o} transform={`translate(80,${300 + i * 80 + (1 - o) * 20})`}>
            <line x1={0} y1={-44} x2={1000} y2={-44} stroke={INK} strokeOpacity={0.2} />
            <text x={0} y={0} fill={ORANGE} className="font-mono" fontSize={22}>
              {row[0]}
            </text>
            <text x={80} y={2} fill={INK} className="font-body" fontSize={32} fontWeight={500}>
              {row[1]}
            </text>
            <text x={1000} y={2} fill={CYAN} className="font-mono" fontSize={26} textAnchor="end">
              {row[2]}
            </text>
          </g>
        )
      })}
      <g opacity={ease(seg(p, 0.7, 0.9))}>
        <text x={80} y={640} fill={INK} fillOpacity={0.6} className="font-body" fontSize={18}>
          事件信息来源:新华网、澎湃新闻、新浪新闻。物理数值为作者的量级估算,非官方数据。
        </text>
      </g>
    </g>
  )
}

function Stage({ t }: { t: number }) {
  let start = 0
  let idx = 0
  for (let i = 0; i < SCENES.length; i++) {
    if (t < start + SCENES[i].dur || i === SCENES.length - 1) {
      idx = i
      break
    }
    start += SCENES[i].dur
  }
  const dur = SCENES[idx].dur
  const local = t - start
  const p = clamp(local / dur)
  const op = Math.min(seg(local, 0, 0.5), seg(dur - local, 0, 0.5))
  const flow = t * 320
  const hideBackdrop = idx === 5 || idx === 4 || idx === 6
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full block">
      <rect width={W} height={H} fill="#05070a" />
      {idx === 3 ? (
        <rect width={W} height={H} fill="#07101a" />
      ) : hideBackdrop ? (
        <rect width={W} height={H} fill={idx === 6 ? '#0a0c10' : '#080b10'} />
      ) : (
        <Backdrop shift={flow} />
      )}
      <g opacity={op}>
        {idx === 0 && <SceneOpen p={p} t={t} />}
        {idx === 1 && <SceneForces p={p} t={t} />}
        {idx === 2 && <SceneDynamic p={p} t={t} />}
        {idx === 3 && <SceneSlap p={p} t={t} />}
        {idx === 4 && <SceneCritical p={p} t={t} />}
        {idx === 5 && <SceneTurns p={p} />}
        {idx === 6 && <SceneOutro p={p} />}
      </g>
    </svg>
  )
}

export default function App() {
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(true)
  const last = useRef<number | null>(null)

  useEffect(() => {
    if (!playing) {
      last.current = null
      return
    }
    let raf = 0
    const tick = (now: number) => {
      if (last.current != null) {
        const dt = (now - last.current) / 1000
        setT((x) => (x + dt >= TOTAL ? 0 : x + dt))
      }
      last.current = now
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing])

  const toggle = useCallback(() => setPlaying((x) => !x), [])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggle])

  const starts = SCENES.reduce<number[]>((a, s, i) => [...a, i === 0 ? 0 : a[i - 1] + SCENES[i - 1].dur], [])
  const cur = starts.reduce((a, s, i) => (t >= s ? i : a), 0)

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setT(clamp((e.clientX - r.left) / r.width) * TOTAL * 0.9999)
  }

  return (
    <div className="h-full w-full flex flex-col items-center justify-center gap-4 px-4 py-4 bg-[#05070a]">
      <div
        className="relative overflow-hidden border border-white/10 shadow-[0_30px_120px_rgba(255,90,31,0.12)]"
        style={{ width: 'min(100%, calc((100vh - 120px) * 16 / 9))', aspectRatio: '16 / 9' }}
        onClick={toggle}
      >
        <Stage t={t} />
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="size-24 rounded-full bg-[#ff5a1f] flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="#05070a">
                <path d="M7 4l14 8-14 8z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 w-full" style={{ maxWidth: 'min(100%, calc((100vh - 120px) * 16 / 9))' }}>
        <button
          onClick={toggle}
          aria-label={playing ? '暂停' : '播放'}
          className="size-11 shrink-0 rounded-full bg-[#ff5a1f] text-[#05070a] flex items-center justify-center hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5fd0e6] cursor-pointer"
        >
          {playing ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <rect x="5" y="4" width="5" height="16" />
              <rect x="14" y="4" width="5" height="16" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7 4l14 8-14 8z" />
            </svg>
          )}
        </button>
        <div className="flex-1">
          <div className="relative h-8 cursor-pointer flex items-center" onClick={scrub}>
            <div className="relative h-1.5 w-full bg-white/10">
              <div className="absolute inset-y-0 left-0 bg-[#ff5a1f]" style={{ width: `${(t / TOTAL) * 100}%` }} />
              {starts.slice(1).map((s) => (
                <div key={s} className="absolute -top-1 h-3.5 w-px bg-white/40" style={{ left: `${(s / TOTAL) * 100}%` }} />
              ))}
            </div>
          </div>
          <div className="flex font-mono text-[11px] tracking-widest text-white/50">
            {SCENES.map((s, i) => (
              <button
                key={s.label}
                onClick={() => setT(starts[i])}
                className={`text-left cursor-pointer hover:text-white ${i === cur ? 'text-[#ff5a1f]' : ''}`}
                style={{ width: `${(s.dur / TOTAL) * 100}%` }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
        <div className="font-mono text-xs text-white/60 tabular-nums w-24 text-right">
          {Math.floor(t)}s / {TOTAL}s
        </div>
      </div>
    </div>
  )
}
