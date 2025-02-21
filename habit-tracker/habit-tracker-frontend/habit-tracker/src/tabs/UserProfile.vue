<template>
    <div class="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 class="text-3xl font-bold mb-6 text-center">User Profile</h2>
  
      <!-- Display Profile Information -->
      <div v-if="!isEditing">
        <div class="space-y-4">
          <div>
            <p class="text-lg"><strong>Username:</strong> {{ userProfile.username }}</p>
            <p class="text-lg"><strong>Email:</strong> {{ userProfile.email }}</p>
            <p class="text-lg"><strong>Account Created:</strong> {{ formatDate(userProfile.created_at) }}</p>
          </div>
  
          <button class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-lg w-full" @click="isEditing = true">Edit Profile</button>
        </div>
      </div>
  
      <!-- Edit Profile Form -->
      <div v-else>
        <div class="space-y-4">
          <div>
            <label for="username" class="block font-medium">Username</label>
            <input
              type="text"
              id="username"
              v-model="form.username"
              class="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
  
            <label for="email" class="block font-medium mt-4">Email</label>
            <input
              type="email"
              id="email"
              v-model="form.email"
              class="w-full p-3 border border-gray-300 rounded-lg"
              required
            />
  
            <label for="password" class="block font-medium mt-4">Password</label>
            <input
              type="password"
              id="password"
              v-model="form.password"
              class="w-full p-3 border border-gray-300 rounded-lg"
            />
  
            <label for="confirmPassword" class="block font-medium mt-4">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              v-model="form.confirmPassword"
              class="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
        </div>
  
        <div class="flex space-x-4 mt-6">
          <button
            class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg text-lg w-full"
            @click="saveProfile"
          >
            Save Changes
          </button>
          <button
            class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg text-lg w-full"
            @click="cancelEdit"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        userProfile: {
          username: '',
          email: '',
          created_at: '',
        },
        form: {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
        },
        isEditing: false,
      };
    },
    async mounted() {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          this.userProfile = await response.json();
          this.form.username = this.userProfile.username;
          this.form.email = this.userProfile.email;
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    methods: {
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
      async saveProfile() {
        if (this.form.password !== this.form.confirmPassword) {
          alert('Passwords do not match');
          return;
        }
  
        try {
          const response = await fetch('http://localhost:5000/api/users/profile', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
              username: this.form.username,
              email: this.form.email,
              password: this.form.password,
            }),
          });
  
          if (response.ok) {
            const updatedUser = await response.json();
            this.userProfile = updatedUser;
            this.isEditing = false;
          } else {
            console.error('Failed to update user profile');
          }
        } catch (error) {
          console.error('Error updating user profile:', error);
        }
      },
      cancelEdit() {
        this.isEditing = false;
        this.form.username = this.userProfile.username;
        this.form.email = this.userProfile.email;
        this.form.password = '';
        this.form.confirmPassword = '';
      },
    },
  };
  </script>
  
  