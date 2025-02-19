<template>
    <div class="container p-4">
        <h2 class="text-3xl font-semibold mb-4">Item Shop</h2>
        <div class="mb-3">
            <h5 class="text-xl">Your Gold: {{ gold }}</h5>
        </div>
        <div class="row">
            <div class="col-md-4 mb-4" v-for="item in items" :key="item.id">
                <div class="card h-100 shadow-lg border-0 rounded-lg">
                    <img :src="getItemImage(item)" class="card-img-top" alt="Item image" />
                    <div class="card-body">
                        <h5 class="card-title text-lg font-medium">{{ item.name }}</h5>
                        <p class="card-text text-sm text-gray-600">{{ item.description }}</p>
                        <p class="card-text font-semibold">Cost: <span class="text-yellow-500">{{ item.cost }}
                                Gold</span></p>
                        <button class="btn btn-primary w-full py-2" @click="purchaseItem(item)">Purchase</button>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="message" class="alert alert-info mt-3 fixed-top w-100 text-center" :class="{ 'fade-out': fadeOut }"
            style="top: 50%; transform: translateY(-50%); z-index: 1050;">
            {{ message }}
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: 'ItemShop',
    data() {
        return {
            items: [],
            message: '',
            gold: 0,
            fadeOut: false,
        };
    },
    mounted() {
        this.fetchItems();
        this.fetchUserProfile();
    },
    methods: {
        async fetchItems() {
            try {
                const response = await axios.get('http://localhost:5000/api/items', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                this.items = response.data;
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        },
        async fetchUserProfile() {
            try {
                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                const profile = response.data;
                this.gold = profile.gold || 0;
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        },
        getItemImage(item) {
            return item.image_path || '../img/items/default.png';
        },
        async purchaseItem(item) {
            if (this.gold < item.cost) {
                this.showMessage('Not enough gold to purchase this item.');
                return;
            }

            try {
                // First, purchase the item
                const response = await axios.post('http://localhost:5000/api/useritems/purchase', {
                    item_id: item.id,
                    quantity: 1
                }, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });

                // Show message after purchase success
                this.showMessage(response.data.message || 'Item purchased successfully!');

                // Fetch the updated user profile (gold, items, etc.)
                this.fetchUserProfile();

            } catch (error) {
                console.error('Error purchasing or activating item:', error);
                this.showMessage('Error purchasing or activating item.');
            }
        },
        showMessage(msg) {
            this.message = msg;
            this.fadeOut = false; // Reset the fadeOut
            setTimeout(() => {
                this.fadeOut = true; // Trigger fade-out after the message is displayed
                setTimeout(() => {
                    this.message = ''; // Clear message after the fade-out
                }, 1000); // Match the duration of the fade-out
            }, 100); // Allow the message to appear before the fade-out starts
        }
    }
};
</script>

<style scoped>
.card-img-top {
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
}

.card-body {
    padding: 16px;
}

.card-title {
    font-size: 1.125rem;
    color: #333;
}

.card-text {
    font-size: 0.875rem;
    color: #666;
}

.btn {
    font-size: 0.875rem;
    padding: 10px 0;
    background-color: #007bff;
    border: none;
    border-radius: 4px;
    color: white;
    transition: background-color 0.3s;
}

.btn:hover {
    background-color: #0056b3;
}

.alert {
    font-size: 0.875rem;
    padding: 10px;
    background-color: #17a2b8;
    color: white;
    border-radius: 4px;
    transition: opacity 3s ease;
}

.fade-out {
    opacity: 0;
}

.container {
    max-width: 1200px;
}

.col-md-4 {
    flex: 1 0 30%;
}

@media (max-width: 768px) {
    .col-md-4 {
        flex: 1 0 45%;
    }
}

@media (max-width: 576px) {
    .col-md-4 {
        flex: 1 0 100%;
    }
}
</style>
