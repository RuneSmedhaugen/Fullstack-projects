<template>
  <div class="container mt-5">
    <div class="card shadow-sm p-4">
      <h2 class="text-center mb-4">User Profile</h2>

      <!-- Display Profile Information -->
      <div v-if="!isEditing && !showFriendRequests && !showFriendsList">
        <div class="mb-4">
          <p><strong>Username:</strong> {{ userProfile.username }}</p>
          <p><strong>Email:</strong> {{ userProfile.email }}</p>
          <p><strong>Account Created:</strong> {{ formatDate(userProfile.created_at) }}</p>
        </div>

        <button class="btn btn-primary w-100 mb-2" @click="isEditing = true">Edit Profile</button>
        <button class="btn btn-success w-100 mb-2" @click="showFriendRequests = true">Friend Requests</button>
        <button class="btn btn-info w-100" @click="toggleFriendsList">Friends</button>
      </div>

      <!-- Friends List -->
      <div v-if="showFriendsList">
        <h3 class="mb-3">Your Friends</h3>
        <ul class="list-group">
          <li v-for="friend in friends" :key="friend.friendId" class="list-group-item d-flex justify-content-between align-items-center">
            <span>{{ friend.username }}</span>
            <button class="btn btn-sm btn-outline-danger" @click="removeFriend(friend.friendId)">Remove</button>
          </li>
        </ul>
        <button class="btn btn-link mt-3" @click="toggleFriendsList">Back to Profile</button>
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
      friends: [],
      isEditing: false,
      showFriendRequests: false,
      showFriendsList: false,
    };
  },
  async mounted() {
    await this.fetchUserProfile();
  },
  methods: {
    async fetchUserProfile() {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          this.userProfile = await response.json();
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },
    async fetchFriends() {
      try {
        const userId = this.userProfile.id;
        const response = await fetch(`http://localhost:5000/api/friends/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          this.friends = await response.json();
        } else {
          console.error('Failed to fetch friends list');
        }
      } catch (error) {
        console.error('Error fetching friends:', error);
      }
    },
    toggleFriendsList() {
      this.showFriendsList = !this.showFriendsList;
      if (this.showFriendsList) {
        this.fetchFriends();
      }
    },
    async removeFriend(friendId) {
      try {
        const userId = this.userProfile.id;
        const response = await fetch(`http://localhost:5000/api/friends/${userId}/${friendId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          this.friends = this.friends.filter(friend => friend.friendId !== friendId);
        } else {
          console.error('Failed to delete friend');
        }
      } catch (error) {
        console.error('Error deleting friend:', error);
      }
    },
    formatDate(dateString) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
  },
};
</script>
