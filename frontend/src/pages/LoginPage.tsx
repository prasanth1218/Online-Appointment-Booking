import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarHeart } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { ApiError } from "../lib/apiClient.js";
import { Card } from "../components/ui/Card.js";
import { Input } from "../components/ui/Input.js";
import { Button } from "../components/ui/Button.js";
import { loginFormSchema, type LoginFormValues } from "../utils/validation.js";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function onSubmit(values: LoginFormValues) {
    setServerError(null);
    try {
      await login(values);
      navigate(from, { replace: true });
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
        <h1 className="font-display text-xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-500">Sign in to manage your appointments.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <Input label="Email" type="email" autoComplete="email" required {...register("email")} error={errors.email?.message} />
          <Input
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            {...register("password")}
            error={errors.password?.message}
          />

          {serverError && (
            <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          )}

          <Button type="submit" fullWidth size="lg" isLoading={isSubmitting} className="mt-2">
            Sign In
          </Button>
        </form>

        <p className="mt-4 text-sm text-ink-500">
          New to Vitalis?{" "}
          <Link to="/register" className="font-medium text-brand-700 hover:text-brand-800">
            Create an account
          </Link>
        </p>
      </Card>

      <p className="mt-6 max-w-sm text-center text-xs text-ink-400">
        Demo account: demo.patient@example.com / Patient123
      </p>
    </div>
  );
}
