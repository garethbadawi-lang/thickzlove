"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getServiceById } from "@/data/services";
import {
  contactMethods,
  venueTypes,
  type BookingFormPayload,
} from "@/lib/booking-types";
import { BookingProgress } from "./BookingProgress";
import { ServiceSelect } from "./ServiceSelect";
import { VerificationStatusBadge } from "./VerificationStatus";
import { siteConfig } from "@/data/site-config";

const initial: BookingFormPayload = {
  fullName: "",
  preferredName: "",
  email: "",
  mobile: "",
  country: "",
  city: "",
  preferredContactMethod: "",
  ageConfirmed: false,
  serviceId: "",
  preferredDate: "",
  alternativeDate: "",
  preferredStartTime: "",
  requestedDuration: "",
  attendees: "1",
  area: "",
  venueType: "",
  purpose: "",
  dressPreference: "",
  eventInfo: "",
  accessibility: "",
  additionalNotes: "",
  travelRequirements: "",
  howFound: "",
  timeWindow: "",
  understandNotConfirmed: false,
  understandCompanionshipOnly: false,
  agreeRespectful: false,
  agreeTerms: false,
  website: "",
};

export function BookingForm() {
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<BookingFormPayload>(initial);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [mockVerification, setMockVerification] = useState(false);

  useEffect(() => {
    const service = searchParams.get("service") || "";
    const date = searchParams.get("date") || "";
    const window = searchParams.get("window") || "";
    setForm((prev) => ({
      ...prev,
      serviceId: service || prev.serviceId,
      preferredDate: date || prev.preferredDate,
      timeWindow: window || prev.timeWindow,
      requestedDuration:
        (service && getServiceById(service)?.duration) || prev.requestedDuration,
    }));
  }, [searchParams]);

  const selectedService = useMemo(
    () => (form.serviceId ? getServiceById(form.serviceId) : undefined),
    [form.serviceId],
  );

  function update<K extends keyof BookingFormPayload>(
    key: K,
    value: BookingFormPayload[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validateStep(current: number) {
    if (current === 1) {
      return Boolean(
        form.fullName &&
          form.email &&
          form.mobile &&
          form.country &&
          form.city &&
          form.preferredContactMethod &&
          form.ageConfirmed,
      );
    }
    if (current === 2) {
      return Boolean(
        form.serviceId &&
          form.preferredDate &&
          form.requestedDuration &&
          form.attendees &&
          form.area &&
          form.venueType,
      );
    }
    if (current === 3) {
      return Boolean(form.purpose);
    }
    return (
      form.understandNotConfirmed &&
      form.understandCompanionshipOnly &&
      form.agreeRespectful &&
      form.agreeTerms
    );
  }

  async function submit() {
    setError(null);
    if (!validateStep(4)) {
      setError("Please complete all confirmation checkboxes.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        error?: string;
        referenceNumber?: string;
      };
      if (!res.ok) {
        setError(data.error || "Unable to submit enquiry.");
        return;
      }
      setReference(data.referenceNumber || "Received");
    } catch {
      setError("Unable to submit enquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (reference) {
    return (
      <div className="card-light space-y-6 p-6 sm:p-8">
        <h2 className="font-display text-3xl text-espresso">Enquiry received</h2>
        <p className="text-warmgrey">
          Thank you. Your enquiry reference is{" "}
          <span className="font-semibold text-espresso">{reference}</span>. This
          does not confirm a booking.
        </p>
        <p className="text-sm text-warmgrey">{siteConfig.contact.responseTime}</p>
        <VerificationStatusBadge
          status={
            mockVerification
              ? "Verification in progress"
              : "Not requested"
          }
          showAdminLabel={false}
          onBegin={() => setMockVerification(true)}
        />
        {mockVerification && (
          <p className="text-sm text-warmgrey">
            Mock verification started. In production this would open a secure
            third-party identity provider. No identity documents are stored on
            this website.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="card-light p-5 sm:p-8">
      <BookingProgress currentStep={step} />

      {step === 1 && (
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl text-espresso">
            Your details
          </legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required>
              <input
                className="input-light"
                value={form.fullName}
                onChange={(e) => update("fullName", e.target.value)}
                autoComplete="name"
                required
              />
            </Field>
            <Field label="Preferred name">
              <input
                className="input-light"
                value={form.preferredName}
                onChange={(e) => update("preferredName", e.target.value)}
              />
            </Field>
            <Field label="Email address" required>
              <input
                type="email"
                className="input-light"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                autoComplete="email"
                required
              />
            </Field>
            <Field label="Mobile number" required>
              <input
                type="tel"
                className="input-light"
                value={form.mobile}
                onChange={(e) => update("mobile", e.target.value)}
                autoComplete="tel"
                required
              />
            </Field>
            <Field label="Country" required>
              <input
                className="input-light"
                value={form.country}
                onChange={(e) => update("country", e.target.value)}
                required
              />
            </Field>
            <Field label="City" required>
              <input
                className="input-light"
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                required
              />
            </Field>
            <Field label="Preferred contact method" required>
              <select
                className="input-light"
                value={form.preferredContactMethod}
                onChange={(e) =>
                  update("preferredContactMethod", e.target.value)
                }
                required
              >
                <option value="">Select</option>
                {contactMethods.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <label className="flex items-start gap-3 text-sm text-warmgrey">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-burgundy"
              checked={form.ageConfirmed}
              onChange={(e) => update("ageConfirmed", e.target.checked)}
            />
            <span>
              I confirm that I am at least the minimum legal age required in my
              location.
            </span>
          </label>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl text-espresso">
            Choose an experience
          </legend>
          <Field label="Service" required>
            <ServiceSelect
              value={form.serviceId}
              onChange={(id) => {
                update("serviceId", id);
                const s = getServiceById(id);
                if (s) update("requestedDuration", s.duration);
              }}
              required
            />
          </Field>
          {selectedService && (
            <p className="text-sm text-warmgrey">
              {selectedService.description} — {selectedService.priceLabel}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Preferred date" required>
              <input
                type="date"
                className="input-light"
                value={form.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
                required
              />
            </Field>
            <Field label="Alternative date">
              <input
                type="date"
                className="input-light"
                value={form.alternativeDate}
                onChange={(e) => update("alternativeDate", e.target.value)}
              />
            </Field>
            <Field label="Preferred start time">
              <input
                type="time"
                className="input-light"
                value={form.preferredStartTime}
                onChange={(e) => update("preferredStartTime", e.target.value)}
              />
            </Field>
            <Field label="Time window">
              <input
                className="input-light"
                value={form.timeWindow || ""}
                onChange={(e) => update("timeWindow", e.target.value)}
                placeholder="e.g. Evening"
              />
            </Field>
            <Field label="Requested duration" required>
              <input
                className="input-light"
                value={form.requestedDuration}
                onChange={(e) => update("requestedDuration", e.target.value)}
                required
              />
            </Field>
            <Field label="Number of attendees" required>
              <input
                className="input-light"
                value={form.attendees}
                onChange={(e) => update("attendees", e.target.value)}
                required
              />
            </Field>
            <Field label="City or general area" required>
              <input
                className="input-light"
                value={form.area}
                onChange={(e) => update("area", e.target.value)}
                required
              />
            </Field>
            <Field label="Venue type" required>
              <select
                className="input-light"
                value={form.venueType}
                onChange={(e) => update("venueType", e.target.value)}
                required
              >
                <option value="">Select</option>
                {venueTypes.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <p className="text-xs text-warmgrey">
            Please do not include an exact private address in this initial
            enquiry.
          </p>
        </fieldset>
      )}

      {step === 3 && (
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl text-espresso">
            Arrangement details
          </legend>
          <Field label="Purpose of the booking" required>
            <textarea
              className="input-light min-h-28"
              value={form.purpose}
              onChange={(e) => update("purpose", e.target.value)}
              required
            />
          </Field>
          <Field label="Dress preference">
            <input
              className="input-light"
              value={form.dressPreference}
              onChange={(e) => update("dressPreference", e.target.value)}
            />
          </Field>
          <Field label="Event or venue information">
            <textarea
              className="input-light min-h-24"
              value={form.eventInfo}
              onChange={(e) => update("eventInfo", e.target.value)}
            />
          </Field>
          <Field label="Accessibility requirements">
            <textarea
              className="input-light min-h-20"
              value={form.accessibility}
              onChange={(e) => update("accessibility", e.target.value)}
            />
          </Field>
          <Field label="Travel requirements">
            <textarea
              className="input-light min-h-20"
              value={form.travelRequirements}
              onChange={(e) => update("travelRequirements", e.target.value)}
            />
          </Field>
          <Field label="Additional notes">
            <textarea
              className="input-light min-h-24"
              value={form.additionalNotes}
              onChange={(e) => update("additionalNotes", e.target.value)}
            />
          </Field>
          <Field label="How did you find this website?">
            <input
              className="input-light"
              value={form.howFound}
              onChange={(e) => update("howFound", e.target.value)}
            />
          </Field>
        </fieldset>
      )}

      {step === 4 && (
        <fieldset className="space-y-4">
          <legend className="font-display text-2xl text-espresso">
            Screening and confirmation
          </legend>
          <p className="text-sm leading-relaxed text-warmgrey">
            {siteConfig.companionshipDisclaimer}
          </p>
          <Check
            checked={form.understandNotConfirmed}
            onChange={(v) => update("understandNotConfirmed", v)}
            label="I understand that submitting this form does not confirm a booking."
          />
          <Check
            checked={form.understandCompanionshipOnly}
            onChange={(v) => update("understandCompanionshipOnly", v)}
            label="I understand that all arrangements are for lawful social companionship only."
          />
          <Check
            checked={form.agreeRespectful}
            onChange={(v) => update("agreeRespectful", v)}
            label="I agree to behave respectfully and follow the stated boundaries."
          />
          <Check
            checked={form.agreeTerms}
            onChange={(v) => update("agreeTerms", v)}
            label="I have read the booking, cancellation and privacy terms."
          />
          <VerificationStatusBadge />
          {/* Honeypot */}
          <input
            type="text"
            name="website"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            className="hidden"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
          />
        </fieldset>
      )}

      {error && (
        <p className="mt-4 rounded-2xl border border-burgundy/30 bg-blush/40 px-4 py-3 text-sm text-burgundy">
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          className="btn-secondary"
          disabled={step === 1 || submitting}
          onClick={() => setStep((s) => Math.max(1, s - 1))}
        >
          Back
        </button>
        {step < 4 ? (
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            onClick={() => {
              if (!validateStep(step)) {
                setError("Please complete the required fields for this step.");
                return;
              }
              setError(null);
              setStep((s) => s + 1);
            }}
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary w-full sm:w-auto"
            disabled={submitting}
            onClick={submit}
          >
            {submitting ? "Sending…" : "Submit Enquiry"}
          </button>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-espresso">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function Check({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-start gap-3 text-sm text-warmgrey">
      <input
        type="checkbox"
        className="mt-1 size-4 accent-burgundy"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  );
}
