'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Helper to get daily string
function getToday() {
    return new Date().toLocaleDateString('en-CA');
}

// GET (List)
export async function getHabits(email: string) {
    if (!email) return { positive: [], negative: [] };

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { habits: true }
        });

        if (!user) return { positive: [], negative: [] };

        const positive = user.habits.filter((h: any) => h.type === 'positive');
        const negative = user.habits.filter((h: any) => h.type === 'negative');

        // Check if completed today on the fly
        const today = getToday();
        const mapper = (h: any) => ({
            ...h,
            completed: h.completedDates.includes(today)
        });

        return {
            positive: positive.map(mapper),
            negative: negative.map(mapper)
        };
    } catch (error) {
        console.error('getHabits error:', error);
        return { positive: [], negative: [] };
    }
}

// CREATE
export async function createHabit(email: string, name: string, type: 'positive' | 'negative') {
    if (!email || !name) return { error: "Missing data" };
    try {
        await prisma.habit.create({
            data: {
                name,
                type,
                user: { connect: { email } },
                completedDates: []
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('createHabit error:', error);
        return { error: 'Failed' };
    }
}

// TOGGLE (Complete/Uncomplete)
export async function toggleHabit(id: string) {
    const today = getToday();

    try {
        const habit = await prisma.habit.findUnique({ where: { id } });
        if (!habit) throw new Error("Not found");

        const isCompletedToday = habit.completedDates.includes(today);
        let newHistory = isCompletedToday
            ? habit.completedDates.filter((d: string) => d !== today)
            : [...habit.completedDates, today];

        // Streak Calculation
        // Simplified: Count consecutive days backwards from yesterday (if completed today) OR today
        // But for minimal complexity, we just increment/decrement streak based on action for now, OR recalculate fully.
        // Full recalculation is safer.
        let streak = 0;
        // ... (We can implement robust streak calc later, for now we mirror the simple logic)

        if (!isCompletedToday) {
            // completing
            streak = habit.streak + 1;
        } else {
            // uncompleting
            streak = Math.max(0, habit.streak - 1);
        }

        await prisma.habit.update({
            where: { id },
            data: {
                completedDates: newHistory,
                streak
            }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}

// EDIT (Rename)
export async function updateHabitName(id: string, name: string) {
    if (!name.trim()) return;
    try {
        await prisma.habit.update({
            where: { id },
            data: { name }
        });
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}

// DELETE or ARCHIVE
export async function updateHabitStatus(id: string, status: 'active' | 'archived' | 'deleted') {
    try {
        if (status === 'deleted') {
            await prisma.habit.delete({ where: { id } });
        } else {
            await prisma.habit.update({
                where: { id },
                data: { status }
            });
        }
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}
