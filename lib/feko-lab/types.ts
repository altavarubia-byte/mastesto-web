export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export type ApiStatus = "idle" | "loading" | "ok" | "error";

export type MetricValue = string | number | null | undefined;

export interface ComplexValue {
  re?: number;
  im?: number;
  abs?: number;
}

export interface PatternPoint {
  thetaDeg?: number;
  phiDeg?: number;
  directivityDb?: number;
  gainDb?: number;
  rhcpDb?: number;
  lhcpDb?: number;
  uRel?: number;
  EthetaRe?: number;
  EthetaIm?: number;
  EphiRe?: number;
  EphiIm?: number;
}

export interface FekoTemplateMap {
  [key: string]: JsonObject;
}

export interface ApiCallResult {
  ok: boolean;
  endpoint: string;
  data: JsonValue;
  error?: string;
}

export interface ActionLogItem {
  id: string;
  label: string;
  endpoint: string;
  ok: boolean;
  at: string;
}

export interface ExtractedMetrics {
  ok?: boolean;
  model?: string;
  solverClass?: string;
  s11Db?: number;
  vswr?: number;
  zin?: ComplexValue;
  directivityMaxDb?: number;
  thetaMaxDeg?: number;
  phiMaxDeg?: number;
  numPatternPoints?: number;
  qualityScore?: number;
  confidence?: string;
}

export interface ChartSample {
  label: string;
  x: number;
  s11Db?: number;
  vswr?: number;
  value?: number;
}
