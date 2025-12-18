<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal" :style="modalStyle">
      <div class="modal-arrow"></div>
      <button class="modal-close" @click="$emit('close')">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
      <div class="modal-body">
        <div class="form-group" :class="{ 'has-error': errors.title }">
          <input
            v-model="form.title"
            type="text"
            placeholder="event name"
            maxlength="30"
            class="form-input"
          >
          <span v-if="errors.title" class="error-message">{{ errors.title }}</span>
        </div>
        <div class="form-group" :class="{ 'has-error': errors.date }">
          <div class="input-with-icon">
            <input
              v-model="form.date"
              type="text"
              placeholder="event date"
              class="form-input"
              @focus="showDatePicker"
            >
            <input
              ref="datePickerRef"
              v-model="form.date"
              type="date"
              class="hidden-date-picker"
              @change="onDateChange"
            >
            <span class="input-icon" @click="showDatePicker">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ccc">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/>
              </svg>
            </span>
          </div>
          <span v-if="errors.date" class="error-message">{{ errors.date }}</span>
        </div>
        <div class="form-group" :class="{ 'has-error': errors.time }">
          <div class="input-with-icon">
            <input
              v-model="form.time"
              type="text"
              placeholder="event time"
              class="form-input"
              @focus="showTimePicker"
            >
            <input
              ref="timePickerRef"
              v-model="form.time"
              type="time"
              class="hidden-time-picker"
              @change="onTimeChange"
            >
            <span class="input-icon" @click="showTimePicker">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#ccc">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </span>
          </div>
          <span v-if="errors.time" class="error-message">{{ errors.time }}</span>
        </div>
        <div class="form-group">
          <textarea
            v-model="form.notes"
            placeholder="notes"
            class="form-textarea"
            rows="3"
          ></textarea>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn btn-cancel" @click="$emit('close')">
          Cancel
        </button>
        <button class="btn btn-save" @click="handleSave">
          Save
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, ref, computed } from 'vue'
import type { CalendarEvent } from '@/types/event'

interface Props {
  event?: CalendarEvent | null
  selectedDate?: Date | null
  position?: { x: number; y: number }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: { title: string; date: string; time: string; color: string }): void
}>()

const datePickerRef = ref<HTMLInputElement | null>(null)
const timePickerRef = ref<HTMLInputElement | null>(null)

const modalStyle = computed(() => {
  if (props.position) {
    return {
      position: 'fixed' as const,
      left: `${props.position.x}px`,
      top: `${props.position.y + 10}px`,
      transform: 'translateX(-50%)'
    }
  }
  return {}
})

const formatDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const formatTime = (date: Date): string => {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

const DEFAULT_COLOR = '#4A90E2'

const form = reactive({
  title: '',
  date: '',
  time: '',
  notes: '',
  color: DEFAULT_COLOR
})

const errors = reactive({
  title: '',
  date: '',
  time: ''
})

watch(() => props.event, (event) => {
  if (event) {
    form.title = event.title
    form.date = formatDate(event.start)
    form.time = formatTime(event.start)
    form.color = event.color
  }
}, { immediate: true })

watch(() => props.selectedDate, (date) => {
  if (date && !props.event) {
    form.date = formatDate(date)
    form.time = formatTime(date)
  }
}, { immediate: true })

const showDatePicker = () => {
  datePickerRef.value?.showPicker()
}

const showTimePicker = () => {
  timePickerRef.value?.showPicker()
}

const onDateChange = () => {
  errors.date = ''
}

const onTimeChange = () => {
  errors.time = ''
}

const validateForm = (): boolean => {
  let isValid = true

  // Reset errors
  errors.title = ''
  errors.date = ''
  errors.time = ''

  // Validate title
  if (!form.title.trim()) {
    errors.title = 'Event name is required'
    isValid = false
  }

  // Validate date
  if (!form.date) {
    errors.date = 'Event date is required'
    isValid = false
  } else {
    // Check if date is in the past
    const selectedDate = new Date(form.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      errors.date = 'Past date is not allowed'
      isValid = false
    }
  }

  // Validate time
  if (!form.time) {
    errors.time = 'Event time is required'
    isValid = false
  }

  return isValid
}

const handleSave = () => {
  if (!validateForm()) return

  emit('save', {
    title: form.title.trim(),
    date: form.date,
    time: form.time,
    color: form.color
  })
}

</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 4px;
  width: 280px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  position: relative;
}

.modal-arrow {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-bottom: 10px solid white;
}

.modal-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.2s;
}

.modal-close:hover {
  background: #f5f5f5;
  color: #999;
}

.modal-body {
  padding: 24px 20px 16px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 0;
  border: none;
  border-bottom: 1px solid #e8e8e8;
  font-size: 14px;
  color: #333;
  background: transparent;
  outline: none;
  transition: border-color 0.2s;
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: #ccc;
}

.form-input:focus,
.form-textarea:focus {
  border-bottom-color: #4A90E2;
}

.form-textarea {
  resize: none;
  font-family: inherit;
}

.input-with-icon {
  position: relative;
}

.input-with-icon .form-input {
  padding-right: 30px;
}

.input-icon {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  display: flex;
  align-items: center;
}

.hidden-date-picker,
.hidden-time-picker {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.has-error .form-input,
.has-error .form-textarea {
  border-bottom-color: #e74c3c;
}

.error-message {
  display: block;
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 20px;
  gap: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  background: none;
  border: none;
  padding: 8px 0;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}

.btn-cancel {
  color: #D4A84B;
}

.btn-cancel:hover {
  color: #c49a3d;
}

.btn-save {
  color: #666;
}

.btn-save:hover {
  color: #333;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .modal-overlay {
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal {
    position: static !important;
    transform: none !important;
    width: calc(100% - 32px);
    max-width: 320px;
  }

  .modal-arrow {
    display: none;
  }
}
</style>
