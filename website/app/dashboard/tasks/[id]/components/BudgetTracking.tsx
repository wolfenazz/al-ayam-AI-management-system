'use client';

import React, { useState } from 'react';
import { useUpdateTask } from '@/hooks/useTasks';
import { Task } from '@/types/task';

interface Expense {
    id: string;
    description: string;
    amount: number;
    date: string;
}

interface BudgetTrackingProps {
    task: Task;
}

export default function BudgetTracking({ task }: BudgetTrackingProps) {
    const updateTask = useUpdateTask();
    const [isAddingExpense, setIsAddingExpense] = useState(false);
    const [expenseDescription, setExpenseDescription] = useState('');
    const [expenseAmount, setExpenseAmount] = useState('');

    const expenses: Expense[] = (task as any).expenses || [];

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remainingBudget = (task.budget || 0) - totalExpenses;
    const budgetUsage = task.budget && task.budget > 0 ? (totalExpenses / task.budget) * 100 : 0;

    const handleAddExpense = (e: React.FormEvent) => {
        e.preventDefault();

        if (!expenseDescription.trim() || !expenseAmount) return;

        const newExpense: Expense = {
            id: Date.now().toString(),
            description: expenseDescription.trim(),
            amount: parseFloat(expenseAmount),
            date: new Date().toISOString(),
        };

        const newExpenses = [...expenses, newExpense];

        updateTask.mutate({
            id: task.id,
            updates: { expenses: newExpenses }
        });

        setExpenseDescription('');
        setExpenseAmount('');
        setIsAddingExpense(false);
    };

    const handleRemoveExpense = (expenseId: string) => {
        const newExpenses = expenses.filter((exp) => exp.id !== expenseId);

        updateTask.mutate({
            id: task.id,
            updates: { expenses: newExpenses }
        });
    };

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Budget & Expenses</h3>
            </div>

            {task.budget && task.budget > 0 && (
                <div className="mb-6 space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Budget</span>
                        <span className="font-medium text-gray-900">${task.budget.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Spent</span>
                        <span className="font-medium text-gray-900">${totalExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Remaining</span>
                        <span className={`font-medium ${remainingBudget < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                            ${remainingBudget.toLocaleString()}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className={`h-2 rounded-full transition-all duration-300 ${budgetUsage > 90 ? 'bg-red-500' : budgetUsage > 70 ? 'bg-accent-orange' : 'bg-primary'}`}
                            style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 text-right">{Math.round(budgetUsage)}% used</p>
                </div>
            )}

            <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Expenses ({expenses.length})</h4>
                <button
                    onClick={() => setIsAddingExpense(!isAddingExpense)}
                    className="text-sm text-primary hover:text-primary-dark font-medium"
                >
                    {isAddingExpense ? 'Cancel' : 'Add Expense'}
                </button>
            </div>

            {isAddingExpense && (
                <form onSubmit={handleAddExpense} className="mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <input
                                type="text"
                                value={expenseDescription}
                                onChange={(e) => setExpenseDescription(e.target.value)}
                                placeholder="Expense description"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm"
                                autoFocus
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={expenseAmount}
                                onChange={(e) => setExpenseAmount(e.target.value)}
                                placeholder="0.00"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 text-sm"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!expenseDescription.trim() || !expenseAmount}
                                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Add Expense
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsAddingExpense(false);
                                    setExpenseDescription('');
                                    setExpenseAmount('');
                                }}
                                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            )}

            {expenses.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 rounded-md border border-dashed border-gray-300">
                    <span className="material-symbols-outlined text-3xl text-gray-300 mb-2">payments</span>
                    <p className="text-sm text-gray-500">No expenses recorded yet</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {expenses.map((expense) => (
                        <div
                            key={expense.id}
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{expense.description}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(expense.date).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium text-gray-900">
                                    ${expense.amount.toLocaleString()}
                                </span>
                                <button
                                    onClick={() => handleRemoveExpense(expense.id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                >
                                    <span className="material-symbols-outlined text-lg">delete</span>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
