import bcrypt from "bcryptjs";
import prisma from "../../config/prisma.js";
import { generateToken } from "../../utils/jwt.js";

export async function registerUser({ name, email, password }) {
  if (!name || !email || !password) {
    throw new Error("Name, email, and password are required");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      profile: {
        create: {
          dailyCalorieGoal: 2000,
          dietGoal: "MAINTAIN",
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
    },
  });

  return {
    user,
    token: generateToken(user.id),
  };
}

export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);

  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token: generateToken(user.id),
  };
}

export async function getCurrentUser(userId) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      profile: true,
    },
  });
}