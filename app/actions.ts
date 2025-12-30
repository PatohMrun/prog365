'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function ensureUserExists(email: string) {
    if (!email) return null;

    try {
        let user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            user = await prisma.user.create({
                data: { email },
            });
        }

        return user;
    } catch (error) {
        console.error('Database Error:', error);
        // Fallback for when DB connection fails (e.g. during build/setup)
        return null;
    }
}

export async function updateUserProfile(email: string, name: string) {
    if (!email || !name) return { error: 'Missing Data' };

    // Generate Initials Avatar
    // e.g. "John Doe" -> "JD"
    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();

    // Using UI Avatars API for consistency
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;

    try {
        await prisma.user.upsert({
            where: { email },
            update: {
                name,
                avatarUrl
            },
            create: {
                email,
                name,
                avatarUrl
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('Update Error:', error);
        return { error: 'Failed to update profile' };
    }
}
