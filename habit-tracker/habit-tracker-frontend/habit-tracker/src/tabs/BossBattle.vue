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
            <img
              v-if="getBossImage()"
              :src="getBossImage()"
              alt="Boss"
              class="img-fluid boss-image mb-3"
              :class="{ 'animate-damage': bossDamaged, 'animate-attack': bossAttacking }"
            />
            <div>
              <label>Boss HP: {{ boss.current_hp }} / {{ boss.max_hp }}</label>
              <div class="progress">
                <div class="progress-bar bg-danger" role="progressbar" :style="{ width: bossHpPercent + '%' }"></div>
              </div>
            </div>
            <p class="mt-2">Strength: {{ boss.strength }}</p>
          </div>
  
          <!-- User Section -->
          <div class="col-md-6 text-center" v-if="user">
            <h3>Your Stats</h3>
            <img src="@/img/avatar.png" alt="User Avatar" class="img-fluid avatar-image mb-3" />
            <h5>Level: {{ user.level }}</h5>
            <div>
              <label>Your HP: {{ user.current_hp }} / {{ user.max_hp }}</label>
              <div class="progress">
                <div class="progress-bar bg-success" role="progressbar" :style="{ width: userHpPercent + '%' }"></div>
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
                <div v-for="item in inventoryItems" :key="item.user_item_id" class="inventory-item mb-3 p-2 border rounded">
                  <div class="d-flex align-items-center">
                    <img :src="getItemImage(item)" alt="Item image" class="img-thumbnail" style="width: 60px; height: 60px;" />
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
    max-height: 300px;
    transition: transform 0.5s;
  }
  .avatar-image {
    max-height: 150px;
    border-radius: 50%;
  }

  .inventory-item {
    background: #f9f9f9;
  }

  .inventory-icon {
  width: 75px;
  height: 75px;
  margin-right: 5px;
}
  </style>
  