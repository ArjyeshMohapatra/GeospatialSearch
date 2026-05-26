import { type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { type AuthRequest } from '../types/index.js';
import * as historyService from '../services/index.js';

const prisma = new PrismaClient();

export const saveSearch = async (req: AuthRequest, res: Response): Promise<any> => {
    try {
        const userId = req?.userId;
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { latitude, longitude, radius, poiType } = req.body;

        const newSearch = await historyService.createSearchRecord(userId, latitude, longitude, radius, poiType);

        res.status(201).json({ message: 'Search saved successfully', search: newSearch });
    } catch (error) {
        console.error('Save search error: ', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};