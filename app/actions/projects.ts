'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// GET (List)
export async function getProjects(email: string) {
    if (!email) return [];

    try {
        const user = await prisma.user.findUnique({
            where: { email },
            include: { projects: { orderBy: { createdAt: 'desc' } } }
        });

        if (!user) return [];
        return user.projects;
    } catch (error) {
        console.error('getProjects error:', error);
        return [];
    }
}

// CREATE
export async function createProject(email: string, name: string, startDate: string, deadline: string) {
    if (!email || !name || !startDate || !deadline) return { error: "Missing data" };

    try {
        const project = await prisma.project.create({
            data: {
                name,
                startDate: new Date(startDate),
                deadline: new Date(deadline),
                user: { connect: { email } },
                status: 'active',
                progress: 0
            }
        });
        revalidatePath('/');
        return { success: true, project };
    } catch (error) {
        console.error('createProject error:', error);
        return { error: 'Failed' };
    }
}

// UPDATE (Progress, Name, Deadline)
export async function updateProject(id: string, data: { name?: string, progress?: number, deadline?: string }) {
    try {
        const updateData: any = { ...data };
        if (data.deadline) {
            updateData.deadline = new Date(data.deadline);
        }

        const project = await prisma.project.update({
            where: { id },
            data: updateData
        });
        revalidatePath('/');
        return { success: true, project };
    } catch (error) {
        return { error: 'Failed' };
    }
}

// TOGGLE COMPLETE / ARCHIVE / DELETE
export async function updateProjectStatus(id: string, status: 'active' | 'completed' | 'archived' | 'deleted') {
    try {
        if (status === 'deleted') {
            await prisma.project.delete({ where: { id } });
        } else {
            const data: any = { status };
            // If completing, set completedDate
            if (status === 'completed') {
                data.completedDate = new Date();
                data.progress = 100;
            } else if (status === 'active') {
                data.completedDate = null;
            }

            const project = await prisma.project.update({
                where: { id },
                data
            });
            revalidatePath('/');
            return { success: true, project };
        }
        revalidatePath('/');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}
