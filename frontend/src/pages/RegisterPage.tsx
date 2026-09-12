import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarHeart } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { ApiError } from "../lib/apiClient.js";
import { Card } from "../components/ui/Card.js";
import { Input } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";
import { registerFormSchema, type RegisterFormValues } from "../utils/validation.js";

export function RegisterPage() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerFormSchema) });

  async function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    try {
      await registerUser({ fullName: values.fullName, email: values.email, password: values.password, phone: values.phone });
      navigate("/", { replace: true });
    } catch (error) {
      setServerError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col items-center justify-center px-4 py-12 sm:px-6">
      <Link to="/" className="mb-6 flex items-center gap-2 font-display text-lg font-bold text-ink-900">
        <span className="flex size-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <CalendarHeart className="size-5" aria-hidden="true" />
        </span>
        Vitalis Health
      </Link>

      <Card className="w-full p-6 sm:p-8">
        <h1 className="font-display text-xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-500">Book and manage appointments in a few clicks.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Full name" autoComplete="name" required {...register("fullName")} error={errors.fullName?.message} />
          <Input label="Email" type="email" autoComplete="email" required {...register("email")} error={errors.email?.message} />
          <Input label="Phone (optional)" autoComplete="tel" {...register("phone")} error={errors.phone?.message} />
          <Input
            label="Password"
            type="password"
            autoComplete="new-password"
            required
            hint="At least 8 characters, with a letter and a number."
            {...register("password")}
            error={errors.password?.message}
          />
          <Input
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            required
            {...register("confirmPassword")}
            error={errors.confirmPassword?.message}
          />

          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} className="mt-2">
            Create Account
          </Button>
        </form>

        <p className="mt-4 text-sm text-ink-500">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-brand-700 hover:text-brand-800">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
}
