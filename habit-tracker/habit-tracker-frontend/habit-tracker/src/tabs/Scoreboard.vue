<!-- src/tabs/Scoreboard.vue -->
<template>
    <div class="container mt-4">
      <h2 class="text-center mb-4">Scoreboard</h2>
      <div class="btn-group mb-3">
        <button class="btn btn-primary" @click="fetchGlobalScoreboard" :class="{ active: activeTab === 'global' }">
          Global
        </button>
        <button class="btn btn-secondary" @click="fetchFriendScoreboard" :class="{ active: activeTab === 'friends' }">
          Friends
        </button>
      </div>
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Username</th>
            <th>XP</th>
            <th>Level</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in scoreboard" :key="user.id">
            <td>{{ index + 1 }}</td>
            <td>{{ user.username }}</td>
            <td>{{ user.xp }}</td>
            <td>{{ user.level }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'Scoreboard',
    data() {
      return {
        scoreboard: [],
        activeTab: 'global'
      };
    },
    methods: {
      async fetchGlobalScoreboard() {
        this.activeTab = 'global';
        try {
          const response = await axios.get('http://localhost:5000/api/scoreboard/global', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          this.scoreboard = response.data;
        } catch (error) {
          console.error('Error fetching global scoreboard:', error);
        }
      },
      async fetchFriendScoreboard() {
        this.activeTab = 'friends';
        try {
          const response = await axios.get('http://localhost:5000/api/scoreboard/friends', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          this.scoreboard = response.data;
        } catch (error) {
          console.error('Error fetching friend scoreboard:', error);
        }
      }
    },
    mounted() {
      this.fetchGlobalScoreboard();
    }
  };
  </script>
  
  <style scoped>
  .active {
    background-color: #0056b3;
    color: white;
  }
  </style>
  