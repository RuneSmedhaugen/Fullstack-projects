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

      <!-- Edit Profile Form -->
      <div v-if="isEditing">
        <h3 class="mb-3">Edit Profile</h3>
        <form @submit.prevent="updateProfile">
          <div class="mb-3">
            <label for="username" class="form-label">Username</label>
            <input type="text" id="username" v-model="editProfile.username" class="form-control" required>
          </div>
          <div class="mb-3">
            <label for="email" class="form-label">Email</label>
            <input type="email" id="email" v-model="editProfile.email" class="form-control" required>
          </div>
          <button type="submit" class="btn btn-primary w-100 mb-2">Save Changes</button>
          <button type="button" class="btn btn-secondary w-100" @click="isEditing = false">Cancel</button>
        </form>
      </div>

      <!-- Friend Requests -->
      <div v-if="showFriendRequests">
        <h3 class="mb-3">Friend Requests</h3>
        <ul class="list-group">
          <li v-for="request in friendRequests" :key="request.id" class="list-group-item d-flex justify-content-between align-items-center">
            <span>{{ request.sender_username }}</span>
            <div>
              <button class="btn btn-sm btn-success me-2" @click="respondToRequest(request.id, true)">Accept</button>
              <button class="btn btn-sm btn-danger" @click="respondToRequest(request.id, false)">Decline</button>
            </div>
          </li>
        </ul>
        <button class="btn btn-link mt-3" @click="showFriendRequests = false">Back to Profile</button>
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
      editProfile: {
        username: '',
        email: '',
      },
      friends: [],
      friendRequests: [],
      isEditing: false,
      showFriendRequests: false,
      showFriendsList: false,
    };
  },
  async mounted() {
    await this.fetchUserProfile();
  },

  watch: {
    showFriendRequests(val) {
      if (val) this.fetchFriendRequests();  // Fetch friend requests when the section is shown
    }
  },

  methods: {
    async fetchFriendRequests() {
      try {
        const response = await fetch('http://localhost:5000/api/notifications/friend-requests', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.ok) {
          this.friendRequests = await response.json();
        } else {
          console.error('Failed to fetch friend requests');
        }
      } catch (error) {
        console.error('Error fetching friend requests:', error);
      }
    },

    async respondToRequest(requestId, accept) {
      try {
        const response = await fetch('http://localhost:5000/api/notifications/respond', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requestId, accept }),
        });
        if (response.ok) {
          console.log('Friend request response sent');
          this.friendRequests = this.friendRequests.filter(req => req.id !== requestId);
          if (accept) {
            this.fetchFriends();  // Refresh friends list if accepted
          }
        } else {
          console.error('Failed to respond to friend request');
        }
      } catch (error) {
        console.error('Error responding to friend request:', error);
      }
    },

    async fetchUserProfile() {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });
        if (response.status === 401) {
          console.error('Unauthorized. Redirecting to login.');
          this.$router.push('/login');  // Assuming you're using Vue Router
        } else if (response.ok) {
          this.userProfile = await response.json();
          this.editProfile = { ...this.userProfile };  // Initialize editProfile with userProfile data
        } else {
          console.error('Failed to fetch user profile');
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    },

    async updateProfile() {
      try {
        const response = await fetch('http://localhost:5000/api/users/profile', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(this.editProfile),
        });
        if (response.ok) {
          this.userProfile = await response.json();
          this.isEditing = false;
        } else {
          console.error('Failed to update profile');
        }
      } catch (error) {
        console.error('Error updating profile:', error);
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