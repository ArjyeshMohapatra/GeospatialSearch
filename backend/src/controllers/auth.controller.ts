import { type Request, type Response } from "express";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const accessSecret = process.env["JWT_ACCESS_SECRET"];
const refreshSecret = process.env["JWT_REFRESH_SECRET"];

if (!accessSecret || !refreshSecret) {
    throw new Error("JWT secrets are missing");
}

export const signup = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            res.status(400).json({ error: 'User already exists' });
            return;
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { email, passwordHash }
        });

        const accessToken = jwt.sign(
            { userId: newUser.id },
            accessSecret,
            { expiresIn: '20m' }
        );

        const refreshToken = jwt.sign(
            { userId: newUser.id },
            refreshSecret,
            { expiresIn: '7d' }
        );

        await prisma.user.update({
            where: { id: newUser.id },
            data: { refreshToken }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'User created successfully',
            accessToken
        });

    } catch (error) {
        console.error('Signup Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const signin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }

        const accessToken = jwt.sign(
            { userId: user.id },
            accessSecret,
            { expiresIn: '20m' }
        );

        const refreshToken = jwt.sign(
            { userId: user.id },
            refreshSecret,
            { expiresIn: '7d' }
        );

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Signed in successfully',
            accessToken
        });

    } catch (error) {
        console.error('Signin Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refresh = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.cookies;

        if (!refreshToken) {
            res.status(401).json({
                error: 'No refresh token provided'
            });
            return;
        }

        const decoded = jwt.verify(
            refreshToken,
            refreshSecret
        ) as { userId: string };

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId }
        });

        if (!user || user.refreshToken !== refreshToken) {
            res.status(403).json({
                error: 'Invalid refresh token'
            });
            return;
        }

        const newAccessToken = jwt.sign(
            { userId: user.id },
            accessSecret,
            { expiresIn: '20m' }
        );

        const newRefreshToken = jwt.sign(
            { userId: user.id },
            refreshSecret,
            { expiresIn: '7d' }
        );

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: newRefreshToken }
        });

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            // secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            accessToken: newAccessToken
        });

    } catch (error) {
        res.clearCookie('refreshToken');

        res.status(403).json({
            error: 'Session expired. Please log in again.'
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    try {
        const { refreshToken } = req.cookies;

        if (refreshToken) {

            const decoded = jwt.decode(
                refreshToken
            ) as { userId: string } | null;

            if (decoded?.userId) {
                await prisma.user.update({
                    where: { id: decoded.userId },
                    data: { refreshToken: null }
                });
            }
        }

    } catch (error) {
        console.error('Logout error');
    } finally {
        res.clearCookie('refreshToken');

        res.status(200).json({
            message: 'Logged out successfully'
        });
    }
};