"use client";

import React from "react";
import { SParameterPanel } from "./SParameterPanel";
import { RadiationMetricsPanel } from "./RadiationMetricsPanel";
import { Radiation3DViewer } from "./Radiation3DViewer";
import { PolarCut2D } from "./PolarCut2D";
import { CurrentDistributionViewer } from "./CurrentDistributionViewer";
import { FieldPlaneViewer } from "./FieldPlaneViewer";

export function RFVisualDashboard({
  result,
  fdtdResult,
}: {
  result: any;
  fdtdResult?: any;
}) {
  if (!result) {
    return null;
  }

  return (
    <div className="mt-6 grid gap-5">
      <SParameterPanel result={result} />
      <RadiationMetricsPanel result={result} />
      <div className="grid gap-5 xl:grid-cols-2">
        <Radiation3DViewer result={result} />
        <PolarCut2D result={result} />
      </div>
      <CurrentDistributionViewer result={result} />
      <FieldPlaneViewer fdtdResult={fdtdResult} />
    </div>
  );
}
