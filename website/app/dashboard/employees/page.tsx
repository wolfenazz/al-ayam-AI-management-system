'use client';

import { useRef, useEffect, useState } from 'react';
import { useEmployees, useEmployeeStats, useAddEmployees, useUpdateEmployee, useDeleteEmployee } from '@/hooks/useEmployees';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import FileUploader from '@/components/shared/FileUploader';
import { Employee } from '@/types/employee';
import { toast } from 'react-hot-toast';

export default function EmployeesPage() {
    const { employees, isLoading } = useEmployees();
    const addEmployees = useAddEmployees();
    const deleteEmployee = useDeleteEmployee();
    const stats = useEmployeeStats(employees);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showImportModal, setShowImportModal] = useState(false);
    const [selectedExternalIds, setSelectedExternalIds] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const externalEmployees = employees.filter(e => e.is_external);
    const isAllExternalSelected = externalEmployees.length > 0 && externalEmployees.every(e => selectedExternalIds.has(e.id));

    const toggleSelectAll = () => {
        if (isAllExternalSelected) {
            setSelectedExternalIds(new Set());
        } else {
            setSelectedExternalIds(new Set(externalEmployees.map(e => e.id)));
        }
    };

    const toggleSelectOne = (id: string) => {
        const newSet = new Set(selectedExternalIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedExternalIds(newSet);
    };

    const handleImport = async (data: any[]) => {
        try {
            const newEmployees: Omit<Employee, 'id'>[] = data.map((row) => ({
                name: row['Name'] || row['name'] || 'Unknown',
                phone_number: row['Phone Number'] || row['phone'] || '',
                role: (row['Role'] || row['role'] || 'REPORTER').toUpperCase().replace(' ', '_') as any,
                department: row['Department'] || row['department'] || 'News',
                email: row['Email'] || row['email'] || `temp_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`,
                status: 'ACTIVE',
                availability: 'AVAILABLE',
                created_at: new Date().toISOString(),
                is_external: true,
                source: 'csv',
                avatar_url: '',
            }));

            await addEmployees.mutateAsync(newEmployees);
            toast.success(`Successfully imported ${newEmployees.length} employees`);
            setShowImportModal(false);
        } catch (error) {
            console.error('Import failed:', error);
            toast.error('Failed to import employees');
        }
    };

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {/* Page Header */}
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-text-primary tracking-tight">
                            Team Management
                        </h1>
                        <p className="text-text-secondary text-base mt-2">
                            Manage your newsroom staff and view their current status.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowImportModal(true)}
                            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[20px]">upload_file</span>
                            Import
                        </button>
                        <div className="flex items-center gap-2 bg-card p-1 rounded-lg border border-border shadow-sm">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'text-primary bg-primary-light' : 'hover:bg-surface text-text-secondary'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'text-primary bg-primary-light' : 'hover:bg-surface text-text-secondary'}`}
                            >
                                <span className="material-symbols-outlined text-[20px]">view_list</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                {/* ... existing stats ... */}

                {/* Import Modal */}
                {showImportModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        {/* Overlay */}
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowImportModal(false)}
                        />

                        {/* Modal */}
                        <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-fade-in">
                            {/* Modal Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="size-10 bg-primary rounded-lg flex items-center justify-center text-white">
                                        <span className="material-symbols-outlined text-[20px]">upload_file</span>
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-text-primary text-lg">Import Employees</h2>
                                        <p className="text-xs text-text-secondary">Upload CSV or Excel file</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowImportModal(false)}
                                    className="text-text-secondary hover:text-text-primary p-1 hover:bg-surface rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            {/* FileUploader */}
                            <FileUploader
                                onUpload={handleImport}
                                isLoading={addEmployees.isPending}
                            />

                            {/* Instructions */}
                            <div className="mt-6 bg-surface rounded-lg p-4">
                                <h3 className="font-semibold text-text-primary text-sm mb-2 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-[18px]">info</span>
                                    File Format Requirements
                                </h3>
                                <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                                    <li>CSV or Excel file (.xlsx, .xls)</li>
                                    <li>Required column: <span className="font-semibold text-text-primary">Name</span></li>
                                    <li>Optional columns: Phone, Role, Department, Email</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Bulk Delete Confirmation Modal */}
                {showDeleteConfirm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                            onClick={() => setShowDeleteConfirm(false)}
                        />
                        <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="size-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-red-600 text-[24px]">warning</span>
                                </div>
                                <div>
                                    <h2 className="font-bold text-text-primary text-lg">Delete Selected Contacts</h2>
                                    <p className="text-sm text-text-secondary">This action cannot be undone</p>
                                </div>
                            </div>
                            <p className="text-text-secondary mb-6">
                                Are you sure you want to delete <span className="font-semibold text-text-primary">{selectedExternalIds.size}</span> selected contact{selectedExternalIds.size > 1 ? 's' : ''}? 
                                These are unregistered contacts that were imported from files.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-surface rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={async () => {
                                        const ids = Array.from(selectedExternalIds);
                                        try {
                                            await Promise.all(ids.map(id => deleteEmployee.mutateAsync(id)));
                                            toast.success(`Deleted ${ids.length} contact${ids.length > 1 ? 's' : ''}`);
                                            setSelectedExternalIds(new Set());
                                            setShowDeleteConfirm(false);
                                        } catch (error) {
                                            console.error('Bulk delete failed:', error);
                                            toast.error('Failed to delete some contacts');
                                        }
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                    Delete {selectedExternalIds.size} Contact{selectedExternalIds.size > 1 ? 's' : ''}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Selection Action Bar */}
                {selectedExternalIds.size > 0 && (
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border rounded-xl shadow-2xl px-6 py-4 flex items-center gap-4 animate-fade-in">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">checklist</span>
                            <span className="font-semibold text-text-primary">{selectedExternalIds.size} selected</span>
                        </div>
                        <div className="w-px h-6 bg-border" />
                        <button
                            onClick={() => setSelectedExternalIds(new Set())}
                            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
                        >
                            Clear selection
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                            Delete Selected
                        </button>
                    </div>
                )}

                {/* Employees Content */}
                {isLoading ? (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8' : 'flex flex-col gap-3'}>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="bg-card rounded-2xl border border-border p-8 shadow-sm animate-pulse h-72">
                                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-5" />
                                <div className="h-6 w-3/4 bg-gray-200 rounded mb-3 mx-auto" />
                                <div className="h-4 w-1/2 bg-gray-100 rounded mx-auto" />
                            </div>
                        ))}
                    </div>
                ) : employees.length === 0 ? (
                    <div className="bg-card rounded-2xl border border-border p-16 text-center shadow-sm">
                        <span className="material-symbols-outlined text-[72px] text-gray-300 mb-4 block">group_off</span>
                        <p className="text-xl font-semibold text-text-primary mb-2">No employees found</p>
                        <p className="text-base text-text-secondary">Add employees to your team to see them here.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-12">
                        {/* Registered Employees */}
                        {employees.filter(e => !e.is_external).length > 0 && (
                            <div>
                                <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-primary text-[24px]">verified_user</span>
                                    Registered Members
                                    <span className="text-sm font-normal text-text-secondary bg-surface px-3 py-1 rounded-full">
                                        {employees.filter(e => !e.is_external).length}
                                    </span>
                                </h2>
                                <div
                                    className={
                                        viewMode === 'grid'
                                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                                            : 'flex flex-col gap-3'
                                    }
                                >
                                    {employees.filter(e => !e.is_external).map((employee) => (
                                        viewMode === 'grid' ? (
                                            <EmployeeCard key={employee.id} employee={employee} />
                                        ) : (
                                            <EmployeeRow key={employee.id} employee={employee} />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* External Employees */}
                        {employees.filter(e => e.is_external).length > 0 && (
                            <div>
                                <div className="flex items-center justify-between mb-6 pt-8 border-t border-gray-200">
                                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-3">
                                        <span className="material-symbols-outlined text-orange-100 text-[24px]">person_add_disabled</span>
                                        Unregistered (Contact Only)
                                        <span className="text-sm font-normal text-text-secondary bg-surface px-3 py-1 rounded-full">
                                            {employees.filter(e => e.is_external).length}
                                        </span>
                                    </h2>
                                    <button
                                        onClick={toggleSelectAll}
                                        className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors"
                                    >
                                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isAllExternalSelected ? 'bg-primary border-primary' : 'border-gray-300 hover:border-primary'}`}>
                                            {isAllExternalSelected && (
                                                <span className="material-symbols-outlined text-white text-[14px]">check</span>
                                            )}
                                        </div>
                                        Select All
                                    </button>
                                </div>
                                <div
                                    className={
                                        viewMode === 'grid'
                                            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8'
                                            : 'flex flex-col gap-3'
                                    }
                                >
                                    {employees.filter(e => e.is_external).map((employee) => (
                                        viewMode === 'grid' ? (
                                            <EmployeeCard 
                                                key={employee.id} 
                                                employee={employee} 
                                                isExternal 
                                                isSelected={selectedExternalIds.has(employee.id)}
                                                onSelect={(id) => toggleSelectOne(id)}
                                            />
                                        ) : (
                                            <EmployeeRow 
                                                key={employee.id} 
                                                employee={employee} 
                                                isExternal 
                                                isSelected={selectedExternalIds.has(employee.id)}
                                                onSelect={(id) => toggleSelectOne(id)}
                                            />
                                        )
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function StatCard({
    icon,
    label,
    value,
    color,
}: {
    icon: string;
    label: string;
    value: string;
    color: 'primary' | 'green' | 'red' | 'gray';
}) {
    const colorMap = {
        primary: { bg: 'bg-primary/10', text: 'text-primary', icon: 'text-primary' },
        green: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: 'text-emerald-600' },
        red: { bg: 'bg-red-50', text: 'text-red-700', icon: 'text-red-600' },
        gray: { bg: 'bg-gray-100', text: 'text-gray-700', icon: 'text-gray-500' },
    };
    const c = colorMap[color];

    return (
        <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow">
            <div className={`size-11 rounded-xl ${c.bg} flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[24px] ${c.icon}`}>{icon}</span>
            </div>
            <div>
                <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
                <p className="text-sm text-text-secondary font-medium">{label}</p>
            </div>
        </div>
    );
}

function EmployeeActionMenu({ employee, isExternal, onDelete }: { employee: Employee; isExternal?: boolean; onDelete?: () => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const deleteEmployee = useDeleteEmployee();
    const updateEmployee = useUpdateEmployee();

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        } else {
            if (window.confirm(`Are you sure you want to remove ${employee.name}?`)) {
                deleteEmployee.mutate(employee.id);
                toast.success('Member removed');
            }
        }
        setIsOpen(false);
    };

    const handleToggleStatus = () => {
        const newStatus = employee.availability === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
        updateEmployee.mutate({ id: employee.id, data: { availability: newStatus } });
        toast.success(`Marked as ${newStatus}`);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className={`p-1 rounded-lg transition-colors ${isOpen ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'}`}
            >
                <span className="material-symbols-outlined text-[20px]">more_vert</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-card rounded-lg shadow-xl border border-border z-50 animate-fade-in overflow-hidden">
                    {!isExternal && (
                        <>
                            <button
                                onClick={() => { toast('Profile view coming soon'); setIsOpen(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px] text-gray-400">person</span>
                                View Profile
                            </button>
                            <button
                                onClick={handleToggleStatus}
                                className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface flex items-center gap-2"
                            >
                                <span className="material-symbols-outlined text-[18px] text-gray-400">
                                    {employee.availability === 'AVAILABLE' ? 'do_not_disturb_on' : 'check_circle'}
                                </span>
                                {employee.availability === 'AVAILABLE' ? 'Mark as Busy' : 'Mark as Available'}
                            </button>
                            <div className="h-px bg-gray-100 my-1" />
                        </>
                    )}
                    {isExternal && (
                        <div className="px-4 py-2 text-xs text-text-secondary bg-white-50 border-b border-white-100">
                            Unregistered Contact
                        </div>
                    )}
                    <button
                        onClick={handleDelete}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50/50 flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                        {isExternal ? 'Remove Contact' : 'Remove Member'}
                    </button>
                </div>
            )}
        </div>
    );
}

function EmployeeCard({
    employee,
    isExternal,
    isSelected,
    onSelect
}: {
    employee: any;
    isExternal?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}) {
    const statusColor =
        employee.availability === 'AVAILABLE' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
            employee.availability === 'BUSY' ? 'text-red-600 bg-red-50 border-red-100' :
                'text-gray-500 bg-gray-50 border-gray-100';

    return (
        <div
            className={`bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col items-center text-center group relative ${
                isExternal
                    ? `border-orange-200 ${isSelected ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}`
                    : 'border-border'
            } ${isExternal && isSelected ? 'bg-primary/5' : ''}`}
        >
            {isExternal && (
                <div className="absolute top-3 left-3 flex items-center gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(employee.id);
                        }}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                                ? 'bg-primary border-primary'
                                : 'border-gray-300 bg-white hover:border-primary'
                        }`}
                    >
                        {isSelected && (
                            <span className="material-symbols-outlined text-white text-[16px]">check</span>
                        )}
                    </button>
                </div>
            )}

            {isExternal && (
                <div className="absolute top-3 right-3">
                    <span className="material-symbols-outlined text-orange-400 text-[20px]" title="Unregistered / External Staff">person_add_disabled</span>
                </div>
            )}

            {!isExternal && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EmployeeActionMenu employee={employee} />
                </div>
            )}

            {isExternal && (
                <div className="absolute top-3 right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    <EmployeeActionMenu employee={employee} isExternal />
                </div>
            )}

            <div className={`mb-5 relative inline-block ${!isExternal ? 'mt-3' : 'mt-6'}`}>
                <Avatar
                    src={employee.avatar_url}
                    alt={employee.name}
                    size="xl"
                />
                {!isExternal && (
                    <div className={`absolute bottom-0 right-0 w-6 h-6 rounded-full border-4 border-card ${employee.availability === 'AVAILABLE' ? 'bg-emerald-500' :
                        employee.availability === 'BUSY' ? 'bg-red-500' : 'bg-gray-400'
                        }`}></div>
                )}
            </div>

            <h3 className="font-bold text-text-primary text-xl mb-2">{employee.name}</h3>

            {isExternal && employee.phone_number && (
                <p className="text-xs text-text-secondary mb-2 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">call</span>
                    {employee.phone_number}
                </p>
            )}

            <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded mb-3 tracking-wide uppercase">
                {employee.role?.replace('_', ' ')}
            </span>

            {isExternal ? (
                <div className="text-xs px-2.5 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700 font-medium mb-4">
                    External Contact
                </div>
            ) : (
                <div className={`text-xs px-2.5 py-1 rounded-full border font-medium mb-4 ${statusColor}`}>
                    {employee.availability?.replace('_', ' ')}
                </div>
            )}

            <div className="w-full border-t border-gray-100 pt-5 mt-auto flex justify-between px-4 text-text-secondary text-sm">
                <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary text-base">{employee.performance_score || 'N/A'}</span>
                    <span className="text-[11px] uppercase tracking-wide">Score</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary text-base">{employee.completed_tasks || 0}</span>
                    <span className="text-[11px] uppercase tracking-wide">Tasks</span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="font-bold text-text-primary text-base">{employee.monthly_score || 'N/A'}</span>
                    <span className="text-[11px] uppercase tracking-wide">Month</span>
                </div>
            </div>
        </div>
    );
}

function EmployeeRow({
    employee,
    isExternal,
    isSelected,
    onSelect
}: {
    employee: any;
    isExternal?: boolean;
    isSelected?: boolean;
    onSelect?: (id: string) => void;
}) {
    return (
        <div
            className={`bg-card rounded-2xl border shadow-sm hover:shadow-md transition-all flex items-center gap-5 group ${
                isExternal
                    ? `border-orange-200 ${isSelected ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}`
                    : 'border-border'
            } ${isExternal ? 'opacity-90' : ''}`}
        >
            {isExternal && (
                <div className="pl-4">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onSelect?.(employee.id);
                        }}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            isSelected
                                ? 'bg-primary border-primary'
                                : 'border-gray-300 bg-white hover:border-primary'
                        }`}
                    >
                        {isSelected && (
                            <span className="material-symbols-outlined text-white text-[16px]">check</span>
                        )}
                    </button>
                </div>
            )}

            <Avatar
                src={employee.avatar_url}
                alt={employee.name}
                size="md"
                status={
                    !isExternal ? (
                        employee.availability === 'AVAILABLE' ? 'online' :
                            employee.availability === 'BUSY' ? 'busy' : 'offline'
                    ) : undefined
                }
            />

            <div className="flex-1 min-w-0 grid grid-cols-12 gap-5 items-center">
                <div className="col-span-4">
                    <h3 className="font-bold text-text-primary truncate flex items-center gap-2 text-base">
                        {employee.name}
                        {isExternal && <span className="material-symbols-outlined text-orange-400 text-[18px]" title="Unregistered">person_add_disabled</span>}
                    </h3>
                    <p className="text-sm text-text-secondary truncate">{employee.email}</p>
                    {isExternal && employee.phone_number && (
                        <p className="text-xs text-text-secondary flex items-center gap-1.5 mt-1">
                            <span className="material-symbols-outlined text-[14px]">call</span> {employee.phone_number}
                        </p>
                    )}
                </div>

                <div className="col-span-3">
                    <span className="text-xs font-semibold text-primary bg-primary/5 px-2 py-1 rounded tracking-wide uppercase">
                        {employee.role?.replace('_', ' ')}
                    </span>
                </div>

                <div className="col-span-3">
                    {isExternal ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium text-orange-700 bg-orange-50 border border-orange-100">
                            External
                        </div>
                    ) : (
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${employee.availability === 'AVAILABLE' ? 'text-emerald-700 bg-emerald-50' :
                            employee.availability === 'BUSY' ? 'text-red-700 bg-red-50' : 'text-gray-600 bg-gray-100'
                            }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${employee.availability === 'AVAILABLE' ? 'bg-emerald-500' :
                                employee.availability === 'BUSY' ? 'bg-red-500' : 'bg-gray-500'
                                }`}></div>
                            {employee.availability?.replace('_', ' ')}
                        </div>
                    )}
                </div>

                <div className="col-span-2 text-right text-sm font-bold text-text-primary">
                    {employee.performance_score || 'N/A'} <span className="text-[10px] text-text-secondary font-normal uppercase ml-1">Score</span>
                </div>
            </div>

            {!isExternal && (
                <div className="opacity-0 group-hover:opacity-100 transition-all pr-4">
                    <EmployeeActionMenu employee={employee} />
                </div>
            )}

            {isExternal && (
                <div className="opacity-0 group-hover:opacity-100 transition-all pr-4">
                    <EmployeeActionMenu employee={employee} isExternal />
                </div>
            )}
        </div>
    )
}
