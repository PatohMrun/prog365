'use server';

import prisma from '@/lib/prisma';
import { supabase } from '@/app/utils/supabase';

// This is a server action to get the current user's profile securely
export async function getUserProfile(email: string) {
    if (!email) return null;

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });
        return user;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}
