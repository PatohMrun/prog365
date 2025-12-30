'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET (List)
export async function getReflections(email: string) {
    if (!email) return [];

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { reflections: { orderBy: { date: 'desc' } } }
        });

        if (!user) return [];
        // Map to match frontend expectations if needed, or just return as is
        // Frontend expects: { id, date, text, verseReference? }
        return user.reflections;
    } catch (error) {
        console.error('getReflections error:', error);
        return [];
    }
}

// CREATE
export async function createReflection(email: string, text: string, verseReference: string) {
    if (!email || !text) return { error: "Missing data" };

    try {
        const date = new Date().toLocaleDateString('en-CA');

        await prisma.reflection.create({
            data: {
                content: text,
                verseReference,
                date,
                user: { connect: { email } }
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('createReflection error:', error);
        return { error: 'Failed' };
    }
}
