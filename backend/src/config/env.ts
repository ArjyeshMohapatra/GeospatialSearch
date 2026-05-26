import 'dotenv/config';

if (!process.env.JWT_ACCESS_SECRET || !process.env.JWT_REFRESH_SECRET) {
    throw new Error("CRITICAL: Missing JWT Secrets in .env file");
}

export const config = {
    port: process.env.PORT || 3000,
    jwt: {
        accessSecret: process.env.JWT_ACCESS_SECRET as string,
        refreshSecret: process.env.JWT_REFRESH_SECRET as string,
        accessExpiresIn: '20m',
        refreshExpiresIn: '7d'
    }
} as const;