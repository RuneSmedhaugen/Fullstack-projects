<template>
    <div class="container p-4">
        <h2 class="mb-4 text-center">Boss Battle</h2>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="text-center">
            <p>Loading boss data...</p>
        </div>

        <div v-else>
            <!-- Flex container for boss stats, player area, and user stats -->
            <div class="d-flex align-items-center justify-content-between stats-flex mb-4">
                <!-- Boss Stats Card on the Left -->
                <div class="boss-stats">
                    <div class="card p-3">
                        <h4>Boss Stats</h4>
                        <p><strong>Level:</strong> {{ boss.level }}</p>
                        <p><strong>Strength:</strong> {{ boss.strength }}</p>
                        <div>
                            <label><strong>Health:</strong> {{ boss.current_hp }} / {{ boss.max_hp }}</label>
                            <div class="progress">
                                <div class="progress-bar bg-danger" role="progressbar"
                                    :style="{ width: bossHpPercent + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Shared Player Area with Background and Images in the Center -->
                <div class="shared-container">
                    <div class="shared-background p-4">
                        <!-- Boss Image Wrapper -->
                        <div class="boss-image-wrapper" v-if="boss">
                            <img v-if="getBossImage()" :src="getBossImage()" alt="Boss" class="img-fluid boss-image"
                                :class="{ 'animate-damage': bossDamaged, 'animate-attack': bossAttacking }" />
                            <div v-if="floatingBossDamage" class="floating-damage boss-damage">
                                -{{ floatingBossDamage }}
                            </div>
                        </div>
                        <!-- User Avatar Image Wrapper -->
                        <div class="avatar-image-wrapper" v-if="user">
                            <img src="@/img/avatar.png" alt="User Avatar" class="img-fluid avatar-image" />
                            <div v-if="floatingUserDamage" class="floating-damage user-damage">
                                -{{ floatingUserDamage }}
                            </div>
                        </div>
                    </div>
                </div>


                <!-- User Stats Card on the Right -->
                <div class="user-stats">
                    <div class="card p-3">
                        <h4>Your Stats</h4>
                        <p><strong>Level:</strong> {{ user.level }}</p>
                        <p><strong>Strength:</strong> {{ user.strength }}</p>
                        <p><strong>Crit :</strong> {{ user.crit_bonus || 0 }}%</p>
                        <p><strong>Lifesteal :</strong> {{ user.lifesteal || 0 }}%</p>
                        <div>
                            <label><strong>Health:</strong> {{ user.current_hp }} / {{ user.max_hp }}</label>
                            <div class="progress">
                                <div class="progress-bar bg-success" role="progressbar"
                                    :style="{ width: userHpPercent + '%' }"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Buttons -->
            <div class="mt-4 text-center">
                <button v-if="!gameOver" class="btn btn-primary mr-2" @click="fightTurn" :disabled="fightDisabled">
                    Fight
                </button>
                <button v-if="gameOver" class="btn btn-warning mr-2" @click="restartBattle">
                    Restart Battle
                </button>
                <!-- Inventory button opens the modal -->
                <button class="btn btn-secondary" @click="toggleInventory">
                    <img src="@/img/sekk.png" alt="Inventory" class="inventory-icon" />
                </button>
            </div>

            <!-- Message -->
            <div class="mt-3 text-center" v-if="message">
                <div class="alert alert-info">{{ message }}</div>
            </div>

            <!-- Battle Log -->
            <div class="mt-3" v-if="displayedBattleLog.length">
                <h5>Battle Log:</h5>
                <div class="border p-2" style="max-height: 200px; overflow-y: auto;">
                    <p v-for="(entry, index) in displayedBattleLog" :key="index">{{ entry }}</p>
                </div>
            </div>
        </div>

        <!-- Inventory Modal -->
        <div v-if="showInventoryModal" class="modal fade show" tabindex="-1" role="dialog" style="display: block;">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Your Inventory</h5>
                        <button type="button" class="close" @click="toggleInventory">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="inventoryItems.length > 0">
                            <div v-for="item in inventoryItems" :key="item.user_item_id"
                                class="inventory-item mb-3 p-2 border rounded">
                                <div class="d-flex align-items-center">
                                    <img :src="getItemImage(item)" alt="Item image" class="img-thumbnail"
                                        style="width: 60px; height: 60px;" />
                                    <div class="ml-3">
                                        <h5>{{ item.name }}</h5>
                                        <p class="mb-0 text-sm">{{ item.description }}</p>
                                        <p class="mb-0">Quantity: {{ item.quantity }}</p>
                                        <p class="mb-0">Uses Left: {{ item.battles_remaining }}</p>
                                    </div>
                                </div>
                                <button class="btn btn-success btn-sm mt-2" @click="useInventoryItem(item)">
                                    Use
                                </button>
                            </div>
                        </div>
                        <div v-else>
                            <p>You have no items in your inventory.</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="toggleInventory">Close</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
export default {
    name: 'BossBattle',
    data() {
        return {
            boss: {
                level: 1,
                current_hp: 100,
                max_hp: 100,
                strength: 10,
            },
            user: null,
            inventoryItems: [],
            message: '',
            fightDisabled: false,
            showInventoryModal: false,
            bossDamaged: false,
            bossAttacking: false,
            gameOver: false,
            isLoading: true,
            battleLog: [],
            displayedBattleLog: [],
            floatingBossDamage: null,
            floatingUserDamage: null,
        };
    },
    computed: {
        bossHpPercent() {
            return this.boss.max_hp > 0 ? (this.boss.current_hp / this.boss.max_hp) * 100 : 0;
        },
        userHpPercent() {
            return this.user && this.user.max_hp > 0 ? (this.user.current_hp / this.user.max_hp) * 100 : 0;
        },
    },
    mounted() {
        this.fetchBoss();
        this.fetchUser();
    },
    methods: {
        async fetchUser() {
            try {
                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                this.user = response.data;
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        },
        async fetchBoss() {
            try {
                const response = await axios.get('http://localhost:5000/api/bosses', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                const bossData = response.data;
                bossData.max_hp = bossData.max_hp || bossData.current_hp;
                this.boss = bossData;
            } catch (error) {
                console.error('Error fetching boss:', error);
            } finally {
                this.isLoading = false;
            }
        },
        getBossImage() {
            const level = Math.min(this.boss.level, 17);
            return new URL(`../img/bosses/boss${level}.png`, import.meta.url).href;
        },
        getItemImage(item) {
            return item.image_path;
        },
        async fightTurn() {
            this.fightDisabled = true;
            this.message = 'The battle is ongoing...';
            this.battleLog = [];
            this.displayedBattleLog = [];
            const oldBossHP = this.boss.current_hp;
            const oldUserHP = this.user.current_hp;
            try {
                const response = await axios.post(
                    'http://localhost:5000/api/bosses/attack',
                    {},
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );

                this.battleLog = response.data.log || [];

                await this.animateBattleLog();

                this.message = response.data.message;

                
                this.floatingBossDamage = this.user.strength; 
                this.floatingUserDamage = this.boss.strength;   
                
                setTimeout(() => {
                    this.floatingBossDamage = null;
                    this.floatingUserDamage = null;
                }, 1500);

                if (response.data.xpGained !== undefined) {
                    const newXp = this.user.xp + response.data.xpGained;
                    const newLevel = Math.floor(newXp / 100);
                    this.user.xp = newXp;
                    this.user.level = newLevel;
                }
                if (response.data.user) {
                    await this.animateHPChange(oldUserHP, response.data.user.current_hp, (val) => {
                        this.user.current_hp = val;
                    });
                    this.user.current_hp = response.data.user.current_hp;
                }
                if (response.data.boss) {
                    await this.animateHPChange(oldBossHP, response.data.boss.current_hp, (val) => {
                        this.boss.current_hp = val;
                    });
                    this.boss.current_hp = response.data.boss.current_hp;
                }
                if (this.message.includes('defeated')) {
                    this.gameOver = true;
                }
            } catch (error) {
                console.error('Error during fight turn:', error);
                this.message = 'Error during fight.';
            } finally {
                this.fightDisabled = false;
            }
        },
        async animateBattleLog() {
            this.displayedBattleLog = [];
            for (let entry of this.battleLog) {
                this.displayedBattleLog.push(entry);
                await this.sleep(1000);
            }
        },
        animateHPChange(oldHP, newHP, setter) {
            return new Promise((resolve) => {
                const steps = 20;
                const duration = 1000;
                const delay = duration / steps;
                const diff = oldHP - newHP;
                let i = 1;
                const interval = setInterval(() => {
                    setter(Math.round(oldHP - (diff * i / steps)));
                    i++;
                    if (i > steps) {
                        clearInterval(interval);
                        resolve();
                    }
                }, delay);
            });
        },
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        toggleInventory() {
            this.showInventoryModal = !this.showInventoryModal;
            if (this.showInventoryModal) {
                this.fetchInventoryItems();
            }
        },
        async fetchInventoryItems() {
            try {
                const response = await axios.get('http://localhost:5000/api/useritems', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
                });
                this.inventoryItems = response.data;
            } catch (error) {
                console.error('Error fetching inventory items:', error);
            }
        },
        async useInventoryItem(item) {
            try {
                const response = await axios.post(
                    'http://localhost:5000/api/useritems/use',
                    { item_id: item.item_id },
                    { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
                );
                this.showMessage(response.data.message);
                this.fetchUser();
                this.fetchInventoryItems();
                this.fetchBoss();
            } catch (error) {
                console.error('Error using inventory item:', error);
                this.showMessage('Error using item.');
            }
        },
        showMessage(msg) {
            this.message = msg;
            setTimeout(() => {
                this.message = '';
            }, 3000);
        },
        restartBattle() {
            this.fetchBoss();
            this.fetchUser().then(() => {
                this.user.current_hp = this.user.max_hp;
                this.boss.current_hp = this.boss.max_hp;
                this.message = '';
                this.gameOver = false;
                this.battleLog = [];
                this.displayedBattleLog = [];
            });
        },
    },
};
</script>

<style scoped>
.boss-image {
    max-height: 130px;
    transition: transform 0.5s;
}

.avatar-image {
    max-height: 130px;
    border-radius: 50%;
}


.boss-image-wrapper {
    position: absolute;
    bottom: 20%;
    left: 35%;
}

.avatar-image-wrapper {
    position: absolute;
    bottom: 23%;
    right: 35%;
}

.shared-background {
    position: relative;
    background-image: url('../img/rune_bakgrunn.png');
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    border-radius: 8px;
    aspect-ratio: 16 / 9;
    height: 500px;
}


.stats-flex {
    width: 100%;
}

.shared-container {
    flex: 1;
    margin: 0 20px;
}

.inventory-icon {
    width: 75px;
    height: 75px;
    margin-right: 5px;
}

.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>