import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { apiClient, ApiError } from "../lib/apiClient.js";
import { Card } from "../components/ui/Card.js";
import { Input } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";
import { profileFormSchema, type ProfileFormValues } from "../utils/validation.js";
import type { ApiSuccess, User } from "../types/index.js";

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: user?.fullName ?? "",
      phone: user?.phone ?? "",
      dateOfBirth: user?.dateOfBirth ?? "",
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      const res = await apiClient.patch<ApiSuccess<{ user: User }>>("/auth/me", values);
      return res.data.data.user;
    },
    onSuccess: (updated) => {
      updateUser(updated);
      setSuccess(true);
      setServerError(null);
    },
    onError: (error) => {
      setServerError(error instanceof ApiError ? error.message : "Could not update your profile. Please try again.");
      setSuccess(false);
    },
  });

  if (!user) return null;

  function onSubmit(values: ProfileFormValues) {
    updateProfile.mutate(values);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl font-bold text-ink-900">Your Profile</h1>
      <p className="mt-2 text-ink-500">Keep your contact details up to date for faster booking.</p>

      <Card className="mt-6 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between border-b border-ink-100 pb-4">
          <div>
            <p className="text-xs text-ink-400">Account email</p>
            <p className="font-medium text-ink-800">{user.email}</p>
          </div>
          <span className="rounded-full bg-ink-100 px-2.5 py-1 text-xs font-medium text-ink-600">{user.role}</span>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full name" required {...register("fullName")} error={errors.fullName?.message} />
          <Input label="Phone" {...register("phone")} error={errors.phone?.message} />
          <Input label="Date of birth" type="date" {...register("dateOfBirth")} error={errors.dateOfBirth?.message} />

          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}
          {success && !isDirty && (
            <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Profile updated successfully.
            </p>
          )}

          <Button type="submit" isLoading={updateProfile.isPending} className="mt-2 self-start">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
