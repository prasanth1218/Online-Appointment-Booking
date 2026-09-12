import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarDays, Clock, MapPin, Stethoscope } from "lucide-react";
import { useAuth } from "../context/AuthContext.js";
import { useDoctor, useDoctorAvailability } from "../hooks/useDoctors.js";
import { useCreateAppointment } from "../hooks/useAppointments.js";
import { ApiError } from "../lib/apiClient.js";
import { Card } from "../components/ui/Card.js";
import { Button } from "../components/ui/Button.js";
import { Avatar } from "../components/ui/Avatar.js";
import { Input } from "../components/ui/Input.js";
import { TextArea } from "../components/ui/TextArea.js";
import { PageSpinner } from "../components/ui/Spinner.js";
import { ErrorState } from "../components/ui/ErrorState.js";
import { StepIndicator, type Step } from "../components/booking/StepIndicator.js";
import { DateStrip } from "../components/booking/DateStrip.js";
import { TimeSlotGrid } from "../components/booking/TimeSlotGrid.js";
import { formatCurrency, formatDateTime } from "../utils/formatters.js";
import { patientDetailsFormSchema, type PatientDetailsFormValues } from "../utils/validation.js";

const STEPS: Step[] = [
  { key: "date", label: "Date" },
  { key: "time", label: "Time" },
  { key: "details", label: "Details" },
  { key: "review", label: "Review" },
];

function todayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export function BookingPage() {
  const { doctorId } = useParams<{ doctorId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const { data: doctor, isLoading: doctorLoading, isError: doctorError } = useDoctor(doctorId);
  const { data: availability, isLoading: availabilityLoading, isError: availabilityError, refetch: refetchAvailability } =
    useDoctorAvailability(doctorId, selectedDate);
  const createAppointment = useCreateAppointment();

  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 60);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<PatientDetailsFormValues>({
    resolver: zodResolver(patientDetailsFormSchema),
    defaultValues: {
      patientFullName: user?.fullName ?? "",
      patientEmail: user?.email ?? "",
      patientPhone: user?.phone ?? "",
      reasonForVisit: "",
      notes: "",
    },
  });

  if (doctorLoading) return <PageSpinner label="Loading booking details..." />;

  if (doctorError || !doctor) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <ErrorState title="Doctor not found" message="This doctor may no longer be available for booking." />
      </div>
    );
  }

  function goNext() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }

  async function onSubmit(values: PatientDetailsFormValues) {
    if (!doctorId || !selectedTime) return;
    try {
      const appointment = await createAppointment.mutateAsync({
        doctorId,
        date: selectedDate,
        startTime: selectedTime,
        reasonForVisit: values.reasonForVisit,
        notes: values.notes || undefined,
        patientFullName: values.patientFullName,
        patientEmail: values.patientEmail,
        patientPhone: values.patientPhone,
      });
      navigate(`/appointments/${appointment.id}/confirmation`);
    } catch {
      // Surfaced inline below via createAppointment.error
    }
  }

  const canContinueFromDate = Boolean(selectedDate) && !availability?.isDayOff;
  const canContinueFromTime = Boolean(selectedTime);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8">
        <StepIndicator steps={STEPS} currentIndex={stepIndex} />
      </div>

      <Card className="mb-6 flex items-center gap-4 p-4">
        <Avatar src={doctor.photoUrl} name={doctor.fullName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-ink-900">{doctor.fullName}</p>
          <p className="truncate text-sm text-ink-500">
            {doctor.specialty.name} &middot; {formatCurrency(doctor.consultationFee)}
          </p>
        </div>
      </Card>

      <Card className="p-6 sm:p-8">
        {stepIndex === 0 && (
          <div>
            <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">Choose a date</h2>
            <p className="mb-5 text-sm text-ink-500">Select the day you'd like to visit {doctor.fullName}.</p>
            <DateStrip selectedDate={selectedDate} onSelect={(d) => { setSelectedDate(d); setSelectedTime(null); }} maxDate={maxDate} />
            {availability?.isDayOff && (
              <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
                The doctor is unavailable on this date. Please choose another day.
              </p>
            )}
          </div>
        )}

        {stepIndex === 1 && (
          <div>
            <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">Choose a time</h2>
            <p className="mb-5 text-sm text-ink-500">Available {doctor.slotDurationMinutes}-minute slots for the selected date.</p>
            {availabilityLoading && <PageSpinner label="Loading available times..." />}
            {availabilityError && <ErrorState message="Could not load availability." onRetry={() => refetchAvailability()} />}
            {availability && !availabilityLoading && !availabilityError && (
              <TimeSlotGrid
                slots={availability.slots}
                selectedTime={selectedTime}
                onSelect={setSelectedTime}
                isDayOff={availability.isDayOff}
              />
            )}
          </div>
        )}

        {stepIndex === 2 && (
          <form onSubmit={handleSubmit(goNext)}>
            <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">Your details</h2>
            <p className="mb-5 text-sm text-ink-500">We'll use this information to confirm your appointment.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Full name" required {...register("patientFullName")} error={errors.patientFullName?.message} />
              <Input label="Email" type="email" required {...register("patientEmail")} error={errors.patientEmail?.message} />
              <Input label="Phone number" required {...register("patientPhone")} error={errors.patientPhone?.message} />
            </div>
            <div className="mt-4">
              <Input
                label="Reason for visit"
                required
                placeholder="e.g. Annual checkup, follow-up consultation"
                {...register("reasonForVisit")}
                error={errors.reasonForVisit?.message}
              />
            </div>
            <div className="mt-4">
              <TextArea
                label="Additional notes (optional)"
                rows={3}
                placeholder="Anything else the doctor should know before your visit"
                {...register("notes")}
                error={errors.notes?.message}
              />
            </div>
            <button type="submit" className="hidden" aria-hidden="true" />
          </form>
        )}

        {stepIndex === 3 && (
          <div>
            <h2 className="mb-1 font-display text-lg font-semibold text-ink-900">Review & confirm</h2>
            <p className="mb-5 text-sm text-ink-500">Please check your appointment details before confirming.</p>

            <dl className="grid gap-4 rounded-xl bg-ink-50 p-5 sm:grid-cols-2">
              <div className="flex items-start gap-2.5">
                <Stethoscope className="mt-0.5 size-4 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Doctor</dt>
                  <dd className="font-medium text-ink-800">{doctor.fullName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 size-4 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Clinic</dt>
                  <dd className="font-medium text-ink-800">{doctor.clinicName}</dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CalendarDays className="mt-0.5 size-4 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Date & time</dt>
                  <dd className="font-medium text-ink-800">
                    {selectedTime ? formatDateTime(selectedDate, selectedTime) : "—"}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Clock className="mt-0.5 size-4 text-brand-600" aria-hidden="true" />
                <div>
                  <dt className="text-xs text-ink-400">Duration</dt>
                  <dd className="font-medium text-ink-800">{doctor.slotDurationMinutes} minutes</dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 grid gap-4 rounded-xl border border-ink-100 p-5 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-ink-400">Patient</dt>
                <dd className="font-medium text-ink-800">{getValues("patientFullName")}</dd>
              </div>
              <div>
                <dt className="text-xs text-ink-400">Contact</dt>
                <dd className="font-medium text-ink-800">
                  {getValues("patientEmail")} &middot; {getValues("patientPhone")}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs text-ink-400">Reason for visit</dt>
                <dd className="font-medium text-ink-800">{getValues("reasonForVisit")}</dd>
              </div>
            </div>

            <div className="mt-4 flex items-baseline justify-between rounded-xl bg-brand-50 px-5 py-4">
              <span className="text-sm text-brand-800">Consultation fee</span>
              <span className="font-display text-xl font-bold text-brand-800">{formatCurrency(doctor.consultationFee)}</span>
            </div>

            {createAppointment.isError && (
              <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {createAppointment.error instanceof ApiError
                  ? createAppointment.error.message
                  : "Something went wrong while booking. Please try again."}
              </p>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between border-t border-ink-100 pt-6">
          <Button variant="outline" onClick={goBack} disabled={stepIndex === 0}>
            Back
          </Button>

          {stepIndex === 0 && (
            <Button onClick={goNext} disabled={!canContinueFromDate}>
              Continue
            </Button>
          )}
          {stepIndex === 1 && (
            <Button onClick={goNext} disabled={!canContinueFromTime}>
              Continue
            </Button>
          )}
          {stepIndex === 2 && <Button onClick={handleSubmit(goNext)}>Continue to Review</Button>}
          {stepIndex === 3 && (
            <Button onClick={handleSubmit(onSubmit)} isLoading={createAppointment.isPending}>
              Confirm Appointment
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
