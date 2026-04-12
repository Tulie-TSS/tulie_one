import { useState, useEffect, useCallback } from "react";
import type {
  Deal,
  MonthlyFinance,
  HiringPlan,
  SalesTarget,
  ContentCalendarItem,
  MarketingMetric,
  GrowthTarget,
  Product,
  Milestone,
  ContentPillar,
  SeoTarget,
  MarketingChannel,
} from "@/types/strategy.types";

interface UseDealsResult {
  deals: Deal[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDeals(): UseDealsResult {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/deals");
      if (!res.ok) throw new Error("Failed to fetch deals");
      const data = await res.json();
      setDeals(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  return { deals, loading, error, refetch: fetchDeals };
}

interface UseFinanceResult {
  finance: MonthlyFinance[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useFinance(): UseFinanceResult {
  const [finance, setFinance] = useState<MonthlyFinance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/finance");
      if (!res.ok) throw new Error("Failed to fetch finance");
      const data = await res.json();
      setFinance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFinance();
  }, [fetchFinance]);

  return { finance, loading, error, refetch: fetchFinance };
}

interface UseHiringPlansResult {
  hiringPlans: HiringPlan[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useHiringPlans(): UseHiringPlansResult {
  const [hiringPlans, setHiringPlans] = useState<HiringPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHiringPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/hiring");
      if (!res.ok) throw new Error("Failed to fetch hiring plans");
      const data = await res.json();
      setHiringPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHiringPlans();
  }, [fetchHiringPlans]);

  return { hiringPlans, loading, error, refetch: fetchHiringPlans };
}

interface UseSalesTargetsResult {
  salesTargets: SalesTarget[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSalesTargets(): UseSalesTargetsResult {
  const [salesTargets, setSalesTargets] = useState<SalesTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSalesTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/sales-targets");
      if (!res.ok) throw new Error("Failed to fetch sales targets");
      const data = await res.json();
      setSalesTargets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSalesTargets();
  }, [fetchSalesTargets]);

  return { salesTargets, loading, error, refetch: fetchSalesTargets };
}

interface UseContentCalendarResult {
  contentCalendar: ContentCalendarItem[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContentCalendar(): UseContentCalendarResult {
  const [contentCalendar, setContentCalendar] = useState<ContentCalendarItem[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentCalendar = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/content-calendar");
      if (!res.ok) throw new Error("Failed to fetch content calendar");
      const data = await res.json();
      setContentCalendar(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentCalendar();
  }, [fetchContentCalendar]);

  return { contentCalendar, loading, error, refetch: fetchContentCalendar };
}

interface UseMarketingMetricsResult {
  marketingMetrics: MarketingMetric[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMarketingMetrics(): UseMarketingMetricsResult {
  const [marketingMetrics, setMarketingMetrics] = useState<MarketingMetric[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketingMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/marketing-metrics");
      if (!res.ok) throw new Error("Failed to fetch marketing metrics");
      const data = await res.json();
      setMarketingMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketingMetrics();
  }, [fetchMarketingMetrics]);

  return { marketingMetrics, loading, error, refetch: fetchMarketingMetrics };
}

export function getDealsByStage(deals: Deal[]) {
  const stages = [
    "lead",
    "prospecting",
    "qualified",
    "meeting",
    "proposal",
    "negotiation",
    "won",
    "lost",
  ] as const;
  return stages.reduce(
    (acc, stage) => {
      acc[stage] = deals.filter((d) => d.stage === stage);
      return acc;
    },
    {} as Record<(typeof stages)[number], Deal[]>,
  );
}

export function getWeightedValue(deals: Deal[]): number {
  return deals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
}

interface UseGrowthTargetsResult {
  growthTargets: GrowthTarget[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useGrowthTargets(): UseGrowthTargetsResult {
  const [growthTargets, setGrowthTargets] = useState<GrowthTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGrowthTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/growth-targets");
      if (!res.ok) throw new Error("Failed to fetch growth targets");
      const data = await res.json();
      setGrowthTargets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrowthTargets();
  }, [fetchGrowthTargets]);

  return { growthTargets, loading, error, refetch: fetchGrowthTargets };
}

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/products");
      if (!res.ok) throw new Error("Failed to fetch products");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return { products, loading, error, refetch: fetchProducts };
}

interface UseStrategyMilestonesResult {
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useStrategyMilestones(): UseStrategyMilestonesResult {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMilestones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/strategy-milestones");
      if (!res.ok) throw new Error("Failed to fetch strategy milestones");
      const data = await res.json();
      setMilestones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMilestones();
  }, [fetchMilestones]);

  return { milestones, loading, error, refetch: fetchMilestones };
}

interface UseContentPillarsResult {
  contentPillars: ContentPillar[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useContentPillars(): UseContentPillarsResult {
  const [contentPillars, setContentPillars] = useState<ContentPillar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContentPillars = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/content-pillars");
      if (!res.ok) throw new Error("Failed to fetch content pillars");
      const data = await res.json();
      setContentPillars(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContentPillars();
  }, [fetchContentPillars]);

  return { contentPillars, loading, error, refetch: fetchContentPillars };
}

interface UseSeoTargetsResult {
  seoTargets: SeoTarget[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useSeoTargets(): UseSeoTargetsResult {
  const [seoTargets, setSeoTargets] = useState<SeoTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSeoTargets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/seo-targets");
      if (!res.ok) throw new Error("Failed to fetch seo targets");
      const data = await res.json();
      setSeoTargets(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSeoTargets();
  }, [fetchSeoTargets]);

  return { seoTargets, loading, error, refetch: fetchSeoTargets };
}

interface UseMarketingChannelsResult {
  marketingChannels: MarketingChannel[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useMarketingChannels(): UseMarketingChannelsResult {
  const [marketingChannels, setMarketingChannels] = useState<
    MarketingChannel[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMarketingChannels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/strategy/marketing-channels");
      if (!res.ok) throw new Error("Failed to fetch marketing channels");
      const data = await res.json();
      setMarketingChannels(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMarketingChannels();
  }, [fetchMarketingChannels]);

  return { marketingChannels, loading, error, refetch: fetchMarketingChannels };
}
