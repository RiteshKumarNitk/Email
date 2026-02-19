
import dbConnect from '@/lib/db';
import User, { IUser } from '@/models/User';
import { hashPassword, comparePassword, generateToken, JWTPayload } from '@/lib/auth';
import { loginSchema } from '@/validation/auth.schema';
import { z } from 'zod'; // Or just use the schema type
import { ApiResponse } from '@/lib/api-response';

export type LoginInput = z.infer<typeof loginSchema>;

export class AuthService {
    static async login(data: LoginInput) {
        await dbConnect();

        // Find User
        const user = await User.findOne({ email: data.email });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Verify Password
        const isValid = await comparePassword(data.password, user.password!);

        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        // Generate Token
        const payload: Partial<JWTPayload> = {
            id: user._id as string,
            email: user.email,
        };
        const token = generateToken(payload);

        return { token, user: { id: user._id, email: user.email, name: user.name } };
    }
}
