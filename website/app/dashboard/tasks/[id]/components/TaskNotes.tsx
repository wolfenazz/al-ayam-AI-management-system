'use client';

import React, { useState } from 'react';
import { useUpdateTask } from '@/hooks/useTasks';
import { Task, TaskNote } from '@/types/task';
import { useAuth } from '@/lib/auth/AuthContext';

interface TaskNotesProps {
    task: Task;
}

export default function TaskNotes({ task }: TaskNotesProps) {
    const updateTask = useUpdateTask();
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [newNote, setNewNote] = useState('');

    const notes: TaskNote[] = task.notes || [];

    const handleAddNote = (e: React.FormEvent) => {
        e.preventDefault();

        if (!newNote.trim() || !user) return;

        const note: TaskNote = {
            id: Date.now().toString(),
            content: newNote.trim(),
            author_id: user.uid,
            author_name: user.displayName || 'Unknown',
            created_at: new Date().toISOString(),
        };

        const newNotes = [...notes, note];

        updateTask.mutate({
            id: task.id,
            updates: { notes: newNotes }
        });

        setNewNote('');
    };

    const handleDeleteNote = (noteId: string) => {
        const newNotes = notes.filter((note) => note.id !== noteId);

        updateTask.mutate({
            id: task.id,
            updates: { notes: newNotes }
        });
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm">
            <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-gray-600">note</span>
                        <h3 className="text-base font-semibold text-gray-900">Notes & Annotations</h3>
                        {notes.length > 0 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {notes.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                    >
                        {isExpanded ? (
                            <>
                                <span className="material-symbols-outlined text-lg">expand_less</span>
                                Collapse
                            </>
                        ) : (
                            <>
                                <span className="material-symbols-outlined text-lg">expand_more</span>
                                Expand
                            </>
                        )}
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="p-4 space-y-4">
                    <form onSubmit={handleAddNote} className="flex gap-2">
                        <input
                            type="text"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            placeholder="Add a note..."
                            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm"
                        />
                        <button
                            type="submit"
                            disabled={!newNote.trim()}
                            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </form>

                    {notes.length === 0 ? (
                        <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                            <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">edit_note</span>
                            <p className="text-sm text-gray-500">No notes yet</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {notes.map((note) => (
                                <div
                                    key={note.id}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 group hover:border-gray-200 transition-colors"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-medium text-gray-700">
                                            {note.author_name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                                {new Date(note.created_at).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-0.5"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        {note.content}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
