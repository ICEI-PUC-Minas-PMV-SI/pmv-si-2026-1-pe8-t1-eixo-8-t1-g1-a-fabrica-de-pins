import { useQuery } from '@tanstack/react-query'

import type { ReportFiltersInput } from '@/schemas/report.filters.schema'
import { getReportSnapshot } from '@/services/reports'

export function useReportSnapshotQuery(filtros: ReportFiltersInput | null) {
  return useQuery({
    queryKey: ['report-snapshot', filtros],
    queryFn: () => getReportSnapshot(filtros!),
    enabled: filtros !== null,
  })
}
