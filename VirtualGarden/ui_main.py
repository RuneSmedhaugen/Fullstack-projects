from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget, QGridLayout
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QPixmap
from plant import Plant
from SeedShopUI import SeedShop
from garden import GardenWidget
from DirtPatch import DirtPatch
import random
from Scoreboard import Scoreboard

class GardenUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Virtual Garden")
        self.setFixedSize(800, 600)
        self.setStyleSheet("background-color: #87CEEB;")
        self.scoreboard = Scoreboard()

        # Inventory data
        self.plant_inventory = {}
        self.seed_inventory = {}
        self.selected_seed = None

        # Dirt Patches Grid (6 static patches using DirtPatch widget)
        self.dirt_grid = QGridLayout()
        self.dirt_patches = []
        self.max_patches = 6
        for i in range(self.max_patches):
            patch = DirtPatch()
            patch.state = "empty"   # "empty", "weed", or "plant"
            patch.plant = None
            # Capture index for click events
            patch.mousePressEvent = lambda event, idx=i: self.dirt_patch_clicked(idx)
            self.dirt_patches.append(patch)
            row = i // 3
            col = i % 3
            self.dirt_grid.addWidget(patch, row, col)

        # Harvested Garden widget
        self.harvested_garden = GardenWidget()

        # Top UI: Title and Currency
        self.title = QLabel("🌱 Virtual Garden")
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title.setStyleSheet("font-size: 24px; font-weight: bold; color: white;")
        self.currency = 20
        self.currency_label = QLabel(f"💰 Currency: ${self.currency}")
        self.currency_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.currency_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")

        # Buttons
        self.add_plant_button = QPushButton("Open Shop")
        self.add_plant_button.setStyleSheet("font-size: 16px; padding: 10px; border-radius: 10px; background-color: #FFD700; color: black;")
        self.add_plant_button.clicked.connect(self.open_seed_shop)
        self.harvest_button = QPushButton("Harvest Plants")
        self.harvest_button.setStyleSheet("font-size: 16px; padding: 10px; border-radius: 10px; background-color: #32CD32; color: white;")
        self.harvest_button.clicked.connect(self.harvest_plants)

        # Seed Inventory List
        self.seed_inventory_label = QLabel("Seed Inventory:")
        self.seed_inventory_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")
        self.seed_list = QListWidget()
        self.seed_list.setStyleSheet("background-color: white; border: 2px solid #8B4513;")
        self.seed_list.setMaximumHeight(150)
        self.seed_list.itemClicked.connect(self.select_seed)

        # Layouts
        top_bar = QHBoxLayout()
        top_bar.addWidget(self.title)
        top_bar.addWidget(self.currency_label)

        bottom_bar = QHBoxLayout()
        bottom_bar.addWidget(self.add_plant_button)
        bottom_bar.addWidget(self.harvest_button)

        left_layout = QVBoxLayout()
        left_layout.addLayout(self.dirt_grid)

        right_layout = QVBoxLayout()
        right_layout.addWidget(self.seed_inventory_label)
        right_layout.addWidget(self.seed_list)
        harvested_label = QLabel("Harvested plants:")
        harvested_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")
        right_layout.addWidget(harvested_label)
        right_layout.addWidget(self.harvested_garden)
        right_layout.addWidget(self.scoreboard)

        center_layout = QHBoxLayout()
        center_layout.addLayout(left_layout)
        center_layout.addLayout(right_layout)

        main_layout = QVBoxLayout()
        main_layout.addLayout(top_bar)
        main_layout.addLayout(center_layout)
        main_layout.addLayout(bottom_bar)
        self.setLayout(main_layout)

        # Timer for random weeds
        self.weed_timer = QTimer(self)
        self.weed_timer.timeout.connect(self.randomly_place_weeds)
        self.weed_timer.start(10000)  # Every 10 seconds

    def update_currency_display(self):
        self.currency_label.setText(f"💰 Currency: ${self.currency}")

    def update_seed_inventory(self, seed_name):
        if seed_name in self.seed_inventory:
            self.seed_inventory[seed_name] += 1
        else:
            self.seed_inventory[seed_name] = 1
        self.refresh_seed_list()

    def refresh_seed_list(self):
        self.seed_list.clear()
        for seed, quantity in self.seed_inventory.items():
            self.seed_list.addItem(f"{seed} x{quantity}")

    def select_seed(self, item):
        seed_text = item.text()
        seed_name, _ = seed_text.rsplit(" x", 1)
        self.selected_seed = seed_name
        item.setSelected(True)
        print(f"Selected seed: {self.selected_seed}")

    def dirt_patch_clicked(self, index):
        patch = self.dirt_patches[index]
    
        # If the patch has a weed, remove it
        if patch.state == "weed":
            patch.state = "empty"
            patch.clear_overlay()
            self.scoreboard.update_stat("Weeds Removed", 1)
            print(f"Removed weed from patch {index}")
            return

        # If patch is empty and a seed is selected, check seed inventory
        if patch.state == "empty" and self.selected_seed is not None:
            if self.selected_seed not in self.seed_inventory or self.seed_inventory[self.selected_seed] <= 0:
                print(f"Not enough {self.selected_seed} seeds to plant!")
                return

            # Plant the seed
            plant = Plant(self.selected_seed)
            patch.state = "plant"
            patch.plant = plant
            patch.set_overlay(plant.image_path)

            # Remove one seed from inventory
            self.seed_inventory[self.selected_seed] -= 1
            if self.seed_inventory[self.selected_seed] <= 0:
                del self.seed_inventory[self.selected_seed]
            self.refresh_seed_list()

            print(f"Planted {self.selected_seed} in patch {index}")
            self.scoreboard.update_stat("Plants Planted", 1)

            plant.grown.connect(lambda: patch.set_overlay(plant.image_path))
        else:
            print(f"Patch {index} is not available for planting.")

    def randomly_place_weeds(self):
        for i, patch in enumerate(self.dirt_patches):
            if patch.state == "empty":
                if random.random() < 0.2:  # 20% chance
                    patch.state = "weed"
                    weed_image = random.choice(["assets/images/weed1.png", "assets/images/weed2.png"])
                    patch.set_overlay(weed_image)
                    print(f"Weed appeared in patch {i}")

    def harvest_plants(self):
        for i, patch in enumerate(self.dirt_patches):
            if patch.state == "plant" and patch.plant.stage >= 2:
                plant = patch.plant
                patch.state = "empty"
                patch.plant = None
                patch.clear_overlay()
                harvested_name = plant.seed_name.replace(" Seed", "")
                if harvested_name in self.plant_inventory:
                    self.plant_inventory[harvested_name] += 1
                else:
                    self.plant_inventory[harvested_name] = 1
                print(f"Harvested {harvested_name} from patch {i}")
        if hasattr(self, "shop"):
            self.shop.update_sell_list()
        self.harvested_garden.update_plants(self.plant_inventory)

    def open_seed_shop(self):
        self.shop = SeedShop(self)
        self.shop.exec()

    def buy_seed(self, seed_name, price):
        if self.currency >= price:
            self.currency -= price
            self.update_currency_display()
            self.update_seed_inventory(seed_name)
            self.scoreboard.update_stat("Money Spent", price)
            print(f"Bought {seed_name} for ${price}!")
        else:
            print("Not enough currency!")

    def sell_plant(self, plant_name, quantity, price):
        if plant_name in self.plant_inventory:
            if self.plant_inventory[plant_name] >= quantity:
                self.plant_inventory[plant_name] -= quantity
                if self.plant_inventory[plant_name] == 0:
                    del self.plant_inventory[plant_name]  # Remove plant if quantity is zero

                # Update currency and scoreboard
                self.currency += price * quantity
                self.update_currency_display()
                self.scoreboard.update_stat("Money Earned", price * quantity)
                self.scoreboard.update_stat("Plants Sold", {plant_name: quantity})

                print(f"Sold {quantity} {plant_name}(s) for ${price * quantity}!")
            else:
                print(f"Not enough {plant_name} to sell!")
