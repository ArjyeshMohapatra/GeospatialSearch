import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

export const createSearchRecord = async (userId: string, latitude: number, longitude: number, radius: number, poiType: string) => {
    return await prisma.searchHistory.create({
        data: {
            userId,
            latitude,
            longitude,
            radius,
            poiType
        }
    });
};