import { type Request, type Response, type NextFunction } from 'express';
import jwt , {type JwtPayload} from 'jsonwebtoken';

// This extends the standard Express Request to include our custom userId
export interface AuthRequest extends Request {
    userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): any => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    try {
        // 2. Verify the token using your secret key
        const secret = process.env["JWT_ACCESS_SECRET"];
        if (!secret) {
            throw new Error('JWT_ACCESS_SECRET NOT DEFINED');
        }
        const decoded = jwt.verify(token, secret) as JwtPayload;
        
        // 3. Attach the userId to the request so the next function can use it!
        req.userId = decoded.userId as string;
        
        // 4. Let the user pass through to the route
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
};