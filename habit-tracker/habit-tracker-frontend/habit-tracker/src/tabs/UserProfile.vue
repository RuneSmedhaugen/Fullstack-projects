<template>
    <div class="p-6">
      <h2 class="text-2xl font-bold mb-4">User Profile</h2>
  
      <!-- Display Profile Information -->
      <div v-if="!isEditing">
        <div class="mb-4">
          <p><strong>Username:</strong> {{ userProfile.username }}</p>
          <p><strong>Email:</strong> {{ userProfile.email }}</p>
          <p><strong>Account Created:</strong> {{ formatDate(userProfile.created_at) }}</p>
        </div>
  
        <button class="bg-blue-500 text-white px-4 py-2 rounded" @click="isEditing = true">Edit Profile</button>
      </div>
  
      <!-- Edit Profile Form -->
      <div v-else>
        <div class="mb-4">
          <label for="username" class="block">Username</label>
          <input
            type="text"
            id="username"
            v-model="form.username"
            class="p-2 border rounded w-full"
            required
          />
  
          <label for="email" class="block mt-2">Email</label>
          <input
            type="email"
            id="email"
            v-model="form.email"
            class="p-2 border rounded w-full"
            required
          />
  
          <label for="password" class="block mt-2">Password</label>
          <input
            type="password"
            id="password"
            v-model="form.password"
            class="p-2 border rounded w-full"
          />
  
          <label for="confirmPassword" class="block mt-2">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            v-model="form.confirmPassword"
            class="p-2 border rounded w-full"
          />
        </div>
  
        <button
          class="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          @click="saveProfile"
        >
          Save Changes
        </button>
        <button class="bg-gray-500 text-white px-4 py-2 rounded" @click="cancelEdit">
          Cancel
        </button>
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
  
  <style scoped>
  p {
    margin-bottom: 8px;
  }
  input {
    margin-bottom: 12px;
  }
  button {
    margin-top: 12px;
  }
  </style>
  