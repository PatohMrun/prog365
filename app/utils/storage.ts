"use client";

export interface Habit {
    id: string;
    name: string;
    type: 'positive' | 'negative';
    completed: boolean;
    streak: number;
    history: string[]; // ISO date strings
    lastChecked: string; // ISO date string
}

export interface Project {
    id: string;
    name: string;
    progress: number;
    lastUpdated: string;
    startDate: string; // ISO date
    deadline: string; // ISO date
    completedDate?: string; // ISO date, if finished
    status?: 'active' | 'completed' | 'archived';
}

export const Storage = {
    getHabits: (): { positive: Habit[], negative: Habit[] } => {
        if (typeof window === 'undefined') return { positive: [], negative: [] };

        // Use Local Time (YYYY-MM-DD)
        const today = new Date().toLocaleDateString('en-CA');

        // Migration & Fetch Logic
        let positive = JSON.parse(localStorage.getItem('positiveHabits') || '[]');
        let negative = JSON.parse(localStorage.getItem('badHabits') || '[]');

        // Helper to migrate legacy habit to new schema
        const migrate = (h: any, type: 'positive' | 'negative'): Habit => ({
            id: h.id,
            name: h.name,
            type: h.type || type,
            completed: h.completed || false,
            streak: h.streak || 0,
            history: h.history || [],
            lastChecked: h.lastChecked || today
        });

        positive = positive.map((h: any) => migrate(h, 'positive'));
        negative = negative.map((h: any) => migrate(h, 'negative'));

        return { positive, negative };
    },

    saveHabits: (positive: Habit[], negative: Habit[]) => {
        localStorage.setItem('positiveHabits', JSON.stringify(positive));
        localStorage.setItem('badHabits', JSON.stringify(negative));
    },

    getProjects: (): Project[] => {
        if (typeof window === 'undefined') return [];

        const raw = JSON.parse(localStorage.getItem('projects') || '[]');
        const today = new Date().toISOString().split('T')[0];
        // Default deadline: 30 days from now
        const nextMonth = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        return raw.map((p: any) => ({
            id: p.id,
            name: p.name,
            progress: p.progress || 0,
            lastUpdated: p.lastUpdated || 'Recently',
            startDate: p.startDate || today,
            deadline: p.deadline || nextMonth,
            completedDate: p.completedDate || undefined,
            status: p.status || (p.completedDate ? 'completed' : 'active')
        }));
    },

    saveProjects: (projects: Project[]) => {
        localStorage.setItem('projects', JSON.stringify(projects));
    },

    // The Magic Daily Reset Logic
    checkDailyReset: () => {
        if (typeof window === 'undefined') return;

        const { positive, negative } = Storage.getHabits();
        const today = new Date().toLocaleDateString('en-CA');
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = yesterdayDate.toLocaleDateString('en-CA');

        // Unified Logic: Streak only survives if you checked it (completed=true) yesterday.
        // If you missed checking it, the streak dies.
        const updateHabitStreak = (h: Habit) => {
            // If already interactions today, leave it alone
            if (h.lastChecked === today) return h;

            // Check if we touched it yesterday
            const wasUpdatedYesterday = h.lastChecked === yesterday;

            if (wasUpdatedYesterday) {
                // If it was marked as completed (Success/Avoided), allow streak to continue
                // Reset 'completed' to false for the new day
                if (h.completed) {
                    return { ...h, completed: false, lastChecked: today, streak: h.streak + 1 }; // Increment streak on day rollover if successful
                }
                // If not completed yesterday, streak is lost.
                return { ...h, completed: false, streak: 0, lastChecked: today };
            }

            // If lastChecked was older than yesterday, streak is definitely broken
            return { ...h, completed: false, streak: 0, lastChecked: today };
        };

        // Note: The streak is currently incremented internally when viewing, 
        // OR we can increment it here. 
        // Previously: 'streak' value stored in DB was the CURRENT streak.
        // If I check the box, streak should seemingly go up immediately in UI.
        // BUT `checkDailyReset` runs on load. 
        // Let's stick to the previous pattern: Streak is a stored number.
        // If I completed yesterday, my streak is valid. 
        // Wait, if I completed yesterday, my streak should have already been N.
        // Today it is still N until I check it again? 
        // Standard Habit Tracker: Streak = N days in a row.
        // If I did it yesterday, I have a streak of N.
        // Today (empty), I still have streak of N. IF I miss today, tomorrow it becomes 0.
        // So `checkDailyReset` shouldn't increment. It should just preserve or reset.

        const updateHabitStreakPreserve = (h: Habit) => {
            if (h.lastChecked === today) return h;

            const wasUpdatedYesterday = h.lastChecked === yesterday;

            if (wasUpdatedYesterday) {
                if (h.completed) {
                    // Success yesterday! Streak survives.
                    // IMPORTANT: We do NOT increment here. The streak count reflects completed days.
                    // We just reset the flag for today.
                    return { ...h, completed: false, lastChecked: today };
                }
            }

            // Otherwise (missed yesterday or older), streak reset.
            return { ...h, completed: false, streak: 0, lastChecked: today };
        };

        const updatedPositive = positive.map(updateHabitStreakPreserve);
        const updatedNegative = negative.map(updateHabitStreakPreserve);

        Storage.saveHabits(updatedPositive, updatedNegative);
    }
};
