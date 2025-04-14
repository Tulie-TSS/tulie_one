import { useState, useEffect, useCallback } from "react";
import type { OKR, KeyResult, KPI, OKRPeriod } from "@/types/strategy.types";

interface UseOKRsResult {
  okrs: OKR[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOKRs(): UseOKRsResult {
  const [okrs, setOKRs] = useState<OKR[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOKRs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/okrs");
      if (!res.ok) throw new Error("Failed to fetch OKRs");
      const data = await res.json();
      setOKRs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOKRs();
  }, [fetchOKRs]);

  return { okrs, loading, error, refetch: fetchOKRs };
}

interface UseKPIsResult {
  kpis: KPI[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useKPIs(): UseKPIsResult {
  const [kpis, setKPIs] = useState<KPI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKPIs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/kpis");
      if (!res.ok) throw new Error("Failed to fetch KPIs");
      const data = await res.json();
      setKPIs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKPIs();
  }, [fetchKPIs]);

  return { kpis, loading, error, refetch: fetchKPIs };
}

interface UseOKRPeriodsResult {
  periods: OKRPeriod[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useOKRPeriods(): UseOKRPeriodsResult {
  const [periods, setPeriods] = useState<OKRPeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPeriods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/okr-periods");
      if (!res.ok) throw new Error("Failed to fetch OKR periods");
      const data = await res.json();
      setPeriods(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPeriods();
  }, [fetchPeriods]);

  return { periods, loading, error, refetch: fetchPeriods };
}

export function getOKRsByCategory(okrs: OKR[]) {
  return okrs.reduce(
    (acc, okr) => {
      if (!acc[okr.category]) {
        acc[okr.category] = [];
      }
      acc[okr.category].push(okr);
      return acc;
    },
    {} as Record<string, OKR[]>,
  );
}

export function getOKRsByStatus(okrs: OKR[]) {
  return okrs.reduce(
    (acc, okr) => {
      if (!acc[okr.status]) {
        acc[okr.status] = [];
      }
      acc[okr.status].push(okr);
      return acc;
    },
    {} as Record<string, OKR[]>,
  );
}

export function getKPIsByCategory(kpis: KPI[]) {
  return kpis.reduce(
    (acc, kpi) => {
      if (!acc[kpi.category]) {
        acc[kpi.category] = [];
      }
      acc[kpi.category].push(kpi);
      return acc;
    },
    {} as Record<string, KPI[]>,
  );
}

export function calculateKPIProgress(kpi: KPI): number {
  if (kpi.metric_type === "boolean") {
    return kpi.current_value === 1 ? 100 : 0;
  }
  if (kpi.target_value === 0) return 0;
  return Math.min(100, (kpi.current_value / kpi.target_value) * 100);
}

export function calculateKeyResultProgress(kr: KeyResult): number {
  if (kr.metric_type === "boolean") {
    return kr.current_value === 1 ? 100 : 0;
  }
  if (kr.metric_type === "percentage") {
    return Math.min(100, kr.current_value);
  }
  if (kr.target_value === 0) return 0;
  return Math.min(100, (kr.current_value / kr.target_value) * 100);
}
