import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { generateTrainingRecommendation } from "../src/services/recommendationService.js";

const prisma = new PrismaClient();

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const setTime = (date, hours, minutes = 0) => {
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
};

async function main() {
  await prisma.recommendation.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.course.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.member.deleteMany();
  await prisma.coach.deleteMany();
  await prisma.user.deleteMany();

  const [adminHash, coachHash, memberHash] = await Promise.all([
    bcrypt.hash("Admin123!", 10),
    bcrypt.hash("Coach123!", 10),
    bcrypt.hash("Member123!", 10)
  ]);

  await prisma.user.create({
    data: {
      email: "admin@gym-ai.local",
      passwordHash: adminHash,
      role: "ADMIN"
    }
  });

  const coachUser = await prisma.user.create({
    data: {
      email: "coach@gym-ai.local",
      passwordHash: coachHash,
      role: "COACH"
    }
  });

  const memberUser = await prisma.user.create({
    data: {
      email: "member@gym-ai.local",
      passwordHash: memberHash,
      role: "MEMBER"
    }
  });

  const coaches = await Promise.all([
    prisma.coach.create({
      data: {
        userId: coachUser.id,
        firstName: "Nadia",
        lastName: "Benali",
        email: "coach@gym-ai.local",
        phone: "0612345678",
        specialty: "Musculation & transformation physique",
        bio: "Coach principale specialisee en force, posture et suivi de progression."
      }
    }),
    prisma.coach.create({
      data: {
        firstName: "Youssef",
        lastName: "El Amrani",
        email: "youssef.coach@gym-ai.local",
        phone: "0698765432",
        specialty: "Cardio boxing",
        bio: "Encadre les cours collectifs intensifs et les circuits fonctionnels."
      }
    })
  ]);

  const members = await Promise.all([
    prisma.member.create({
      data: {
        userId: memberUser.id,
        firstName: "Sara",
        lastName: "Alaoui",
        email: "member@gym-ai.local",
        phone: "0600112233",
        gender: "Femme",
        birthDate: new Date("2001-03-18"),
        objective: "Perte de poids",
        level: "Debutant",
        weightKg: 73,
        heightCm: 168,
        progressScore: 32,
        notes: "Prefere les seances courtes en semaine."
      }
    }),
    prisma.member.create({
      data: {
        firstName: "Amine",
        lastName: "Kabbaj",
        email: "amine.kabbaj@example.com",
        phone: "0611002200",
        gender: "Homme",
        birthDate: new Date("1999-11-05"),
        objective: "Prise de masse",
        level: "Intermediaire",
        weightKg: 68,
        heightCm: 176,
        progressScore: 56,
        notes: "Travaille surtout le soir."
      }
    }),
    prisma.member.create({
      data: {
        firstName: "Meryem",
        lastName: "Fassi",
        email: "meryem.fassi@example.com",
        phone: "0677889900",
        gender: "Femme",
        birthDate: new Date("1995-07-26"),
        objective: "Condition physique",
        level: "Avance",
        weightKg: 61,
        heightCm: 164,
        progressScore: 78,
        notes: "Bonne regularite, objectif endurance."
      }
    })
  ]);

  const plans = await Promise.all([
    prisma.subscriptionPlan.create({
      data: {
        name: "Mensuel Essentiel",
        durationDays: 30,
        price: 299,
        benefits: "Acces plateau, vestiaires, suivi mensuel"
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: "Trimestriel Plus",
        durationDays: 90,
        price: 799,
        benefits: "Acces complet, cours collectifs, bilan coach"
      }
    }),
    prisma.subscriptionPlan.create({
      data: {
        name: "Annuel Premium",
        durationDays: 365,
        price: 2890,
        benefits: "Acces illimite, coaching avance, recommandations IA prioritaires"
      }
    })
  ]);

  const today = new Date();
  const subscriptions = await Promise.all([
    prisma.subscription.create({
      data: {
        memberId: members[0].id,
        planId: plans[1].id,
        startDate: addDays(today, -20),
        endDate: addDays(today, 70),
        status: "ACTIVE"
      }
    }),
    prisma.subscription.create({
      data: {
        memberId: members[1].id,
        planId: plans[0].id,
        startDate: addDays(today, -27),
        endDate: addDays(today, 3),
        status: "ACTIVE"
      }
    }),
    prisma.subscription.create({
      data: {
        memberId: members[2].id,
        planId: plans[2].id,
        startDate: addDays(today, -80),
        endDate: addDays(today, 285),
        status: "ACTIVE"
      }
    })
  ]);

  const courses = await Promise.all([
    prisma.course.create({
      data: {
        title: "Full Body Strength",
        activity: "Musculation",
        description: "Circuit complet force, gainage et technique.",
        startsAt: setTime(addDays(today, 1), 18, 0),
        endsAt: setTime(addDays(today, 1), 19, 0),
        capacity: 12,
        room: "Studio A",
        coachId: coaches[0].id
      }
    }),
    prisma.course.create({
      data: {
        title: "Cardio Boxing",
        activity: "Cardio",
        description: "Seance dynamique pour endurance et depense calorique.",
        startsAt: setTime(addDays(today, 2), 19, 30),
        endsAt: setTime(addDays(today, 2), 20, 30),
        capacity: 16,
        room: "Studio B",
        coachId: coaches[1].id
      }
    }),
    prisma.course.create({
      data: {
        title: "Mobility Reset",
        activity: "Mobilite",
        description: "Mobilite, respiration et prevention des blessures.",
        startsAt: setTime(addDays(today, 4), 10, 0),
        endsAt: setTime(addDays(today, 4), 11, 0),
        capacity: 10,
        room: "Zone calme",
        coachId: coaches[0].id
      }
    })
  ]);

  await prisma.enrollment.createMany({
    data: [
      { memberId: members[0].id, courseId: courses[0].id },
      { memberId: members[0].id, courseId: courses[1].id },
      { memberId: members[1].id, courseId: courses[0].id },
      { memberId: members[2].id, courseId: courses[2].id }
    ]
  });

  await prisma.attendance.createMany({
    data: [
      { memberId: members[0].id, courseId: courses[0].id, checkInAt: addDays(today, -8), status: "PRESENT" },
      { memberId: members[0].id, courseId: courses[1].id, checkInAt: addDays(today, -5), status: "LATE" },
      { memberId: members[1].id, courseId: courses[0].id, checkInAt: addDays(today, -7), status: "PRESENT" },
      { memberId: members[2].id, courseId: courses[2].id, checkInAt: addDays(today, -3), status: "PRESENT" }
    ]
  });

  await prisma.payment.createMany({
    data: [
      { memberId: members[0].id, subscriptionId: subscriptions[0].id, amount: 799, method: "Carte bancaire", status: "PAID", reference: "PAY-SARA-001" },
      { memberId: members[1].id, subscriptionId: subscriptions[1].id, amount: 299, method: "Especes", status: "PAID", reference: "PAY-AMINE-001" },
      { memberId: members[2].id, subscriptionId: subscriptions[2].id, amount: 2890, method: "Virement", status: "PAID", reference: "PAY-MERYEM-001" }
    ]
  });

  const memberWithHistory = await prisma.member.findUnique({
    where: { id: members[0].id },
    include: {
      attendance: true,
      payments: true,
      subscriptions: { include: { plan: true }, orderBy: { endDate: "desc" } },
      enrollments: { include: { course: true } },
      recommendations: true
    }
  });

  const recommendation = generateTrainingRecommendation(memberWithHistory);
  await prisma.recommendation.create({
    data: {
      memberId: members[0].id,
      goal: recommendation.goal,
      summary: recommendation.summary,
      weeklyFrequency: recommendation.weeklyFrequency,
      intensity: recommendation.intensity,
      plan: JSON.stringify(recommendation.plan)
    }
  });

  console.log("Seed termine avec succes.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
