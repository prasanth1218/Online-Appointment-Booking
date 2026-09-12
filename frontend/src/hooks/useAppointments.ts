import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/apiClient.js";
import type { Appointment, ApiSuccess, PaginationMeta } from "../types/index.js";

export type AppointmentFilter = "upcoming" | "past" | "cancelled" | "all";

export function useAppointments(filter: AppointmentFilter, page = 1) {
  return useQuery({
    queryKey: ["appointments", filter, page],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Appointment[]>>("/appointments", { params: { filter, page } });
      return { appointments: res.data.data, pagination: res.data.meta?.pagination as PaginationMeta };
    },
  });
}

export function useAppointment(id: string | undefined) {
  return useQuery({
    queryKey: ["appointment", id],
    queryFn: async () => {
      const res = await apiClient.get<ApiSuccess<Appointment>>(`/appointments/${id}`);
      return res.data.data;
    },
    enabled: Boolean(id),
  });
}

export interface CreateAppointmentInput {
  doctorId: string;
  date: string;
  startTime: string;
  reasonForVisit: string;
  notes?: string;
  patientFullName: string;
  patientEmail: string;
  patientPhone: string;
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateAppointmentInput) => {
      const res = await apiClient.post<ApiSuccess<Appointment>>("/appointments", input);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["doctor-availability"] });
    },
  });
}

export function useCancelAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const res = await apiClient.patch<ApiSuccess<Appointment>>(`/appointments/${id}/cancel`, { reason });
      return res.data.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.setQueryData(["appointment", updated.id], updated);
      queryClient.invalidateQueries({ queryKey: ["doctor-availability"] });
    },
  });
}
