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
}

export const Storage = {
    getHabits: (): { positive: Habit[], negative: Habit[] } => {
        if (typeof window === 'undefined') return { positive: [], negative: [] };

        const today = new Date().toISOString().split('T')[0];

        // Migration & Fetch Logic
        let positive = JSON.parse(localStorage.getItem('positiveHabits') || '[]');
        let negative = JSON.parse(localStorage.getItem('badHabits') || '[]');
        let needsUpdate = false;

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
            deadline: p.deadline || nextMonth
        }));
    },

    saveProjects: (projects: Project[]) => {
        localStorage.setItem('projects', JSON.stringify(projects));
    },

    // The Magic Daily Reset Logic
    checkDailyReset: () => {
        if (typeof window === 'undefined') return;

        const { positive, negative } = Storage.getHabits();
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let changed = false;

        // Logic for Positive Habits
        const updatePositive = positive.map(h => {
            // If checked today, no change
            if (h.lastChecked === today) return h;

            // If checked yesterday, carry over unless it was completed (which resets daily flag)
            // Actually, standard logic: Reset 'completed' to false. 
            // Streak Check: Did we complete it yesterday?
            // If lastChecked < yesterday and !completed, streak died.

            const wasUpdatedYesterday = h.lastChecked === yesterday;

            // If we missed a day (lastChecked < yesterday), streak = 0
            if (h.lastChecked < yesterday) {
                return { ...h, completed: false, streak: 0, lastChecked: today };
            }

            // If we are just entering a new day from yesterday
            if (wasUpdatedYesterday) {
                // If uncompleted yesterday, streak break
                // NOTE: This assumes 'completed' flag holds yesterday's state until this runs
                if (!h.completed) {
                    return { ...h, completed: false, streak: 0, lastChecked: today };
                }
                // If completed yesterday, streak is safe. Just reset flag.
                return { ...h, completed: false, lastChecked: today };
            }

            return { ...h, lastChecked: today };
        });

        // Logic for Negative Habits (Passive Success)
        const updateNegative = negative.map(h => {
            if (h.lastChecked === today) return h;

            // If we missed checking in yesterday (or many days)
            // Since negative habits are PASSIVE, missing days = SUCCESS
            // We calculate how many days passed and add to streak
            const lastDate = new Date(h.lastChecked);
            const currDate = new Date(today);
            const diffTime = Math.abs(currDate.getTime() - lastDate.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            // If completed=true, that means we FAILED that day.
            // But 'completed' flag only tracks current day state.
            // So if we are running this, it means we entered a NEW day.
            // The fact we are here means we survived yesterday (unless we clicked fail yesterday).

            // Simplified: If dragging into new day, and we didn't fail yesterday, ADD streak.
            // However, we can't easily know if we failed yesterday if we didn't open the app.
            // Assumption: If 'completed' is true, it means we failed ON THE DAY OF 'lastChecked'.

            let newStreak = h.streak;

            // Case 1: We clicked "Fail" on the last checked date
            if (h.completed) {
                // We failed that day. Streak matches that state (likely 0).
                // Now we start fresh today.
                return { ...h, completed: false, streak: 0, lastChecked: today };
            }

            // Case 2: We didn't click fail.
            // We add the difference in days to the streak.
            newStreak += diffDays;

            return { ...h, completed: false, streak: newStreak, lastChecked: today };
        });

        // Save only if different (simplified: always save for now to ensure sync)
        Storage.saveHabits(updatePositive, updateNegative);
    }
};
