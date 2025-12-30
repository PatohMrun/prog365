"use client";

import { useState, useEffect } from "react";
import { BarChart3, Plus, Trash2, Calendar, TrendingUp, AlertCircle, CheckCircle2, Pencil } from "lucide-react";
import { Storage, Project } from "../utils/storage";

export default function ProjectsSection() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDeadline, setNewProjectDeadline] = useState('');

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editName, setEditName] = useState('');
    const [editDeadline, setEditDeadline] = useState('');

    // Delete Confirmation State
    const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = () => {
        setProjects(Storage.getProjects());
    };

    const addProject = () => {
        if (!newProjectName.trim()) return;

        const today = new Date().toISOString().split('T')[0];
        // Default deadline: 30 days from now if not specified
        const defaultDeadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const newProject: Project = {
            id: Date.now().toString(),
            name: newProjectName.trim(),
            progress: 0,
            lastUpdated: 'Just created',
            startDate: today,
            deadline: newProjectDeadline || defaultDeadline
        };

        const updated = [...projects, newProject];
        Storage.saveProjects(updated);
        setProjects(updated);

        setNewProjectName('');
        setNewProjectDeadline('');
        setShowAddProject(false);
    };

    const promptDelete = (id: string) => {
        setProjectToDelete(id);
    };

    const confirmDelete = () => {
        if (!projectToDelete) return;
        const updated = projects.filter(p => p.id !== projectToDelete);
        Storage.saveProjects(updated);
        setProjects(updated);
        setProjectToDelete(null);
    };

    const startEdit = (project: Project) => {
        setEditingId(project.id);
        setEditName(project.name);
        setEditDeadline(project.deadline);
    };

    const saveEdit = () => {
        if (!editingId || !editName.trim()) {
            setEditingId(null);
            return;
        }

        const updated = projects.map(p =>
            p.id === editingId ? { ...p, name: editName.trim(), deadline: editDeadline || p.deadline } : p
        );
        Storage.saveProjects(updated);
        setProjects(updated);
        setEditingId(null);
    };

    const updateProgress = (id: string, delta: number) => {
        const updated = projects.map(p =>
            p.id === id ? {
                ...p,
                progress: Math.max(0, Math.min(100, p.progress + delta)),
                lastUpdated: 'Just now'
            } : p
        );
        Storage.saveProjects(updated);
        setProjects(updated);
    };

    // Calculate Pacing Logic
    const getPacingStats = (project: Project) => {
        const start = new Date(project.startDate).getTime();
        const end = new Date(project.deadline).getTime();
        const now = Date.now();

        // Days remaining
        const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
        const isOverdue = daysLeft < 0;

        // Prevent division by zero or future starts
        if (end <= start) return { status: 'on_track', message: 'No Time Tracking', isOverdue, daysLeft };

        const totalDuration = end - start;
        const elapsed = now - start;
        const timePercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

        // Pacing: Work Progress vs Time Elapsed
        const gap = project.progress - timePercent;

        let status: 'ahead' | 'on_track' | 'behind' | 'overdue' = 'on_track';

        if (isOverdue) {
            status = 'overdue';
        } else {
            if (gap > 10) status = 'ahead';
            if (gap < -10) status = 'behind';
        }

        return { status, timePercent, gap, daysLeft, isOverdue };
    };

    return (
        <div className="min-h-screen bg-transparent text-white pb-20 px-4 pt-6 relative">
            {/* Delete Confirmation Modal */}
            {projectToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 animate-scale-in border border-[#fca5a5]/20">
                        <div className="flex items-center gap-3 text-red-400 mb-4">
                            <AlertCircle size={24} />
                            <h3 className="text-lg font-bold">Delete Project?</h3>
                        </div>
                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            Are you sure you want to delete this project? <br />
                            <span className="text-gray-500 italic">This cannot be undone and progress history will be lost.</span>
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setProjectToDelete(null)}
                                className="flex-1 py-3 rounded-xl bg-[#2a2a2a] text-white hover:bg-[#333] transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-colors font-medium text-sm"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto">
                <div className="flex items-center space-x-3 mb-8">
                    <BarChart3 className="text-[#7dd3fc]" size={28} />
                    <h1 className="text-3xl font-bold text-[#7dd3fc]">Projects</h1>
                </div>

                <div className="glass-card rounded-2xl p-8 hover-lift">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-semibold text-[#7dd3fc]">Active Projects</h2>
                        <button
                            onClick={() => setShowAddProject(true)}
                            className="text-[#7dd3fc] hover:text-white transition-colors p-2 rounded-lg hover:bg-[#1a1a1a]"
                        >
                            <Plus size={20} />
                        </button>
                    </div>

                    {showAddProject && (
                        <div className="mb-6 p-4 rounded-xl gradient-bg space-y-4">
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Project Name</label>
                                <input
                                    type="text"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    placeholder="Enter project name..."
                                    className="w-full input-field rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">Target Deadline</label>
                                <input
                                    type="date"
                                    value={newProjectDeadline}
                                    onChange={(e) => setNewProjectDeadline(e.target.value)}
                                    className="w-full input-field rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                />
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button
                                    onClick={addProject}
                                    className="px-4 py-2 bg-[#7dd3fc] text-black rounded-lg text-sm font-medium hover:bg-[#7dd3fc]/80 transition-colors"
                                >
                                    Add Project
                                </button>
                                <button
                                    onClick={() => setShowAddProject(false)}
                                    className="px-4 py-2 bg-[#1a1a1a] text-white rounded-lg text-sm hover:bg-[#666] transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid gap-6">
                        {projects.map(project => {
                            const stats = getPacingStats(project);
                            // Colors based on pacing
                            const statusColor = stats.status === 'ahead' ? '#86efac'
                                : stats.status === 'behind' || stats.status === 'overdue' ? '#fca5a5'
                                    : '#7dd3fc';

                            return (
                                <div key={project.id} className="group">
                                    <div className="p-6 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all border border-[#1a1a1a] hover:border-gray-800">
                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">

                                            {/* Left Info Section with Editing */}
                                            <div className="flex-1 min-w-0 w-full">
                                                {editingId === project.id ? (
                                                    <div className="space-y-3 mb-2">
                                                        <input
                                                            type="text"
                                                            value={editName}
                                                            onChange={(e) => setEditName(e.target.value)}
                                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#7dd3fc] outline-none"
                                                            placeholder="Project Name"
                                                        />
                                                        <input
                                                            type="date"
                                                            value={editDeadline}
                                                            onChange={(e) => setEditDeadline(e.target.value)}
                                                            className="w-full bg-[#1a1a1a] border border-[#333] rounded px-3 py-2 text-sm focus:border-[#7dd3fc] outline-none text-gray-300"
                                                        />
                                                        <div className="flex gap-2">
                                                            <button onClick={saveEdit} className="px-3 py-1 bg-[#7dd3fc] text-black text-xs font-bold rounded">Save</button>
                                                            <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-[#333] text-white text-xs font-bold rounded">Cancel</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="group/title relative">
                                                        <div className="flex items-center gap-2">
                                                            <h3 className="font-semibold text-lg break-words leading-tight">{project.name}</h3>
                                                            <button
                                                                onClick={() => startEdit(project)}
                                                                className="opacity-0 group-hover/title:opacity-100 text-gray-500 hover:text-[#7dd3fc] transition-opacity"
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 mt-3">
                                                            <span className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border whitespace-nowrap ${stats.status === 'ahead' ? 'bg-[#86efac]/10 border-[#86efac]/20 text-[#86efac]' :
                                                                    stats.status === 'behind' || stats.status === 'overdue' ? 'bg-[#fca5a5]/10 border-[#fca5a5]/20 text-[#fca5a5]' :
                                                                        'bg-[#7dd3fc]/10 border-[#7dd3fc]/20 text-[#7dd3fc]'
                                                                }`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${stats.status === 'ahead' ? 'bg-[#86efac]' :
                                                                        stats.status === 'behind' || stats.status === 'overdue' ? 'bg-[#fca5a5]' :
                                                                            'bg-[#7dd3fc]'
                                                                    }`} />
                                                                {stats.status === 'ahead' ? 'Ahead' :
                                                                    stats.status === 'behind' ? 'Behind' :
                                                                        stats.status === 'overdue' ? 'Overdue' : 'On Track'}
                                                            </span>
                                                            <span className={`text-xs whitespace-nowrap ${stats.isOverdue ? 'text-red-400 font-medium' : 'text-gray-400'}`}>
                                                                {stats.isOverdue
                                                                    ? `${Math.abs(stats.daysLeft)} days overdue`
                                                                    : `${stats.daysLeft} days left`
                                                                }
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Right Controls Section */}
                                            {!editingId && (
                                                <div className="flex items-center justify-between w-full sm:w-auto mt-2 sm:mt-0 gap-4">
                                                    <div className="flex items-center space-x-3 bg-[#0a0a0a] rounded-full px-1 py-1">
                                                        <button
                                                            onClick={() => updateProgress(project.id, -5)}
                                                            className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#333] transition-colors flex items-center justify-center text-sm font-bold active:scale-95"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-[#7dd3fc] font-mono text-lg min-w-[2.5rem] text-center font-bold">
                                                            {project.progress}%
                                                        </span>
                                                        <button
                                                            onClick={() => updateProgress(project.id, 5)}
                                                            className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#333] transition-colors flex items-center justify-center text-sm font-bold active:scale-95"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => promptDelete(project.id)}
                                                        className="text-gray-500 hover:text-red-400 transition-all p-2 hover:bg-red-500/10 rounded-lg"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* Pacing Bars */}
                                        <div className="space-y-1 relative pt-2">
                                            {/* Ghost Bar (Time Elapsed) */}
                                            <div className="absolute top-0 w-full h-full pointer-events-none opacity-20">
                                                <div
                                                    className="absolute top-2 bottom-0 w-0.5 bg-white z-10"
                                                    style={{ left: `${Math.min(100, Math.max(0, stats.timePercent))}%` }}
                                                />
                                                <span className="absolute -top-3 text-[10px] text-gray-400 transform -translate-x-1/2"
                                                    style={{ left: `${Math.min(100, Math.max(0, stats.timePercent))}%` }}>
                                                    Today
                                                </span>
                                            </div>

                                            <div className="w-full bg-[#1a1a1a] rounded-full h-3 overflow-hidden relative z-0">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${project.progress > 90 ? 'progress-glow' : ''}`}
                                                    style={{
                                                        width: `${project.progress}%`,
                                                        background: statusColor
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {projects.length === 0 && (
                            <p className="text-gray-400 text-center py-8 text-sm">No projects yet. Add your first project to track!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
