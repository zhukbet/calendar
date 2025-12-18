<template>
  <div class="calendar-card">
    <div class="calendar-header">
      <div class="calendar-title">Calendar View</div>
      <div class="view-buttons">
        <button
          v-for="view in views"
          :key="view.key"
          class="view-btn"
          :class="{ active: currentView === view.key }"
          @click="setView(view.key)"
        >
          {{ view.label }}
        </button>
      </div>
    </div>
    <div class="calendar-controls">
      <div class="calendar-nav">
        <button class="nav-btn" :class="{ active: isToday }" @click="goToToday">Today</button>
        <button class="nav-btn" @click="goPrev">Back</button>
        <button class="nav-btn" @click="goNext">Next</button>
      </div>
      <div class="current-date">{{ currentDateTitle }}</div>
    </div>
    <div class="calendar-wrapper">
      <FullCalendar
        ref="calendarRef"
        :options="calendarOptions"
      />
    </div>
    <EventModal
      v-if="showModal"
      :event="selectedEvent"
      :selected-date="selectedDate"
      :position="modalPosition"
      @close="closeModal"
      @save="handleSave"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import { useEventsStore } from '@/stores/events'
import EventModal from './EventModal.vue'
import type { CalendarEvent } from '@/types/event'
import type { CalendarOptions, DateSelectArg, EventDropArg } from '@fullcalendar/core'
import { format } from 'date-fns'

const eventsStore = useEventsStore()
const calendarRef = ref<InstanceType<typeof FullCalendar> | null>(null)
const showModal = ref(false)
const selectedEvent = ref<CalendarEvent | null>(null)
const selectedDate = ref<Date | null>(null)
const currentView = ref('dayGridMonth')
const currentDateTitle = ref('')
const isToday = ref(true)
const modalPosition = ref({ x: 0, y: 0 })

const views = [
  { key: 'dayGridMonth', label: 'Month' },
  { key: 'timeGridWeek', label: 'Week' },
  { key: 'timeGridDay', label: 'Day' },
  { key: 'listWeek', label: 'Agenda' }
]

const calendarEvents = computed(() => {
  return eventsStore.events.map(event => ({
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    backgroundColor: event.color,
    borderColor: event.color,
    allDay: event.allDay
  }))
})

const updateTitle = () => {
  const api = calendarRef.value?.getApi()
  if (api) {
    const view = api.view
    const start = view.currentStart
    const end = view.currentEnd

    if (currentView.value === 'dayGridMonth') {
      currentDateTitle.value = format(start, 'MMMM yyyy')
    } else if (currentView.value === 'timeGridWeek') {
      const endDate = new Date(end)
      endDate.setDate(endDate.getDate() - 1)
      currentDateTitle.value = `${format(start, 'MMM d')} - ${format(endDate, 'MMM d')}`
    } else if (currentView.value === 'timeGridDay') {
      currentDateTitle.value = format(start, 'EEEE MMM d')
    } else if (currentView.value === 'listWeek') {
      currentDateTitle.value = 'Agenda'
    } else {
      currentDateTitle.value = format(start, 'MMMM yyyy')
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const viewStart = new Date(start)
    viewStart.setHours(0, 0, 0, 0)
    const viewEnd = new Date(end)
    viewEnd.setHours(0, 0, 0, 0)
    isToday.value = today >= viewStart && today < viewEnd
  }
}

const calendarOptions = computed<CalendarOptions>(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
  initialView: currentView.value,
  initialDate: new Date(2018, 0, 2),
  headerToolbar: false,
  events: calendarEvents.value,
  editable: true,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  nowIndicator: true,
  now: new Date(2018, 0, 2, 8, 0, 0),
  eventDisplay: 'block',
  slotMinTime: '00:00:00',
  slotMaxTime: '24:00:00',
  slotDuration: '02:00:00',
  slotLabelFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  },
  dayHeaderFormat: {
    weekday: 'short'
  },
  allDaySlot: true,
  height: 'auto',
  select: handleDateSelect,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  datesSet: updateTitle
}))

watch(currentView, () => {
  const api = calendarRef.value?.getApi()
  if (api) {
    api.changeView(currentView.value)
    updateTitle()
  }
})

function setView(view: string) {
  currentView.value = view
}

function goToToday() {
  if (currentView.value === 'listWeek') return
  const api = calendarRef.value?.getApi()
  if (api) {
    api.today()
    updateTitle()
  }
}

function goPrev() {
  if (currentView.value === 'listWeek') return
  const api = calendarRef.value?.getApi()
  if (api) {
    api.prev()
    updateTitle()
  }
}

function goNext() {
  if (currentView.value === 'listWeek') return
  const api = calendarRef.value?.getApi()
  if (api) {
    api.next()
    updateTitle()
  }
}

function handleDateSelect(selectInfo: DateSelectArg) {
  // Don't open modal in Agenda view
  if (currentView.value === 'listWeek') {
    selectInfo.view.calendar.unselect()
    return
  }

  selectedEvent.value = null
  selectedDate.value = selectInfo.start

  // Get position from the clicked cell
  const cellEl = selectInfo.jsEvent?.target as HTMLElement
  if (cellEl) {
    const rect = cellEl.closest('.fc-daygrid-day, .fc-timegrid-slot')?.getBoundingClientRect()
      || cellEl.getBoundingClientRect()
    modalPosition.value = {
      x: rect.left + rect.width / 2,
      y: rect.bottom
    }
  }

  showModal.value = true
  selectInfo.view.calendar.unselect()
}


function handleEventDrop(dropInfo: EventDropArg) {
  const event = eventsStore.getEventById(dropInfo.event.id)
  if (event) {
    const duration = event.end.getTime() - event.start.getTime()
    const newStart = dropInfo.event.start!
    const newEnd = new Date(newStart.getTime() + duration)

    eventsStore.updateEvent(event.id, {
      start: newStart,
      end: newEnd
    })
  }
}

function handleEventResize(resizeInfo: any) {
  const event = eventsStore.getEventById(resizeInfo.event.id)
  if (event) {
    eventsStore.updateEvent(event.id, {
      start: resizeInfo.event.start!,
      end: resizeInfo.event.end || resizeInfo.event.start!
    })
  }
}

function closeModal() {
  showModal.value = false
  selectedEvent.value = null
  selectedDate.value = null
}

function handleSave(data: { title: string; date: string; time: string; color: string }) {
  const [year, month, day] = data.date.split('-').map(Number)
  const [hours, minutes] = data.time ? data.time.split(':').map(Number) : [0, 0]

  const start = new Date(year, month - 1, day, hours, minutes)
  const end = new Date(start)
  end.setHours(end.getHours() + 1)

  if (selectedEvent.value) {
    eventsStore.updateEvent(selectedEvent.value.id, {
      title: data.title,
      start,
      end,
      color: data.color
    })
  } else {
    eventsStore.addEvent({
      title: data.title,
      start,
      end,
      color: data.color,
      allDay: !data.time
    })
  }

  closeModal()
}

</script>

<style scoped>
.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.calendar-nav {
  display: flex;
}

.calendar-wrapper {
  min-height: 600px;
}

.calendar-wrapper :deep(.fc) {
  font-family: 'Roboto', sans-serif;
}

.calendar-wrapper :deep(.fc-theme-standard td),
.calendar-wrapper :deep(.fc-theme-standard th) {
  border-color: #e8e8e8;
}

.calendar-wrapper :deep(.fc-theme-standard .fc-scrollgrid) {
  border-color: #e8e8e8;
}

.calendar-wrapper :deep(.fc .fc-col-header-cell) {
  background: #fafafa;
  padding: 12px 0;
}

.calendar-wrapper :deep(.fc .fc-col-header-cell-cushion) {
  color: #999;
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  text-decoration: none;
}

.calendar-wrapper :deep(.fc .fc-col-header) {
  background: #fafafa;
}

.calendar-wrapper :deep(.fc .fc-daygrid-day-number) {
  color: #333;
  font-size: 14px;
  padding: 8px;
  text-decoration: none;
}

.calendar-wrapper :deep(.fc .fc-daygrid-day.fc-day-today) {
  background: transparent;
}

.calendar-wrapper :deep(.fc .fc-daygrid-day.fc-day-today .fc-daygrid-day-number) {
  color: #5B6BE0;
  font-weight: 500;
}

.calendar-wrapper :deep(.fc .fc-daygrid-day.fc-day-other .fc-daygrid-day-number) {
  color: #ccc;
}

.calendar-wrapper :deep(.fc-event) {
  border: none;
  border-radius: 4px;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
  margin-bottom: 2px;
}

.calendar-wrapper :deep(.fc-event-title) {
  font-weight: 400;
}

.calendar-wrapper :deep(.fc-h-event) {
  background: #4A90E2;
}

/* All day event in Day/Week view - full width */
.calendar-wrapper :deep(.fc-timegrid-event-harness) {
  margin: 0 !important;
}

.calendar-wrapper :deep(.fc-timegrid-col-events) {
  margin: 0 !important;
}

.calendar-wrapper :deep(.fc-daygrid-day-events) {
  margin: 0 !important;
  padding: 0 !important;
}

.calendar-wrapper :deep(.fc-daygrid-event-harness) {
  margin-bottom: 2px !important;
}

.calendar-wrapper :deep(.fc-timegrid-event) {
  border-radius: 4px;
}

/* All day slot styling */
.calendar-wrapper :deep(.fc-daygrid-body-natural .fc-daygrid-day-events) {
  margin: 0;
}

.calendar-wrapper :deep(.fc-daygrid-event) {
  margin: 0 2px;
  border-radius: 4px;
}

.calendar-wrapper :deep(.fc-timegrid-col .fc-daygrid-event) {
  margin: 0;
}

/* Day view all-day event full width */
.calendar-wrapper :deep(.fc-daygrid-body-unbalanced .fc-daygrid-day-events) {
  min-height: auto;
}

.calendar-wrapper :deep(.fc .fc-daygrid-body-natural .fc-daygrid-day-events) {
  min-height: 2em;
}

.calendar-wrapper :deep(.fc-direction-ltr .fc-daygrid-event) {
  margin-left: 0;
  margin-right: 0;
}

.calendar-wrapper :deep(.fc-timegrid .fc-daygrid-day-frame) {
  min-height: auto;
}

.calendar-wrapper :deep(.fc-timegrid .fc-daygrid-body td) {
  padding: 0;
}

.calendar-wrapper :deep(.fc-timegrid .fc-daygrid-event-harness) {
  margin-top: 0;
}

.calendar-wrapper :deep(.fc-timegrid .fc-daygrid-event) {
  margin: 2px 4px;
  padding: 8px 12px;
  text-align: center;
}

.calendar-wrapper :deep(.fc-timegrid-event) {
  margin: 0 !important;
  left: 0 !important;
  right: 0 !important;
}

.calendar-wrapper :deep(.fc-timegrid-event-harness) {
  left: 0 !important;
  right: 0 !important;
}

.calendar-wrapper :deep(.fc-timegrid-event .fc-event-main) {
  padding: 4px 8px;
}

.calendar-wrapper :deep(.fc-timegrid-event .fc-event-title) {
  text-align: center;
}

.calendar-wrapper :deep(.fc .fc-button) {
  display: none;
}

.calendar-wrapper :deep(.fc .fc-toolbar) {
  display: none;
}

.calendar-wrapper :deep(.fc-timegrid-slot) {
  height: 50px !important;
}

.calendar-wrapper :deep(.fc-timegrid-slot-lane) {
  background: #fafafa;
}

.calendar-wrapper :deep(.fc-timegrid-slot-label-cushion) {
  color: #999;
  font-size: 12px;
}

.calendar-wrapper :deep(.fc .fc-timegrid-now-indicator-line) {
  border-color: #5B6BE0;
  border-width: 2px;
}

.calendar-wrapper :deep(.fc .fc-timegrid-now-indicator-line::before) {
  content: '';
  position: absolute;
  left: -5px;
  top: -4px;
  width: 10px;
  height: 10px;
  background: #5B6BE0;
  border-radius: 50%;
}

.calendar-wrapper :deep(.fc .fc-timegrid-now-indicator-arrow) {
  display: none;
}

.calendar-wrapper :deep(.fc-timegrid-divider) {
  display: none;
}

.calendar-wrapper :deep(.fc-cell-shaded) {
  background: transparent;
}

.calendar-wrapper :deep(.fc-list) {
  border: 1px solid #e8e8e8;
}

.calendar-wrapper :deep(.fc-list-event:hover td) {
  background: #f5f6fa;
}

.calendar-wrapper :deep(.fc-list-day-cushion) {
  background: #fafafa;
}
</style>
