import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function avatar(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(seed)}&backgroundColor=e0f2fe,dbeafe,ede9fe`;
}

const WEEKDAYS_MON_FRI = [1, 2, 3, 4, 5];
const WEEKDAYS_MON_SAT = [1, 2, 3, 4, 5, 6];

function morningAndAfternoon(days: number[]) {
  return days.flatMap((dayOfWeek) => [
    { dayOfWeek, startTime: "09:00", endTime: "13:00" },
    { dayOfWeek, startTime: "14:00", endTime: "17:30" },
  ]);
}

function morningOnly(days: number[]) {
  return days.map((dayOfWeek) => ({ dayOfWeek, startTime: "09:00", endTime: "13:00" }));
}

const SPECIALTIES = [
  { name: "Cardiology", slug: "cardiology", icon: "heart-pulse", description: "Heart health, blood pressure and cardiovascular risk management." },
  { name: "Dermatology", slug: "dermatology", icon: "sparkles", description: "Skin, hair and nail conditions for all ages." },
  { name: "Pediatrics", slug: "pediatrics", icon: "baby", description: "Comprehensive health care for infants, children and teens." },
  { name: "Orthopedics", slug: "orthopedics", icon: "bone", description: "Bones, joints, ligaments and sports injuries." },
  { name: "General Medicine", slug: "general-medicine", icon: "stethoscope", description: "Everyday health concerns, checkups and preventive care." },
  { name: "Neurology", slug: "neurology", icon: "brain", description: "Disorders of the brain, spine and nervous system." },
  { name: "Dentistry", slug: "dentistry", icon: "smile", description: "Routine and restorative dental care for the whole family." },
  { name: "Psychiatry", slug: "psychiatry", icon: "brain-circuit", description: "Mental health assessment, therapy support and medication management." },
] as const;

interface DoctorSeed {
  fullName: string;
  title: string;
  specialtySlug: string;
  bio: string;
  yearsOfExperience: number;
  consultationFee: number;
  languages: string[];
  clinicName: string;
  clinicAddress: string;
  slotDurationMinutes: number;
  rating: number;
  ratingCount: number;
  schedule: { dayOfWeek: number; startTime: string; endTime: string }[];
}

const DOCTORS: DoctorSeed[] = [
  {
    fullName: "Dr. Amara Okafor",
    title: "MD, Cardiologist",
    specialtySlug: "cardiology",
    bio: "Dr. Okafor specializes in preventive cardiology and heart-failure management, with a focus on helping patients build sustainable, heart-healthy routines.",
    yearsOfExperience: 14,
    consultationFee: 120,
    languages: ["English", "French"],
    clinicName: "Riverside Heart & Vascular Center",
    clinicAddress: "220 Riverside Ave, Suite 4B, Meadowbrook",
    slotDurationMinutes: 30,
    rating: 4.9,
    ratingCount: 214,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Marcus Chen",
    title: "MD, Interventional Cardiologist",
    specialtySlug: "cardiology",
    bio: "Dr. Chen focuses on minimally invasive cardiac procedures and works closely with patients on long-term recovery plans after cardiac events.",
    yearsOfExperience: 19,
    consultationFee: 150,
    languages: ["English", "Mandarin"],
    clinicName: "Northgate Cardiology Associates",
    clinicAddress: "58 Northgate Blvd, Fairview",
    slotDurationMinutes: 30,
    rating: 4.8,
    ratingCount: 301,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Priya Nair",
    title: "MD, Dermatologist",
    specialtySlug: "dermatology",
    bio: "Dr. Nair treats everything from acne and eczema to skin-cancer screening, with a gentle, evidence-based approach to skincare.",
    yearsOfExperience: 11,
    consultationFee: 95,
    languages: ["English", "Hindi", "Tamil"],
    clinicName: "Clearview Dermatology Clinic",
    clinicAddress: "12 Clearview Lane, Meadowbrook",
    slotDurationMinutes: 20,
    rating: 4.9,
    ratingCount: 178,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Elena Rossi",
    title: "MD, Cosmetic Dermatologist",
    specialtySlug: "dermatology",
    bio: "Dr. Rossi combines medical dermatology with cosmetic care, helping patients manage chronic skin conditions and long-term skin health.",
    yearsOfExperience: 9,
    consultationFee: 110,
    languages: ["English", "Italian"],
    clinicName: "Clearview Dermatology Clinic",
    clinicAddress: "12 Clearview Lane, Meadowbrook",
    slotDurationMinutes: 20,
    rating: 4.7,
    ratingCount: 96,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Jonathan Reyes",
    title: "MD, Pediatrician",
    specialtySlug: "pediatrics",
    bio: "Dr. Reyes has spent over a decade helping families navigate everything from newborn checkups to teenage wellness visits.",
    yearsOfExperience: 13,
    consultationFee: 90,
    languages: ["English", "Spanish"],
    clinicName: "Sunny Days Pediatric Care",
    clinicAddress: "77 Willow Street, Fairview",
    slotDurationMinutes: 20,
    rating: 4.95,
    ratingCount: 412,
    schedule: morningAndAfternoon(WEEKDAYS_MON_SAT),
  },
  {
    fullName: "Dr. Grace Kim",
    title: "MD, Pediatrician",
    specialtySlug: "pediatrics",
    bio: "Dr. Kim believes in partnering with parents to build confident, healthy kids, with special interest in childhood nutrition and allergies.",
    yearsOfExperience: 8,
    consultationFee: 85,
    languages: ["English", "Korean"],
    clinicName: "Sunny Days Pediatric Care",
    clinicAddress: "77 Willow Street, Fairview",
    slotDurationMinutes: 20,
    rating: 4.85,
    ratingCount: 203,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Samuel Osei",
    title: "MD, Orthopedic Surgeon",
    specialtySlug: "orthopedics",
    bio: "Dr. Osei treats sports injuries, joint pain and post-surgical rehabilitation with a hands-on, personalized approach.",
    yearsOfExperience: 16,
    consultationFee: 130,
    languages: ["English"],
    clinicName: "Summit Orthopedic & Sports Medicine",
    clinicAddress: "305 Summit Ridge Rd, Oakhaven",
    slotDurationMinutes: 30,
    rating: 4.75,
    ratingCount: 189,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Hannah Whitfield",
    title: "MD, General Practitioner",
    specialtySlug: "general-medicine",
    bio: "Dr. Whitfield is a family medicine physician focused on preventive care, chronic disease management and whole-person wellness.",
    yearsOfExperience: 10,
    consultationFee: 70,
    languages: ["English"],
    clinicName: "Oakhaven Family Practice",
    clinicAddress: "9 Oakhaven Square, Oakhaven",
    slotDurationMinutes: 20,
    rating: 4.8,
    ratingCount: 256,
    schedule: morningAndAfternoon(WEEKDAYS_MON_SAT),
  },
  {
    fullName: "Dr. Farid Haidari",
    title: "MD, Neurologist",
    specialtySlug: "neurology",
    bio: "Dr. Haidari specializes in headache disorders, epilepsy and general neurological care, combining diagnostics with practical treatment plans.",
    yearsOfExperience: 17,
    consultationFee: 140,
    languages: ["English", "Persian"],
    clinicName: "Meadowbrook Neurology Group",
    clinicAddress: "44 Meadow Lane, Meadowbrook",
    slotDurationMinutes: 30,
    rating: 4.7,
    ratingCount: 132,
    schedule: morningOnly(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Lucia Fernandez",
    title: "DDS, Dentist",
    specialtySlug: "dentistry",
    bio: "Dr. Fernandez provides gentle, comprehensive dental care from routine cleanings to restorative treatment for patients of all ages.",
    yearsOfExperience: 12,
    consultationFee: 80,
    languages: ["English", "Spanish", "Portuguese"],
    clinicName: "Brightside Dental Studio",
    clinicAddress: "18 Brightside Ave, Fairview",
    slotDurationMinutes: 30,
    rating: 4.9,
    ratingCount: 298,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Nathaniel Brooks",
    title: "MD, Psychiatrist",
    specialtySlug: "psychiatry",
    bio: "Dr. Brooks offers a calm, judgment-free space for anxiety, depression and stress-related concerns, with an integrative approach to treatment.",
    yearsOfExperience: 15,
    consultationFee: 135,
    languages: ["English"],
    clinicName: "Clearmind Behavioral Health",
    clinicAddress: "63 Clearmind Way, Oakhaven",
    slotDurationMinutes: 45,
    rating: 4.85,
    ratingCount: 167,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
  {
    fullName: "Dr. Sofia Petrov",
    title: "MD, Psychiatrist",
    specialtySlug: "psychiatry",
    bio: "Dr. Petrov works with adults navigating life transitions, burnout and mood disorders, blending therapy insight with medical care.",
    yearsOfExperience: 7,
    consultationFee: 115,
    languages: ["English", "Russian"],
    clinicName: "Clearmind Behavioral Health",
    clinicAddress: "63 Clearmind Way, Oakhaven",
    slotDurationMinutes: 45,
    rating: 4.6,
    ratingCount: 74,
    schedule: morningAndAfternoon(WEEKDAYS_MON_FRI),
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.appointment.deleteMany();
  await prisma.doctorTimeOff.deleteMany();
  await prisma.weeklyAvailability.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.specialty.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const specialtyBySlug = new Map<string, string>();
  for (const specialty of SPECIALTIES) {
    const created = await prisma.specialty.create({ data: specialty });
    specialtyBySlug.set(specialty.slug, created.id);
  }
  console.log(`Created ${SPECIALTIES.length} specialties.`);

  const createdDoctors = [];
  for (const doctorSeed of DOCTORS) {
    const specialtyId = specialtyBySlug.get(doctorSeed.specialtySlug);
    if (!specialtyId) throw new Error(`Unknown specialty slug: ${doctorSeed.specialtySlug}`);

    const doctor = await prisma.doctor.create({
      data: {
        fullName: doctorSeed.fullName,
        title: doctorSeed.title,
        specialtyId,
        bio: doctorSeed.bio,
        photoUrl: avatar(doctorSeed.fullName),
        yearsOfExperience: doctorSeed.yearsOfExperience,
        consultationFee: doctorSeed.consultationFee,
        languages: doctorSeed.languages,
        clinicName: doctorSeed.clinicName,
        clinicAddress: doctorSeed.clinicAddress,
        slotDurationMinutes: doctorSeed.slotDurationMinutes,
        rating: doctorSeed.rating,
        ratingCount: doctorSeed.ratingCount,
        availabilities: { create: doctorSeed.schedule },
      },
    });
    createdDoctors.push(doctor);
  }
  console.log(`Created ${createdDoctors.length} doctors with weekly schedules.`);

  const inTwoWeeks = new Date();
  inTwoWeeks.setUTCDate(inTwoWeeks.getUTCDate() + 14);
  await prisma.doctorTimeOff.create({
    data: {
      doctorId: createdDoctors[0]!.id,
      date: new Date(Date.UTC(inTwoWeeks.getUTCFullYear(), inTwoWeeks.getUTCMonth(), inTwoWeeks.getUTCDate())),
      reason: "Medical conference",
    },
  });
  console.log("Added a sample time-off day for demonstration.");

  const demoPasswordHash = await bcrypt.hash("Patient123", 12);
  const demoPatient = await prisma.user.create({
    data: {
      email: "demo.patient@example.com",
      passwordHash: demoPasswordHash,
      fullName: "Jordan Ellis",
      phone: "+1 555-0142",
      dateOfBirth: new Date("1992-06-14"),
      role: "PATIENT",
    },
  });
  console.log(`Created demo patient account: ${demoPatient.email} / Patient123`);

  const pediatrician = createdDoctors.find((d) => d.fullName === "Dr. Jonathan Reyes")!;
  const dentist = createdDoctors.find((d) => d.fullName === "Dr. Lucia Fernandez")!;
  const cardiologist = createdDoctors.find((d) => d.fullName === "Dr. Amara Okafor")!;

  const nextWeek = new Date();
  nextWeek.setUTCDate(nextWeek.getUTCDate() + 7);
  const lastMonth = new Date();
  lastMonth.setUTCDate(lastMonth.getUTCDate() - 20);
  const lastWeek = new Date();
  lastWeek.setUTCDate(lastWeek.getUTCDate() - 5);

  function atMidnightUTC(date: Date) {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  await prisma.appointment.create({
    data: {
      patientId: demoPatient.id,
      doctorId: pediatrician.id,
      date: atMidnightUTC(nextWeek),
      startTime: "10:00",
      endTime: "10:20",
      status: "CONFIRMED",
      reasonForVisit: "Annual wellness checkup",
      patientFullName: demoPatient.fullName,
      patientEmail: demoPatient.email,
      patientPhone: demoPatient.phone!,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: demoPatient.id,
      doctorId: dentist.id,
      date: atMidnightUTC(lastMonth),
      startTime: "15:00",
      endTime: "15:30",
      status: "COMPLETED",
      reasonForVisit: "Routine cleaning and checkup",
      patientFullName: demoPatient.fullName,
      patientEmail: demoPatient.email,
      patientPhone: demoPatient.phone!,
    },
  });

  await prisma.appointment.create({
    data: {
      patientId: demoPatient.id,
      doctorId: cardiologist.id,
      date: atMidnightUTC(lastWeek),
      startTime: "09:30",
      endTime: "10:00",
      status: "CANCELLED",
      reasonForVisit: "Follow-up on blood pressure medication",
      patientFullName: demoPatient.fullName,
      patientEmail: demoPatient.email,
      patientPhone: demoPatient.phone!,
      cancelledAt: new Date(),
      cancellationReason: "Schedule conflict",
    },
  });

  console.log("Created 3 sample appointments (upcoming, completed, cancelled) for the demo patient.");
  console.log("Seeding complete.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
