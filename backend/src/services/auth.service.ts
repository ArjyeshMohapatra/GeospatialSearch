import { PrismaClient } from '@prisma/client';
import { config } from '../config/env.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const accessSecret = config.jwt.accessSecret;
const refreshSecret = config.jwt.refreshSecret;

const generateTokens = (userId: string) => {
    const accessToken = jwt.sign({ userId }, accessSecret, { expiresIn: config.jwt.accessExpiresIn });
    const refreshToken = jwt.sign({ userId }, refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
    return { accessToken, refreshToken };
};

export const registerUser = async (email: string, passwordPlain: string) => {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('USER_EXISTS');

    const passwordHash = await bcrypt.hash(passwordPlain, 10);
    const user = await prisma.user.create({ data: { email, passwordHash } });

    const tokens = generateTokens(user.id);
    
    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
    });

    return tokens;
};

export const authenticateUser = async (email: string, passwordPlain: string) => {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('INVALID_CREDENTIALS');

    const isPasswordValid = await bcrypt.compare(passwordPlain, user.passwordHash);
    if (!isPasswordValid) throw new Error('INVALID_CREDENTIALS');

    const tokens = generateTokens(user.id);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
    });

    return tokens;
};

export const rotateTokens = async (oldRefreshToken: string) => {
    const decoded = jwt.verify(oldRefreshToken, refreshSecret) as { userId: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    
    if (!user || user.refreshToken !== oldRefreshToken) throw new Error('INVALID_TOKEN');

    const tokens = generateTokens(user.id);

    await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: tokens.refreshToken }
    });

    return tokens;
};

export const revokeToken = async (refreshToken: string) => {
    const decoded = jwt.verify(refreshToken, refreshSecret) as { userId: string };
    await prisma.user.update({
        where: { id: decoded.userId },
        data: { refreshToken: null }
    });
};