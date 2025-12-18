<template>
  <div id="app">
    <Sidebar />
    <main class="main-content">
      <Header />
      <div class="page-content">
        <h1 class="page-title">Calendar</h1>
        <Calendar />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import Sidebar from './components/Sidebar.vue'
import Header from './components/Header.vue'
import Calendar from './components/Calendar.vue'
</script>
