
import React from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Event } from '../types';
import { Button } from './UI';

interface SharedCalendarProps {
  events: Event[];
  onDateClick?: (date: Date) => void;
  renderEventAction?: (event: Event) => React.ReactNode;
  readOnly?: boolean;
}

export const SharedCalendar: React.FC<SharedCalendarProps> = ({ 
  events, 
  onDateClick, 
  renderEventAction,
  readOnly = false 
}) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const daysInMonth = eachDayOfInterval({
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const jumpToday = () => setCurrentDate(new Date());

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={prevMonth}><ChevronLeft className="w-4 h-4" /></Button>
                <Button variant="outline" size="sm" onClick={jumpToday} className="text-xs">Today</Button>
                <Button variant="ghost" size="sm" onClick={nextMonth}><ChevronRight className="w-4 h-4" /></Button>
            </div>
        </div>
        
        <div className="grid grid-cols-7 text-center py-2 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => <div key={d}>{d}</div>)}
        </div>
        
        <div className="grid grid-cols-7 auto-rows-fr bg-gray-100 gap-px border-b border-gray-200">
            {daysInMonth.map((day) => {
                const dayEvents = events.filter(e => isSameDay(new Date(e.eventDate), day));
                const isCurrentDay = isToday(day);
                
                return (
                    <div 
                        key={day.toISOString()} 
                        className={`min-h-[80px] md:min-h-[120px] bg-white p-1 md:p-2 transition-colors relative
                            ${!readOnly ? 'cursor-pointer hover:bg-gray-50' : ''}
                            ${isCurrentDay ? 'bg-primary-50/20' : ''}
                        `}
                        onClick={() => !readOnly && onDateClick && onDateClick(day)}
                    >
                        <div className={`text-sm font-medium mb-1 flex justify-center md:justify-between items-start ${isCurrentDay ? 'text-primary-600 font-bold' : 'text-gray-700'}`}>
                            <span>{format(day, 'd')}</span>
                            {isCurrentDay && <span className="hidden md:block w-2 h-2 rounded-full bg-primary-500"></span>}
                        </div>
                        
                        <div className="space-y-1">
                            {/* Mobile View: Dots */}
                            <div className="md:hidden flex justify-center gap-0.5 flex-wrap">
                                {dayEvents.map(ev => (
                                    <div key={ev.id} className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                ))}
                            </div>

                            {/* Desktop View: Full Cards */}
                            <div className="hidden md:block space-y-1">
                                {dayEvents.map(ev => (
                                    <div key={ev.id} className="text-xs bg-primary-100 text-primary-800 p-1 rounded truncate group relative" title={ev.title}>
                                        <span className="font-medium">{format(new Date(ev.eventDate), 'HH:mm')}</span> {ev.title}
                                        {renderEventAction && (
                                            <div className="absolute top-0 right-0 bottom-0 hidden group-hover:flex">
                                                {renderEventAction(ev)}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};
