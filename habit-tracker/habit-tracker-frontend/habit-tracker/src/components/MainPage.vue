<template>
    <div id="mainDiv">
      <div id="mainButtons">
        <h2>QuestLog</h2>
        <button @click="currentTab = 'YourHabits'">Your Habits</button>
        <button @click="currentTab = 'AddHabit'">Add a New Habit</button>
        <button @click="currentTab = 'ItemShop'">Item Shop</button>
        <button @click="currentTab = 'BossBattle'">Boss Battle</button>
        <button @click="currentTab = 'UserStats'">Stats</button>
        <button @click="currentTab = 'UserProfile'">Profile</button>
        <button @click="currentTab = 'UserSettings'">Settings</button>
      </div>
  
      <div id="tabContent">
        <component :is="currentTabComponent" />
      </div>
    </div>
  </template>
  
  <script>
  import AddHabit from '../tabs/AddHabit.vue'
  import BossBattle from '../tabs/BossBattle.vue';
  import ItemShop from '../tabs/ItemShop.vue';
  import UserProfile from '../tabs/UserProfile.vue';
  import UserSettings from '../tabs/UserSettings.vue';
  import UserStats from '../tabs/UserStats.vue';
  import YourHabits from '../tabs/YourHabits.vue';
  
  export default {
    name: 'MainPage',
    data() {
      return {
        currentTab: 'YourHabits',
      };
    },
    computed: {
      currentTabComponent() {
        return {
          AddHabit,
          BossBattle,
          ItemShop,
          UserProfile,
          UserSettings,
          UserStats,
          YourHabits,
        }[this.currentTab];
      },
    },
  };
  </script>
  
  <style scoped>
  #mainDiv {
    text-align: center;
    padding: 20px;
  }
  
  #mainButtons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 10px;
  }
  
  button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  </style>
  