import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { CalendarEvent } from '@/types/event'

export const useEventsStore = defineStore('events', () => {
  const events = ref<CalendarEvent[]>([
    {
      id: '1',
      title: 'Event name',
      start: new Date(2018, 0, 2, 0, 0),
      end: new Date(2018, 0, 2, 2, 0),
      color: '#4A90E2',
      allDay: false
    },
    {
      id: '2',
      title: 'Event name',
      start: new Date(2018, 0, 4, 0, 0),
      end: new Date(2018, 0, 4, 23, 59),
      color: '#4A90E2',
      allDay: true
    },
    {
      id: '3',
      title: 'Event name',
      start: new Date(2018, 0, 5, 0, 0),
      end: new Date(2018, 0, 5, 23, 59),
      color: '#4A90E2',
      allDay: true
    },
    {
      id: '4',
      title: 'Event name',
      start: new Date(2018, 0, 5, 0, 0),
      end: new Date(2018, 0, 5, 23, 59),
      color: '#4A90E2',
      allDay: true
    },
    {
      id: '5',
      title: 'Event name',
      start: new Date(2018, 0, 14, 0, 0),
      end: new Date(2018, 0, 14, 23, 59),
      color: '#4A90E2',
      allDay: true
    },
    {
      id: '6',
      title: 'Event name',
      start: new Date(2018, 0, 20, 0, 0),
      end: new Date(2018, 0, 20, 23, 59),
      color: '#4A90E2',
      allDay: true
    },
    {
      id: '7',
      title: 'Event name',
      start: new Date(2018, 0, 28, 0, 0),
      end: new Date(2018, 0, 28, 23, 59),
      color: '#4A90E2',
      allDay: true
    },
    {
      id: '8',
      title: 'Event name',
      start: new Date(2018, 0, 29, 0, 0),
      end: new Date(2018, 0, 29, 23, 59),
      color: '#4A90E2',
      allDay: true
    }
  ])

  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }

  function addEvent(event: Omit<CalendarEvent, 'id'>): CalendarEvent {
    const newEvent: CalendarEvent = {
      ...event,
      id: generateId()
    }
    events.value.push(newEvent)
    return newEvent
  }

  function updateEvent(id: string, updates: Partial<CalendarEvent>): CalendarEvent | null {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value[index] = { ...events.value[index], ...updates }
      return events.value[index]
    }
    return null
  }

  function deleteEvent(id: string): boolean {
    const index = events.value.findIndex(e => e.id === id)
    if (index !== -1) {
      events.value.splice(index, 1)
      return true
    }
    return false
  }

  function getEventById(id: string): CalendarEvent | undefined {
    return events.value.find(e => e.id === id)
  }

  return {
    events,
    addEvent,
    updateEvent,
    deleteEvent,
    getEventById
  }
})
