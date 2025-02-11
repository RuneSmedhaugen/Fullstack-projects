<template>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">Habit Stats</h2>
      <div class="grid grid-cols-2 gap-4">
        <div class="bg-gray-100 p-4 rounded-lg shadow">
          <p class="text-lg font-medium">Total Habits</p>
          <p class="text-2xl font-bold">{{ stats.totalHabits }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow">
          <p class="text-lg font-medium">Total Completions</p>
          <p class="text-2xl font-bold">{{ stats.totalCompletions }}</p>
        </div>
        <div class="bg-gray-100 p-4 rounded-lg shadow">
          <p class="text-lg font-medium">Longest Streak</p>
          <p class="text-2xl font-bold">{{ stats.longestStreak }} days</p>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        stats: {
          totalHabits: 0,
          totalCompletions: 0,
          longestStreak: 0,
        },
      };
    },
    async mounted() {
      try {
        const response = await fetch('http://localhost:5000/api/habits/stats', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          this.stats = await response.json();
        } else {
          console.error('Failed to fetch stats');
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    },
  };
  </script>
  
  <style scoped>
  p {
    margin: 0;
  }
  </style>
  