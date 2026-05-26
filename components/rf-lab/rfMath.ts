export type PatternPoint = {
  thetaDeg?: number;
  phiDeg?: number;
  gainDb?: number;
  directivityDb?: number;
  rhcpDb?: number | null;
  lhcpDb?: number | null;
  EthetaRe?: number;
  EthetaIm?: number;
  EphiRe?: number;
  EphiIm?: number;
  Etheta?: { re?: number; im?: number };
  Ephi?: { re?: number; im?: number };
  uRel?: number;
};

export function numberOr(value: any, fallback = 0): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function getPattern(result: any): PatternPoint[] {
  const pattern =
    result?.farfield?.pattern ||
    result?.farfieldRawMom?.pattern ||
    result?.pattern ||
    result?.sionnaPayload?.customPatternJson ||
    [];
  return Array.isArray(pattern) ? pattern : [];
}

export function getGain(p: PatternPoint): number {
  return numberOr(p.gainDb ?? p.directivityDb, -300);
}

export function normalize01(value: number, min: number, max: number): number {
  const span = Math.max(max - min, 1e-9);
  return Math.max(0, Math.min(1, (value - min) / span));
}

export function nearestPhiCut(pattern: PatternPoint[], phiDeg: number): PatternPoint[] {
  if (!pattern.length) return [];
  const norm = (x: number) => ((x % 360) + 360) % 360;
  const target = norm(phiDeg);
  const scored = pattern.map((p) => {
    const phi = norm(numberOr(p.phiDeg, 0));
    const d = Math.min(Math.abs(phi - target), 360 - Math.abs(phi - target));
    return { p, d };
  });
  const minD = Math.min(...scored.map((x) => x.d));
  return scored
    .filter((x) => Math.abs(x.d - minD) < 1e-9)
    .map((x) => x.p)
    .sort((a, b) => numberOr(a.thetaDeg) - numberOr(b.thetaDeg));
}

export function computeRadiationMetrics(result: any) {
  const pattern = getPattern(result);
  if (!pattern.length) return { ok: false, reason: "No hay patrón de radiación." };

  const gains = pattern.map(getGain);
  const maxGain = Math.max(...gains);
  const minGain = Math.min(...gains);
  const best = pattern[gains.indexOf(maxGain)];
  const thetaMax = numberOr(best?.thetaDeg, 0);
  const phiMax = numberOr(best?.phiDeg, 0);

  const front = pattern.filter((p) => numberOr(p.thetaDeg, 180) <= 30);
  const back = pattern.filter((p) => numberOr(p.thetaDeg, 0) >= 150);
  const frontMax = front.length ? Math.max(...front.map(getGain)) : maxGain;
  const backMax = back.length ? Math.max(...back.map(getGain)) : minGain;

  const cut = nearestPhiCut(pattern, phiMax);
  const threshold = maxGain - 3;
  const above = cut.filter((p) => getGain(p) >= threshold);
  const hpbw =
    above.length >= 2
      ? Math.max(...above.map((p) => numberOr(p.thetaDeg))) -
        Math.min(...above.map((p) => numberOr(p.thetaDeg)))
      : null;

  const sorted = [...pattern].sort((a, b) => getGain(b) - getGain(a));
  let sidelobe: number | null = null;
  for (const p of sorted) {
    const dt = Math.abs(numberOr(p.thetaDeg) - thetaMax);
    const dpRaw = Math.abs(numberOr(p.phiDeg) - phiMax);
    const dp = Math.min(dpRaw, 360 - dpRaw);
    if (dt > 20 || dp > 40) {
      sidelobe = getGain(p);
      break;
    }
  }

  const rhcp = pattern.map((p) => Number(p.rhcpDb ?? -300)).filter(Number.isFinite);
  const lhcp = pattern.map((p) => Number(p.lhcpDb ?? -300)).filter(Number.isFinite);
  const rhcpMax = rhcp.length ? Math.max(...rhcp) : null;
  const lhcpMax = lhcp.length ? Math.max(...lhcp) : null;

  let polarization = "Lineal / no determinada";
  if (rhcpMax !== null && lhcpMax !== null) {
    if (rhcpMax - lhcpMax > 3) polarization = "RHCP dominante";
    else if (lhcpMax - rhcpMax > 3) polarization = "LHCP dominante";
    else polarization = "Mixta / lineal aproximada";
  }

  return {
    ok: true,
    numPoints: pattern.length,
    maxGainDb: maxGain,
    minGainDb: minGain,
    thetaMaxDeg: thetaMax,
    phiMaxDeg: phiMax,
    hpbwDeg: hpbw,
    frontBackDb: frontMax - backMax,
    sideLobeLevelDb: sidelobe === null ? null : sidelobe - maxGain,
    rhcpMaxDb: rhcpMax,
    lhcpMaxDb: lhcpMax,
    polarization,
  };
}

export function getCurrentMetrics(result: any) {
  const currents = Array.isArray(result?.currents) ? result.currents : [];
  if (!currents.length) return { ok: false };
  const mags = currents.map((c: any) => numberOr(c.abs, 0));
  const max = Math.max(...mags);
  const min = Math.min(...mags);
  return { ok: true, numSegments: currents.length, maxCurrent: max, minCurrent: min, maxSegment: mags.indexOf(max) };
}
