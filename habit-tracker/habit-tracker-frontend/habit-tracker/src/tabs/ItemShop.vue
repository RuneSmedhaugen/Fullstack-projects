<template>
    <div class="shop-container">
        <h2 class="shop-title">Item Shop</h2>
        <div class="gold-display">
            🪙 Your Gold: <span class="gold-amount">{{ gold }}</span>
        </div>
        <div class="shop-grid">
            <div class="shop-item"
                v-for="item in items" :key="item.id"
                @click="purchaseItem(item)"
                @mouseover="showItemDetails(item, $event)"
                @mouseleave="hideItemDetails"
            >
                <img :src="getItemImage(item)" class="item-img" alt="Item image" />
                <div class="item-info">
                    <h5 class="item-name">{{ item.name }}</h5>
                    <p class="item-cost">💰 {{ item.cost }} Gold</p>
                </div>
            </div>
        </div>
        
        <!-- Hover Modal -->
        <div v-if="hoverItem" class="hover-modal" :style="{ top: modalY + 'px', left: modalX + 'px' }">
            <h4 class="modal-title">{{ hoverItem.name }}</h4>
            <p class="modal-description">{{ hoverItem.description }}</p>
            <p class="modal-cost">💰 Cost: {{ hoverItem.cost }} Gold</p>
        </div>

        <div v-if="message" class="shop-message" :class="{ 'fade-out': fadeOut }">
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
            hoverItem: null,
            modalX: 0,
            modalY: 0,
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
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                this.items = response.data;
            } catch (error) {
                console.error('Error fetching items:', error);
            }
        },
        async fetchUserProfile() {
            try {
                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                this.gold = response.data.gold || 0;
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        },
        getItemImage(item) {
            return item.image_path || '../img/items/default.png';
        },
        async purchaseItem(item) {
            if (this.gold < item.cost) {
                this.showMessage('❌ Not enough gold!');
                return;
            }
            try {
                const response = await axios.post('http://localhost:5000/api/useritems/purchase', {
                    item_id: item.id,
                    quantity: 1
                }, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                this.showMessage('✅ ' + (response.data.message || 'Item purchased!'));
                this.fetchUserProfile();
            } catch (error) {
                console.error('Error purchasing item:', error);
                this.showMessage('⚠️ Purchase failed.');
            }
        },
        showItemDetails(item, event) {
            this.hoverItem = item;
            this.modalX = event.clientX + 10; // Offset so it doesn’t overlap the cursor
            this.modalY = event.clientY + 10;
        },
        hideItemDetails() {
            this.hoverItem = null;
        },
        showMessage(msg) {
            this.message = msg;
            this.fadeOut = false;
            setTimeout(() => {
                this.fadeOut = true;
                setTimeout(() => { this.message = ''; }, 1000);
            }, 100);
        }
    }
};
</script>

<style scoped>
/* Game UI Theme */
.shop-container {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
    padding: 20px;
}

.shop-title {
    font-size: 2rem;
    font-weight: bold;
    color: #FFD700;
    text-shadow: 2px 2px 10px rgba(255, 215, 0, 0.8);
}

.gold-display {
    font-size: 1.2rem;
    margin-bottom: 20px;
    background: rgba(255, 223, 0, 0.2);
    padding: 10px;
    border-radius: 8px;
    display: inline-block;
    font-weight: bold;
}

.gold-amount {
    color: #FFD700;
    font-size: 1.4rem;
}

/* Shop Grid */
.shop-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 20px;
    justify-items: center;
}

/* Item Card */
.shop-item {
    width: 120px;
    background: #222;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
    border: 2px solid transparent;
}

.shop-item:hover {
    transform: scale(1.05);
    box-shadow: 0px 4px 10px rgba(255, 215, 0, 0.7);
    border-color: #FFD700;
}

/* Item Image */
.item-img {
    width: 100%;
    height: 100px;
    object-fit: contain;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.1);
}

/* Item Text */
.item-info {
    margin-top: 8px;
    text-align: center;
}

.item-name {
    font-size: 1rem;
    font-weight: bold;
    color: white;
}

.item-cost {
    font-size: 0.9rem;
    color: #FFD700;
}

/* Hover Modal */
.hover-modal {
    position: fixed;
    background: rgba(0, 0, 0, 0.85);
    color: white;
    padding: 12px;
    border-radius: 8px;
    box-shadow: 0 4px 10px rgba(255, 215, 0, 0.6);
    z-index: 1000;
    width: 180px;
    transition: opacity 0.2s;
}

.modal-title {
    font-size: 1.1rem;
    font-weight: bold;
    margin-bottom: 5px;
    color: #FFD700;
}

.modal-description {
    font-size: 0.9rem;
    margin-bottom: 5px;
}

.modal-cost {
    font-size: 0.9rem;
    font-weight: bold;
}

/* Purchase Message */
.shop-message {
    font-size: 1rem;
    color: white;
    background: rgba(0, 0, 0, 0.8);
    padding: 10px;
    border-radius: 5px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 1000;
    transition: opacity 1s;
}

.fade-out {
    opacity: 0;
}
</style>
