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
                        <label>Boss HP: {{ boss.hp }} / {{ boss.maxHp }}</label>
                        <div class="progress">
                            <div class="progress-bar bg-danger" role="progressbar"
                                :style="{ width: bossHpPercent + '%' }"></div>
                        </div>
                    </div>
                    <p class="mt-2">Strength: {{ boss.strength }}</p>
                </div>

                <!-- User Section -->
                <div class="col-md-6 text-center">
                    <h3>Your Stats</h3>
                    <img src="@/img/avatar.png" alt="User Avatar" class="img-fluid avatar-image mb-3">
                    <h5>Level: {{ user.level }}</h5>
                    <div>
                        <label>Your HP: {{ user.hp }} / {{ user.maxHp }}</label>
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
                hp: 100,
                maxHp: 100,
                strength: 10,
            },
            user: {
                hp: 100,
                maxHp: 100,
                strength: 20,
            },
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
        bossHpPercent() {
            return this.boss.maxHp > 0 ? (this.boss.hp / this.boss.maxHp) * 100 : 0;
        },
        userHpPercent() {
            return this.user.maxHp > 0 ? (this.user.hp / this.user.maxHp) * 100 : 0;
        }
    },
    mounted() {
        this.fetchBoss();
    },
    methods: {
        isMissingSlot(slot) {
            return slot === 1 || slot === 2;
        },

        async fetchBoss() {
            try {
                const response = await axios.get('http://localhost:5000/api/bosses', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                const bossData = response.data;
                bossData.maxHp = bossData.hp;
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
        async fightTurn() {
            this.fightDisabled = true;
            this.message = 'The battle is ongoing...';
            this.battleLog = [];
            this.displayedBattleLog = [];

            // Store the current HP values to animate from
            const oldBossHP = this.boss.hp;
            const oldUserHP = this.user.hp;

            try {
                const response = await axios.post('http://localhost:5000/api/bosses/attack', {}, {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });

                // Store the log entries from the backend
                this.battleLog = response.data.log || [];
                await this.animateBattleLog();

                this.message = response.data.message;

                // Update the user's XP after battle
                let newXp = this.user.xp + response.data.xpGained;  // assuming `xpGained` is returned
                let newLevel = Math.floor(newXp / 100); // calculate new level based on new XP

                // Update the user data with new XP and level
                this.user = { ...this.user, xp: newXp, level: newLevel };

                // Animate HP changes gradually
                if (response.data.boss) {
                    await this.animateHPChange(oldBossHP, response.data.boss.hp, (val) => this.boss.hp = val);
                    this.boss = response.data.boss;
                }
                if (response.data.user) {
                    await this.animateHPChange(oldUserHP, response.data.user.hp, (val) => this.user.hp = val);
                    this.user = response.data.user;
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
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        toggleInventory() {
            this.showInventoryModal = !this.showInventoryModal;
        },
        restartBattle() {
            this.fetchBoss();
            this.user = { hp: 100, maxHp: 100, strength: 20 };
            this.message = '';
            this.gameOver = false;
            this.battleLog = [];
            this.displayedBattleLog = [];
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
    max-height: 50px;
    max-width: 50px;
    cursor: pointer;
    display: inline-block;
    object-fit: contain;
}


.animate-damage {
    transform: translateX(-10px);
}

.animate-attack {
    transform: translateX(10px);
}

.modal {
    background: rgba(0, 0, 0, 0.5);
}


.modal-body {
  padding: 1rem;
  display: flex;
  height: 350px;
}

.inventory-overlay img {
  width: 100%;
  height: 100%;
}
</style>
