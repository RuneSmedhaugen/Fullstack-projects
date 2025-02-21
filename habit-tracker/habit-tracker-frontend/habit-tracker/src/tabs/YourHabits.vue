<template>
    <div id="yourHabitsDiv" class="container mt-4">
      <h2>Your Habits</h2>
      <div v-if="errorMessage" class="alert alert-danger">{{ errorMessage }}</div>
      <div v-if="successMessage" class="alert alert-success">{{ successMessage }}</div>
      
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link" :class="{ active: currentTab === 'uncompleted' }" @click="currentTab = 'uncompleted'">Uncompleted</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{ active: currentTab === 'completed' }" @click="currentTab = 'completed'">Completed</a>
        </li>
      </ul>
  
      <div class="list-group mt-3">
        <div class="list-group-item" v-for="habit in filteredHabits" :key="habit.id">
          <div class="d-flex justify-content-between align-items-center">
            <div class="form-check">
              <input
                class="form-check-input custom-checkbox"
                type="checkbox"
                :id="'habit-' + habit.id"
                :checked="habit.done"
                @change="handleCheckboxChange(habit)"
              />
              <label class="form-check-label" :for="'habit-' + habit.id">
                <span class="habit-details">Name: {{ habit.name }} | Description: {{ habit.description }} | Purpose: {{ habit.purpose }} | Time Perspective: {{ habit.time_perspective }}</span>
              </label>
            </div>
            <div>
              <button class="btn btn-link" @click="toggleEdit(habit)">Edit <i class="bi bi-gear-fill"></i></button>
            </div>
          </div>
  
          <div v-if="editingHabitId === habit.id" class="mt-2">
            <form @submit.prevent="updateHabit(habit)">
              <div class="mb-2">
                <label>Name:</label>
                <input type="text" v-model="habit.editName" class="form-control" />
              </div>
              <div class="mb-2">
                <label>Description:</label>
                <textarea v-model="habit.editDescription" class="form-control"></textarea>
              </div>
              <div class="mb-2">
                <label>Purpose:</label>
                <input type="text" v-model="habit.editPurpose" class="form-control" />
              </div>
              <div class="mb-2">
                <label>Time Perspective:</label>
                <select v-model="habit.editTimePerspective" class="form-control">
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>
              <div>
                <button type="submit" class="btn btn-primary btn-sm">Save</button>
                <button type="button" class="btn btn-secondary btn-sm ms-2" @click="cancelEdit()">Cancel</button>
                <button type="button" class="btn btn-danger btn-sm ms-2" @click="deleteHabit(habit)">Delete</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    name: "YourHabits",
    data() {
      return {
        habits: [],
        editingHabitId: null,
        errorMessage: "",
        successMessage: "",
        currentTab: 'uncompleted',
      };
    },
    mounted() {
      this.fetchHabits();
    },
    computed: {
      filteredHabits() {
        return this.currentTab === 'completed'
          ? this.habits.filter(habit => habit.done)
          : this.habits.filter(habit => !habit.done);
      },
    },
    methods: {
      async fetchHabits() {
        const token = localStorage.getItem("token");
        if (!token) {
          this.errorMessage = "No token found. Please log in again.";
          return;
        }
        try {
          const habitsResponse = await axios.get("http://localhost:5000/api/habits", {
            headers: { Authorization: `Bearer ${token}` },
          });
  
          this.habits = habitsResponse.data.map((habit) => ({
            ...habit,
            editName: habit.name,
            editDescription: habit.description,
            editPurpose: habit.purpose,
            editTimePerspective: habit.time_perspective,
            done: false,
          }));
  
          const completionsResponse = await axios.get("http://localhost:5000/api/habits/completions", {
            headers: { Authorization: `Bearer ${token}` },
          });
          const completions = completionsResponse.data;
  
          this.habits.forEach((habit) => {
            if (completions.find((c) => c.habit_id === habit.id)) {
              habit.done = true;
            }
          });
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Error fetching habits.";
        }
      },
  
      async handleCheckboxChange(habit) {
        if (habit.done) {
          habit.done = false;
        } else {
          try {
            const response = await axios.post(
              `http://localhost:5000/api/habits/${habit.id}/completion`,
              {},
              {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
              }
            );
  
            habit.done = true;  // Mark the habit as done
            this.successMessage = `Habit completed! You earned ${response.data.xp_reward} XP and ${response.data.gold_reward} gold.`;
          } catch (error) {
            this.errorMessage = error.response?.data?.message || "Error marking habit as done.";
          }
        }
      },
  
      toggleEdit(habit) {
        if (this.editingHabitId === habit.id) {
          this.editingHabitId = null;
        } else {
          this.editingHabitId = habit.id;
  
          habit.editName = habit.name;
          habit.editDescription = habit.description;
          habit.editPurpose = habit.purpose;
          habit.editTimePerspective = habit.time_perspective;
        }
      },
  
      cancelEdit() {
        this.editingHabitId = null;
      },
  
      async updateHabit(habit) {
        const token = localStorage.getItem("token");
        if (!token) {
          this.errorMessage = "No token found. Please log in again.";
          return;
        }
        try {
          const response = await axios.put(
            `http://localhost:5000/api/habits/${habit.id}`,
            {
              name: habit.editName,
              description: habit.editDescription,
              purpose: habit.editPurpose,
              time_perspective: habit.editTimePerspective,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );
  
          habit.name = response.data.name;
          habit.description = response.data.description;
          habit.purpose = response.data.purpose;
          habit.time_perspective = response.data.time_perspective;
          this.editingHabitId = null;
          this.successMessage = `Habit "${habit.name}" updated successfully!`;
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Error updating habit.";
        }
      },
  
      async deleteHabit(habit) {
        const token = localStorage.getItem("token");
        if (!token) {
          this.errorMessage = "No token found. Please log in again.";
          return;
        }
        try {
          await axios.delete(`http://localhost:5000/api/habits/${habit.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          this.habits = this.habits.filter((h) => h.id !== habit.id);
          this.successMessage = `Habit "${habit.name}" deleted successfully!`;
        } catch (error) {
          this.errorMessage = error.response?.data?.message || "Error deleting habit.";
        }
      },
    },
  };
  </script>
  
  <style scoped>
  #yourHabitsDiv {
    padding: 20px;
  }
  
  .nav-tabs .nav-link {
    border: 1px solid #dee2e6;
    border-radius: 0.25rem;
    transition: background-color 0.3s;
  }
  
  .nav-tabs .nav-link.active {
    background-color: #007bff;
    color: white;
  }
  
  .list-group-item {
    margin-bottom: 10px;
  }
  
  .custom-checkbox {
    width: 20px;
    height: 20px;
    appearance: none;
    border: 2px solid #007bff;
    border-radius: 4px;
    position: relative;
  }
  
  .custom-checkbox:checked {
    background-color: #007bff;
    border-color: #007bff;
  }
  
  .custom-checkbox:checked::after {
    content: "";
    position: absolute;
    top: 2px;
    left: 5px;
    width: 8px;
    height: 16px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }
  
  .habit-details {
    color: #333;
    font-size: 14px;
    margin-left: 10px;
  }
  </style>
  