<template>
    <div class="container p-4">
        <h2 class="mb-4 text-center">Boss Battle</h2>

        <!-- Loading Indicator -->
        <div v-if="isLoading" class="text-center">
            <p>Loading boss data...</p>
        </div>

        <!-- Main Content -->
        <div v-else>
            <div class="row">
                <!-- Boss Section -->
                <div class="col-md-6 text-center" v-if="boss">
                    <h3>Boss (Level {{ boss.level }})</h3>
                    <img v-if="getBossImage()" :src="getBossImage()" alt="Boss" class="img-fluid boss-image mb-3"
                        :class="{ 'animate-damage': bossDamaged, 'animate-attack': bossAttacking }">
                    <div>
                        <label>Boss HP: {{ boss.current_hp }} / {{ boss.max_hp }}</label>
                        <div class="progress">
                            <div class="progress-bar bg-danger" role="progressbar"
                                :style="{ width: bossHpPercent + '%' }"></div>
                        </div>
                    </div>
                    <p class="mt-2">Strength: {{ boss.strength }}</p>
                </div>

                <!-- User Section -->
                <div class="col-md-6 text-center" v-if="user">
                    <h3>Your Stats</h3>
                    <img src="@/img/avatar.png" alt="User Avatar" class="img-fluid avatar-image mb-3">
                    <h5>Level: {{ user.level }}</h5>
                    <div>
                        <label>Your HP: {{ user.current_hp }} / {{ user.max_hp }}</label>
                        <div class="progress">
                            <div class="progress-bar bg-success" role="progressbar"
                                :style="{ width: userHpPercent + '%' }"></div>
                        </div>
                    </div>
                    <p class="mt-2">Strength: {{ user.strength }}</p>
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
                <img src="@/img/sekk.png" alt="Inventory" class="inventory-button" @click="toggleInventory">
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
        <div class="modal fade show" tabindex="-1" role="dialog" style="display: block;" v-if="showInventoryModal">
            <div class="modal-dialog" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Inventory</h5>
                        <button type="button" class="close" @click="toggleInventory">
                            <span>&times;</span>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="inventory-overlay">
                            <img src="@/img/inventory2.png" alt="Inventory Grid" />
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
            user: null, // Start with null, will be populated by fetchUser
            message: '',
            fightDisabled: false,
            showInventoryModal: false,
            bossDamaged: false,
            bossAttacking: false,
            gameOver: false,
            isLoading: true,
            battleLog: [],
            displayedBattleLog: [],
        };
    },
    computed: {
        // Compute the boss's HP percentage based on current and max HP
        bossHpPercent() {
            return this.boss.max_hp > 0 ? (this.boss.current_hp / this.boss.max_hp) * 100 : 0;
        },
        // Compute the user's HP percentage based on current and max HP
        userHpPercent() {
            return this.user && this.user.max_hp > 0 ? (this.user.current_hp / this.user.max_hp) * 100 : 0;
        }
    },
    mounted() {
        this.fetchBoss();
        this.fetchUser();
    },
    methods: {

        async fetchUser() {
            try {
                const response = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                this.user = response.data; // Dynamically update user data
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        },
        // Fetch the current boss data from the server
        async fetchBoss() {
            try {
                const response = await axios.get('http://localhost:5000/api/bosses', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const bossData = response.data;
                // Ensure bossData has both current_hp and max_hp; if max_hp isn't returned, use current_hp as fallback
                bossData.max_hp = bossData.max_hp || bossData.current_hp;
                this.boss = bossData;
            } catch (error) {
                console.error('Error fetching boss:', error);
            } finally {
                this.isLoading = false;
            }
        },
        // Return the image URL for the current boss based on level
        getBossImage() {
            const level = Math.min(this.boss.level, 17);
            return new URL(`../img/bosses/boss${level}.png`, import.meta.url).href;
        },
        // Simulate a battle turn: animate HP changes, update XP/level, etc.
        async fightTurn() {
            this.fightDisabled = true;
            this.message = 'The battle is ongoing...';
            this.battleLog = [];
            this.displayedBattleLog = [];

            const oldBossHP = this.boss.current_hp;
            const oldUserHP = this.user.current_hp;

            try {
                const response = await axios.post('http://localhost:5000/api/bosses/attack', {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                // Handle battle log animation
                this.battleLog = response.data.log || [];
                await this.animateBattleLog();

                this.message = response.data.message;

                // Update user stats (XP, level, current_hp, etc.)
                if (response.data.xpGained !== undefined) {
                    const newXp = this.user.xp + response.data.xpGained;
                    const newLevel = Math.floor(newXp / 100);
                    this.user.xp = newXp;
                    this.user.level = newLevel;
                }

                // Update user's current HP after attack
                if (response.data.user) {
                    await this.animateHPChange(oldUserHP, response.data.user.current_hp, (val) => {
                        this.user.current_hp = val;
                    });
                    this.user.current_hp = response.data.user.current_hp;
                }

                // Handle boss HP changes (same logic)
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
        // Animate the battle log by sequentially displaying log entries
        async animateBattleLog() {
            this.displayedBattleLog = [];
            for (let entry of this.battleLog) {
                this.displayedBattleLog.push(entry);
                await this.sleep(1000);
            }
        },
        // Animate the HP change gradually from oldHP to newHP
        animateHPChange(oldHP, newHP, setter) {
            return new Promise((resolve) => {
                const steps = 20;
                const duration = 1000; // total duration in ms
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
        // Helper function to wait for a specified time (in ms)
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        // Toggle the inventory modal's visibility
        toggleInventory() {
            this.showInventoryModal = !this.showInventoryModal;
        },
        // Restart the battle by refetching the boss and resetting user current_hp to max_hp
        restartBattle() {
            this.fetchBoss();

            this.fetchUser().then(() => {
                this.user.current_hp = this.user.max_hp;
                this.message = '';
                this.gameOver = false;
                this.battleLog = [];
                this.displayedBattleLog = [];
            });

        }
    }
};
</script>

<style scoped>
.boss-image {
    max-height: 300px;
    transition: transform 0.5s;
}

.avatar-image {
    max-height: 150px;
    border-radius: 50%;
}

.inventory-button {
    width: 50px;
    height: 50px;
    cursor: pointer;
    position: fixed;
    bottom: 20px;
    right: 20px;
}

.inventory-overlay {
    background: rgba(0, 0, 0, 0.7);
}
</style>
