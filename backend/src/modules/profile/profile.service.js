import prisma from "../../config/prisma.js";

export async function getProfile(userId) {
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    throw new Error("Profile not found");
  }

  return profile;
}

export async function updateProfileAvatar(userId, file) {
  if (!file) {
    throw new Error("Avatar image is required");
  }

  const avatarUrl = `/uploads/${file.filename}`;

  return prisma.userProfile.upsert({
    where: { userId },
    update: {
      avatarUrl,
    },
    create: {
      userId,
      avatarUrl,
      dietGoal: "MAINTAIN",
      dailyCalorieGoal: 2000,
    },
  });
}

export async function updateProfile(userId, data) {
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    update: {
      age: data.age,
      gender: data.gender,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      dietGoal: data.dietGoal,
      dailyCalorieGoal: data.dailyCalorieGoal,
      dailyProteinGoal: data.dailyProteinGoal,
      dailyCarbGoal: data.dailyCarbGoal,
      dailyFatGoal: data.dailyFatGoal,
      preferences: data.preferences,
    },
    create: {
      userId,
      age: data.age,
      gender: data.gender,
      heightCm: data.heightCm,
      weightKg: data.weightKg,
      dietGoal: data.dietGoal || "MAINTAIN",
      dailyCalorieGoal: data.dailyCalorieGoal || 2000,
      dailyProteinGoal: data.dailyProteinGoal,
      dailyCarbGoal: data.dailyCarbGoal,
      dailyFatGoal: data.dailyFatGoal,
      preferences: data.preferences,
    },
  });

  return profile;
}