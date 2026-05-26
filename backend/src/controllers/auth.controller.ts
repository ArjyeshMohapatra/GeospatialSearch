import { type Request, type Response } from 'express';
import * as authService from '../services/index.js';

const setRefreshCookie = (res: Response, token: string) => {
    res.cookie('refreshToken', token, {
        httpOnly: true,  
        // secure: process.env.NODE_ENV === 'production', 
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
    });
};

export const signup = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await authService.registerUser(email, password);
        
        setRefreshCookie(res, refreshToken);
        res.status(201).json({ message: 'User created', accessToken });
    } catch (error: any) {
        if (error.message === 'USER_EXISTS') return res.status(400).json({ error: 'User already exists' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const signin = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;
        const { accessToken, refreshToken } = await authService.authenticateUser(email, password);
        
        setRefreshCookie(res, refreshToken);
        res.status(200).json({ message: 'Signed in', accessToken });
    } catch (error: any) {
        if (error.message === 'INVALID_CREDENTIALS') return res.status(401).json({ error: 'Invalid credentials' });
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const refresh = async (req: Request, res: Response): Promise<any> => {
    try {
        const { refreshToken } = req.cookies;
        if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

        const { accessToken, refreshToken: newRefreshToken } = await authService.rotateTokens(refreshToken);
        
        setRefreshCookie(res, newRefreshToken);
        res.status(200).json({ accessToken });
    } catch (error) {
        res.clearCookie('refreshToken');
        return res.status(403).json({ error: 'Session expired. Please log in again.' });
    }
};

export const logout = async (req: Request, res: Response): Promise<any> => {
    try {
        const { refreshToken } = req.cookies;
        if (refreshToken) await authService.revokeToken(refreshToken);
    } catch (error) {
        console.error('Logout error');
    } finally {
        res.clearCookie('refreshToken');
        res.status(200).json({ message: 'Logged out' });
    }
};