'use client';

import React from 'react';
import { Task } from '@/types/task';
import Badge from '@/components/ui/Badge';

interface TaskTimelineProps {
    task: Task;
}

interface TimelineEvent {
    id: string;
    content: string;
    target?: string;
    href?: string;
    date: string;
    datetime: string;
    icon: any;
    iconBackground: string;
}

function classNames(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}

export default function TaskTimeline({ task }: TaskTimelineProps) {
    const events = [
        {
            id: '1',
            content: 'Task created',
            target: task.creator_id,
            date: new Date(task.created_at).toLocaleDateString(),
            datetime: task.created_at,
            icon: (props: any) => <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" /></svg>,
            iconBackground: 'bg-gray-50',
        },
        task.sent_at ? {
            id: '2',
            content: 'Sent to WhatsApp',
            target: 'WhatsApp API',
            date: new Date(task.sent_at).toLocaleDateString(),
            datetime: task.sent_at,
            icon: (props: any) => <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}><path d="M3.105 2.289a.75.75 0 00-.826.95l1.414 4.925A1.5 1.5 0 004.82 9.25h3.144a.75.75 0 010 1.5H4.82a1.5 1.5 0 00-1.127 1.086l-1.414 4.925a.75.75 0 00.826.95 28.682 28.682 0 0021.178-7.49.75.75 0 000-1.026A28.68 28.68 0 003.105 2.289z" /></svg>,
            iconBackground: 'bg-green-500',
        } : null,
        task.read_at ? {
            id: '3',
            content: 'Read by assignee',
            target: task.assignee_id,
            date: new Date(task.read_at).toLocaleDateString(),
            datetime: task.read_at,
            icon: (props: any) => <svg className="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>,
            iconBackground: 'bg-blue-50',
        } : null,
        task.accepted_at ? {
            id: '4',
            content: 'Accepted',
            target: task.assignee_id,
            date: new Date(task.accepted_at).toLocaleDateString(),
            datetime: task.accepted_at,
            icon: (props: any) => <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>,
            iconBackground: 'bg-green-500',
        } : null,
        task.completed_at ? {
            id: '5',
            content: 'Completed',
            target: task.assignee_id,
            date: new Date(task.completed_at).toLocaleDateString(),
            datetime: task.completed_at,
            icon: (props: any) => <svg className="h-5 w-5 text-white" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>,
            iconBackground: 'bg-primary',
        } : null,
    ].filter(Boolean);

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {events.map((event: any, eventIdx) => (
                    <li key={event.id}>
                        <div className="relative pb-8">
                            {eventIdx !== events.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span
                                        className={classNames(
                                            event.iconBackground,
                                            'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white'
                                        )}
                                    >
                                        <event.icon className="h-5 w-5" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {event.content}{' '}
                                            <a href={event.href} className="font-medium text-gray-900">
                                                {event.target}
                                            </a>
                                        </p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-gray-500">
                                        <time dateTime={event.datetime}>{event.date}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
