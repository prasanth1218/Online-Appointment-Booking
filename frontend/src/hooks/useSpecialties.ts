import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient.js";
import type { ApiSuccess, Specialty } from "../types/index.js";

export function useSpecialties() {
  return useQuery({
    queryKey: ["specialties"],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Specialty[]>>("/specialties");
      return res.data.data;
    },
    staleTime: 5 * 60_000,
  });
}
