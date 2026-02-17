'use client';

import React, { useState } from 'react';

interface DeliverablesEditorProps {
    value: Record<string, number>;
    onChange: (deliverables: Record<string, number>) => void;
}

const commonDeliverables = [
    'Photos',
    'Videos',
    'Article',
    'Audio',
    'Social Post',
    'Report'
];

export default function DeliverablesEditor({ value, onChange }: DeliverablesEditorProps) {
    const [customType, setCustomType] = useState('');

    const handleUpdate = (type: string, count: number) => {
        const newDeliverables = { ...value };
        if (count > 0) {
            newDeliverables[type.toLowerCase().replace(/\s+/g, '_')] = count;
        } else {
            delete newDeliverables[type.toLowerCase().replace(/\s+/g, '_')];
        }
        onChange(newDeliverables);
    };

    const handleAddCustom = () => {
        if (customType.trim()) {
            handleUpdate(customType, 1);
            setCustomType('');
        }
    };

    return (
        <div className="space-y-3">
            <h4 className="text-xs font-semibold text-text-secondary">Required Deliverables</h4>

            <div className="grid grid-cols-2 gap-2">
                {commonDeliverables.map(type => {
                    const key = type.toLowerCase().replace(/\s+/g, '_');
                    const count = value[key] || 0;

                    return (
                        <div key={type} className={`
                            flex items-center justify-between p-2 rounded-lg border transition-all select-none
                            ${count > 0 ? 'border-primary bg-primary/5' : 'border-border bg-background hover:border-text-secondary/30'}
                        `}>
                            <span className="text-sm font-medium text-text-primary">{type}</span>

                            <div className="flex items-center gap-2">
                                {count > 0 && (
                                    <button
                                        onClick={() => handleUpdate(type, count - 1)}
                                        className="w-5 h-5 flex items-center justify-center rounded-full bg-background border border-border text-text-secondary hover:text-primary hover:border-primary text-xs transition-colors"
                                    >
                                        -
                                    </button>
                                )}

                                <span className={`text-sm font-bold w-4 text-center ${count > 0 ? 'text-primary' : 'text-text-secondary/50'}`}>
                                    {count}
                                </span>

                                <button
                                    onClick={() => handleUpdate(type, count + 1)}
                                    className="w-5 h-5 flex items-center justify-center rounded-full bg-background border border-border text-text-secondary hover:text-primary hover:border-primary text-xs transition-colors"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Custom Deliverable */}
            <div className="flex gap-2 pt-2 border-t border-border border-dashed">
                <input
                    type="text"
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Add custom item..."
                    className="flex-1 px-3 py-1.5 text-sm bg-background text-text-primary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-text-secondary"
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCustom()}
                />
                <button
                    onClick={handleAddCustom}
                    disabled={!customType.trim()}
                    className="px-3 py-1.5 bg-surface text-text-primary rounded-lg text-sm font-medium hover:bg-surface/80 disabled:opacity-50 transition-colors"
                >
                    Add
                </button>
            </div>

            {/* Display custom items if any */}
            {Object.keys(value).filter(k => !commonDeliverables.some(c => c.toLowerCase().replace(/\s+/g, '_') === k)).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {Object.keys(value)
                        .filter(k => !commonDeliverables.some(c => c.toLowerCase().replace(/\s+/g, '_') === k))
                        .map(key => (
                            <div key={key} className="flex items-center gap-2 px-2 py-1 bg-primary/5 border border-primary/20 rounded-md">
                                <span className="text-xs font-medium capitalize text-primary">{key.replace(/_/g, ' ')}: {value[key]}</span>
                                <button
                                    onClick={() => handleUpdate(key, 0)}
                                    className="text-primary/50 hover:text-primary"
                                >
                                    <span className="material-symbols-outlined text-[14px]">close</span>
                                </button>
                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    );
}
