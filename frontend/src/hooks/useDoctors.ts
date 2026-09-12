import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient.js";
import type { ApiSuccess, AvailabilityResponse, DoctorDetail, DoctorSummary, PaginationMeta } from "../types/index.js";

export interface DoctorListParams {
  search?: string;
  specialtySlug?: string;
  sortBy?: "rating" | "experience" | "feeAsc" | "feeDesc";
  page?: number;
  limit?: number;
}

export function useDoctors(params: DoctorListParams) {
  return useQuery({
    queryKey: ["doctors", params],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<DoctorSummary[]>>("/doctors", { params });
      return { doctors: res.data.data, pagination: res.data.meta?.pagination as PaginationMeta };
    },
  });
}

export function useDoctor(doctorId: string | undefined) {
  return useQuery({
    queryKey: ["doctor", doctorId],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<DoctorDetail>>(`/doctors/${doctorId}`);
      return res.data.data;
    },
    enabled: Boolean(doctorId),
  });
}

export function useDoctorAvailability(doctorId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ["doctor-availability", doctorId, date],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<AvailabilityResponse>>(`/doctors/${doctorId}/availability`, {
        params: { date },
      });
      return res.data.data;
    },
    enabled: Boolean(doctorId) && Boolean(date),
    staleTime: 10_000,
  });
}
