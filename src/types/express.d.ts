import { User } from "@prisma/client";

declare module "express-serve-static-core" {
    interface Request {
        user?: {
            id: string;
            name: string;
            email: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
        };
    }
}