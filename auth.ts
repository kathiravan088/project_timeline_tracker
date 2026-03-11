import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { DefaultSession } from "next-auth"
import { z } from 'zod';

declare module "next-auth" {
    interface User {
        role?: string
    }
    interface Session {
        user: {
            role?: string
            id?: string
        } & DefaultSession["user"]
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: PrismaAdapter(prisma),
    session: { strategy: 'jwt' },
    pages: {
        signIn: '/',
    },
    providers: [
        Credentials({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            authorize: async (credentials) => {
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (parsedCredentials.success) {
                    const { email, password } = parsedCredentials.data;
                    console.log(`Auth attempt for: ${email}`);
                    const user = await prisma.user.findUnique({ where: { email } });

                    if (!user) {
                        console.log(`User not found: ${email}`);
                        return null;
                    }

                    const passwordsMatch = await bcrypt.compare(password, user.password);
                    console.log(`Password match for ${email}: ${passwordsMatch}`);

                    if (passwordsMatch) {
                        return {
                            ...user,
                            id: user.id.toString(),
                            role: user.role
                        };
                    }
                }

                console.log('Invalid credentials or parse failure');
                return null;
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.role = token.role as string;
                session.user.id = token.id as string;
            }
            return session;
        },
    },
});
