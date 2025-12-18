export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  color: string
  allDay?: boolean
}

export interface EventFormData {
  title: string
  date: string
  time: string
  color: string
}
