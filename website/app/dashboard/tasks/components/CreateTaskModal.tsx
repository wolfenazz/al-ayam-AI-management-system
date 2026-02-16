'use client';

import React, { useState } from 'react';
import { useUIStore } from '@/stores/uiStore';
import { mockEmployees } from '@/lib/mock-data';
import { Priority, TaskType } from '@/types/common';
import Avatar from '@/components/ui/Avatar';
import { Iphone17Pro } from '@/components/ui/Iphone17Pro';

const taskTypes: { value: TaskType; label: string; icon: string }[] = [
    { value: 'BREAKING_NEWS', label: 'Breaking News', icon: 'breaking_news' },
    { value: 'PRESS_CONF', label: 'Press Conference', icon: 'podium' },
    { value: 'INTERVIEW', label: 'Interview', icon: 'mic' },
    { value: 'PHOTO_ASSIGN', label: 'Photo Assignment', icon: 'photo_camera' },
    { value: 'VIDEO_ASSIGN', label: 'Video Assignment', icon: 'videocam' },
    { value: 'FACT_CHECK', label: 'Fact Check', icon: 'fact_check' },
    { value: 'FOLLOW_UP', label: 'Follow-Up', icon: 'replay' },
    { value: 'CUSTOM', label: 'Custom', icon: 'edit_note' },
];

const priorityOptions: { value: Priority; label: string; icon: string; color: string }[] = [
    { value: 'URGENT', label: 'Urgent', icon: 'priority_high', color: 'text-accent-red border-accent-red/30 bg-accent-red/5' },
    { value: 'HIGH', label: 'High', icon: 'arrow_upward', color: 'text-accent-orange border-accent-orange/30 bg-accent-orange/5' },
    { value: 'NORMAL', label: 'Medium', icon: 'remove', color: 'text-accent-green border-accent-green/30 bg-accent-green/5' },
    { value: 'LOW', label: 'Low', icon: 'arrow_downward', color: 'text-blue-500 border-blue-200 bg-blue-50' },
];

export default function CreateTaskModal() {
    const { createTaskModalOpen, setCreateTaskModalOpen } = useUIStore();
    const [title, setTitle] = useState('Coverage: City Council Vote');
    const [description, setDescription] = useState(
        'Please attend the emergency city council voting session regarding the new zoning laws. Get quotes from the mayor and the opposition leader.'
    );
    const [priority, setPriority] = useState<Priority>('HIGH');
    const [, setTaskType] = useState<TaskType>('BREAKING_NEWS');
    const [selectedEmployee, setSelectedEmployee] = useState<string>('emp-1');
    const [deadlineDate, setDeadlineDate] = useState('2026-02-17');
    const [deadlineTime, setDeadlineTime] = useState('14:30');
    const [searchReporter, setSearchReporter] = useState('');

    if (!createTaskModalOpen) return null;

    const activeEmployees = mockEmployees.filter((e) => e.status === 'ACTIVE');
    const filteredEmployees = searchReporter
        ? activeEmployees.filter((e) =>
            e.name.toLowerCase().includes(searchReporter.toLowerCase()) ||
            e.role.toLowerCase().includes(searchReporter.toLowerCase()) ||
            e.skills?.some((s) => s.toLowerCase().includes(searchReporter.toLowerCase()))
        )
        : activeEmployees;

    const selectedEmp = mockEmployees.find((e) => e.id === selectedEmployee);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setCreateTaskModalOpen(false)}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-[95vw] max-w-[1200px] h-[90vh] max-h-[750px] flex flex-col animate-fade-in overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[18px]">newspaper</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-text-primary text-sm">Al-Ayyam Task Manager</h2>
                            <span className="text-xs text-text-secondary">News Desk / Assignments</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs text-accent-green font-medium">
                            <span className="w-2 h-2 rounded-full bg-accent-green" />
                            WhatsApp API Connected
                        </div>
                        <button
                            onClick={() => setCreateTaskModalOpen(false)}
                            className="text-text-secondary hover:text-text-primary p-1 hover:bg-surface rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Modal Body - 3 Column Layout */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Left Column: Define Task */}
                    <div className="w-[320px] shrink-0 border-r border-border overflow-y-auto p-6 scrollbar-thin">
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="material-symbols-outlined text-[18px] text-text-secondary">edit_note</span>
                                <h3 className="font-bold text-text-primary text-base">Define Task</h3>
                            </div>
                            <p className="text-xs text-text-secondary">Create a new assignment for reporters.</p>
                        </div>

                        {/* Task Title */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Task Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                placeholder="Enter task title..."
                            />
                        </div>

                        {/* Task Type */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Task Type</label>
                            <select
                                onChange={(e) => setTaskType(e.target.value as TaskType)}
                                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white appearance-none cursor-pointer"
                            >
                                {taskTypes.map((t) => (
                                    <option key={t.value} value={t.value}>{t.label}</option>
                                ))}
                            </select>
                        </div>

                        {/* Priority Level */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Priority Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {priorityOptions.slice(0, 3).map((opt) => (
                                    <button
                                        key={opt.value}
                                        onClick={() => setPriority(opt.value)}
                                        className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg border-2 transition-all text-center ${priority === opt.value
                                            ? opt.color + ' border-current font-bold shadow-sm'
                                            : 'border-border text-text-secondary hover:border-gray-300'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-[18px]">{opt.icon}</span>
                                        <span className="text-[11px] font-medium">{opt.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Deadline */}
                        <div className="mb-5 grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Deadline Date</label>
                                <input
                                    type="date"
                                    value={deadlineDate}
                                    onChange={(e) => setDeadlineDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1.5">Time</label>
                                <input
                                    type="time"
                                    value={deadlineTime}
                                    onChange={(e) => setDeadlineTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="mb-5">
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Detailed Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white resize-none"
                                placeholder="Enter task details..."
                            />
                        </div>

                        {/* Location / Media */}
                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1.5">Location / Media</label>
                            <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 hover:border-primary/30 transition-colors cursor-pointer">
                                <span className="material-symbols-outlined text-[24px] text-text-secondary">cloud_upload</span>
                                <p className="text-xs text-text-secondary text-center">Click to pin location or upload files</p>
                            </div>
                        </div>
                    </div>

                    {/* Middle Column: Assign Reporter */}
                    <div className="flex-1 min-w-[280px] border-r border-border overflow-y-auto p-6 scrollbar-thin">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[18px] text-text-secondary">group</span>
                                <h3 className="font-bold text-text-primary text-base">Assign Reporter</h3>
                            </div>
                            <span className="text-xs bg-accent-green/10 text-accent-green px-2 py-0.5 rounded-full font-bold">
                                {activeEmployees.filter((e) => e.availability === 'AVAILABLE').length} Active
                            </span>
                        </div>

                        {/* Search */}
                        <div className="relative mb-4">
                            <span className="material-symbols-outlined text-[18px] text-text-secondary absolute left-3 top-1/2 -translate-y-1/2">
                                search
                            </span>
                            <input
                                type="text"
                                value={searchReporter}
                                onChange={(e) => setSearchReporter(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white"
                                placeholder="Search reporters..."
                            />
                        </div>

                        {/* Employee List */}
                        <div className="flex flex-col gap-2">
                            {filteredEmployees.map((emp) => {
                                const isSelected = selectedEmployee === emp.id;
                                const isOffline = emp.availability === 'OFF_DUTY';
                                return (
                                    <button
                                        key={emp.id}
                                        onClick={() => setSelectedEmployee(emp.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left ${isSelected
                                            ? 'border-primary bg-primary-light shadow-sm'
                                            : 'border-border hover:border-gray-300 bg-white'
                                            } ${isOffline ? 'opacity-50 grayscale' : ''}`}
                                    >
                                        <div className="relative">
                                            <Avatar
                                                src={emp.avatar_url}
                                                alt={emp.name}
                                                size="md"
                                                status={emp.availability === 'AVAILABLE' ? 'online' : emp.availability === 'BUSY' ? 'busy' : 'offline'}
                                            />
                                            {isSelected && (
                                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-text-primary">{emp.name}</span>
                                                {emp.performance_score && (
                                                    <span className="text-xs text-accent-green font-bold">✓ {emp.performance_score}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-text-secondary">{emp.role} • {emp.department}</p>
                                            {emp.skills && (
                                                <div className="flex gap-1 mt-1.5 flex-wrap">
                                                    {emp.skills.slice(0, 3).map((skill) => (
                                                        <span
                                                            key={skill}
                                                            className="text-[10px] px-1.5 py-0.5 bg-primary-light text-primary rounded font-medium capitalize"
                                                        >
                                                            {skill.replace('_', ' ')}
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column: WhatsApp Message Preview */}
                    <div className="w-[340px] shrink-0 overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-gray-100/50 scrollbar-thin flex flex-col items-center">
                        <div className="mb-4 flex items-center gap-2 self-start">
                            <span className="material-symbols-outlined text-[18px] text-whatsapp-dark">chat</span>
                            <h3 className="font-bold text-text-primary text-base">Message Preview</h3>
                        </div>
                        <p className="text-xs text-text-secondary mb-4 self-start">
                            Review the automated message before sending.
                        </p>

                        {/* iPhone Frame with WhatsApp Preview inside */}
                        <Iphone17Pro width={280} height={570} className="drop-shadow-2xl shrink-0">
                            <div className="w-full h-full flex flex-col bg-[#e5ddd5]">
                                {/* WhatsApp Header */}
                                <div className="bg-whatsapp-dark px-3 py-2 flex items-center gap-2 shrink-0">
                                    <span className="material-symbols-outlined text-white/70 text-[18px]">arrow_back</span>
                                    {selectedEmp && (
                                        <>
                                            <Avatar
                                                src={selectedEmp.avatar_url}
                                                alt={selectedEmp.name}
                                                size="sm"
                                                status="online"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white text-xs font-bold truncate">{selectedEmp.name}</p>
                                                <p className="text-white/60 text-[10px]">online</p>
                                            </div>
                                        </>
                                    )}
                                    <span className="material-symbols-outlined text-white/70 text-[18px]">videocam</span>
                                    <span className="material-symbols-outlined text-white/70 text-[18px]">call</span>
                                    <span className="material-symbols-outlined text-white/70 text-[18px]">more_vert</span>
                                </div>

                                {/* Chat Content */}
                                <div className="flex-1 p-3 chat-bg overflow-y-auto scrollbar-thin">
                                    <div className="flex justify-center mb-3">
                                        <span className="bg-white/80 text-text-secondary text-[9px] font-bold px-2 py-0.5 rounded shadow-sm">
                                            TODAY
                                        </span>
                                    </div>

                                    {/* Incoming greeting */}
                                    <div className="flex flex-col gap-1 items-start max-w-[90%] mb-2">
                                        <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm text-xs">
                                            <p className="text-text-primary leading-relaxed">
                                                Good morning {selectedEmp?.name.split(' ')[0]}, are you available for a quick assignment?
                                            </p>
                                            <span className="text-[9px] text-gray-400 block text-right mt-0.5">10:00 AM</span>
                                        </div>
                                    </div>

                                    {/* Reply */}
                                    <div className="flex flex-col items-end max-w-[90%] ml-auto mb-3">
                                        <div className="bg-[#dcf8c6] p-2 rounded-lg rounded-tr-none shadow-sm text-xs">
                                            <p className="text-text-primary">Yes, I am free until 5 PM.</p>
                                            <div className="flex items-center justify-end gap-0.5 mt-0.5">
                                                <span className="text-[9px] text-gray-500">10:08 AM</span>
                                                <span className="material-symbols-outlined text-[10px] text-blue-500">done_all</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Map placeholder */}
                                    <div className="flex flex-col items-start max-w-[90%] mb-2">
                                        <div className="bg-white p-1 rounded-lg rounded-tl-none shadow-sm overflow-hidden">
                                            <div className="bg-accent-green/10 h-20 rounded flex items-center justify-center mb-1">
                                                <span className="material-symbols-outlined text-accent-green text-[32px]">location_on</span>
                                            </div>
                                            <div className="px-1.5 pb-1">
                                                <p className="text-[10px] text-text-secondary">City Council Hall</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Assignment message */}
                                    <div className="flex flex-col items-start max-w-[90%]">
                                        <div className="bg-white p-2 rounded-lg rounded-tl-none shadow-sm text-xs">
                                            <p className="font-bold text-accent-red text-[10px] mb-1">🚨 New Assignment: {title || 'Untitled Task'}</p>
                                            <p className="text-text-primary leading-relaxed mb-2 text-[11px]">
                                                {description || 'No description provided.'}
                                            </p>
                                            <div className="flex flex-col gap-0.5 text-[10px] text-text-secondary">
                                                <span>⏰ Deadline: Today, {deadlineTime || '14:30'}</span>
                                                <span>⚡ Priority: {priority}</span>
                                            </div>
                                            <span className="text-[9px] text-gray-400 block text-right mt-1">10:42 AM ✓</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Chat Input Mock */}
                                <div className="bg-[#f0f0f0] p-2 flex items-center gap-2 shrink-0">
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">add</span>
                                    <div className="flex-1 bg-white rounded-full px-3 py-1 text-[10px] text-gray-400">
                                        Type a message
                                    </div>
                                    <span className="material-symbols-outlined text-gray-500 text-[18px]">mic</span>
                                </div>
                            </div>
                        </Iphone17Pro>

                        {/* Footer */}
                        <div className="mt-4 text-center w-full">
                            <p className="text-[10px] text-text-secondary mb-3">
                                Will be sent via WhatsApp Business API ∙ 🔒 End-to-end encrypted
                            </p>
                            <button
                                onClick={() => setCreateTaskModalOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-whatsapp hover:bg-whatsapp/90 text-white font-bold text-sm transition-all active:scale-[0.98] shadow-md shadow-whatsapp/20"
                            >
                                <span className="material-symbols-outlined text-[18px]">send</span>
                                Send Assignment to {selectedEmp?.name.split(' ')[0] || 'Reporter'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
