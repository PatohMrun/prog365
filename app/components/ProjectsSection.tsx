"use client";

import { useState, useEffect } from "react";
import { BarChart3, Plus, Trash2 } from "lucide-react";

interface Project {
    id: string;
    name: string;
    progress: number;
    lastUpdated: string;
}

export default function ProjectsSection() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [showAddProject, setShowAddProject] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');

    useEffect(() => {
        const savedProjects = localStorage.getItem('projects');
        if (savedProjects) setProjects(JSON.parse(savedProjects));
    }, []);

    const addProject = () => {
        if (!newProjectName.trim()) return;

        const newProject: Project = {
            id: Date.now().toString(),
            name: newProjectName.trim(),
            progress: 0,
            lastUpdated: 'Just created'
        };

        const updated = [...projects, newProject];
        setProjects(updated);
        localStorage.setItem('projects', JSON.stringify(updated));

        setNewProjectName('');
        setShowAddProject(false);
    };

    const deleteProject = (id: string) => {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        localStorage.setItem('projects', JSON.stringify(updated));
    };

    const updateProgress = (id: string, delta: number) => {
        const updated = projects.map(p =>
            p.id === id ? {
                ...p,
                progress: Math.max(0, Math.min(100, p.progress + delta)),
                lastUpdated: 'Just now'
            } : p
        );
        setProjects(updated);
        localStorage.setItem('projects', JSON.stringify(updated));
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20 px-4 pt-6">
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
                        <div className="mb-6 p-4 rounded-xl gradient-bg">
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                placeholder="Enter project name..."
                                className="w-full input-field rounded-lg px-3 py-2 text-white placeholder-gray-400"
                                onKeyPress={(e) => e.key === 'Enter' && addProject()}
                                autoFocus
                            />
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
                        {projects.map(project => (
                            <div key={project.id} className="group">
                                <div className="p-6 rounded-xl bg-[#0f0f0f] hover:bg-[#1a1a1a] transition-all">
                                    <div className="flex items-center justify-between gap-4 mb-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-lg break-words">{project.name}</h3>
                                            <p className="text-gray-400 text-sm">{project.lastUpdated}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => updateProgress(project.id, -5)}
                                                    className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#666] transition-colors flex items-center justify-center text-sm font-bold"
                                                >
                                                    -
                                                </button>
                                                <span className="text-[#7dd3fc] font-mono text-lg min-w-[3rem] text-center">
                                                    {project.progress}%
                                                </span>
                                                <button
                                                    onClick={() => updateProgress(project.id, 5)}
                                                    className="w-8 h-8 rounded-full bg-[#1a1a1a] hover:bg-[#666] transition-colors flex items-center justify-center text-sm font-bold"
                                                >
                                                    +
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => deleteProject(project.id)}
                                                className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-all p-1"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <div className="w-full bg-[#1a1a1a] rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${project.progress > 70 ? 'progress-glow' : ''
                                                    }`}
                                                style={{
                                                    width: `${project.progress}%`,
                                                    background: `linear-gradient(90deg, #7dd3fc, #86efac)`
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {projects.length === 0 && (
                            <p className="text-gray-400 text-center py-8 text-sm">No projects yet. Add your first project to track!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
