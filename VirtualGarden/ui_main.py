from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget, QGridLayout, QStackedLayout
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QPixmap, QGuiApplication
from plant import Plant
from SeedShopUI import SeedShop
from garden import GardenWidget
from DirtPatch import DirtPatch
import random
from Scoreboard import Scoreboard
from PlayerGarden import PlayerGarden


class GardenUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Virtual Garden")
        self.currency = 20
        self.setStyleSheet("background-color: #87CEEB;")

        # Main harvested-garden widget & signal
        self.harvested_garden = GardenWidget()
        self.harvested_garden.plant_selected.connect(self.place_plant_in_player_garden)

        # Player Garden widget & signal
        self.player_garden = PlayerGarden()
        self.player_garden.plant_placed.connect(self.decrement_inventory)
        self.player_garden.plant_returned.connect(self.return_to_inventory)

        # Window sizing
        screen = QGuiApplication.primaryScreen().geometry()
        self.setFixedSize(int(screen.width() * 0.9), int(screen.height() * 0.9))

        # Inventories
        self.plant_inventory = {}
        self.seed_inventory = {}
        self.selected_seed = None

        # Scoreboard
        self.scoreboard = Scoreboard()

        # Build UI sections
        self._init_dirt_patches()
        self._init_top_bar()
        self._init_inventory_ui()
        self._init_garden_area()
        self._build_main_layout()

        # Weeds timer
        self.weed_timer = QTimer(self)
        self.weed_timer.timeout.connect(self.randomly_place_weeds)
        self.weed_timer.start(10000)

    def _init_dirt_patches(self):
        self.dirt_grid = QGridLayout()
        self.dirt_patches = []
        for i in range(6):
            patch = DirtPatch()
            patch.state = "empty"
            patch.plant = None
            patch.mousePressEvent = lambda event, idx=i: self.dirt_patch_clicked(idx)
            self.dirt_patches.append(patch)
            self.dirt_grid.addWidget(patch, i // 3, i % 3)

    def _init_top_bar(self):
        self.title = QLabel("🌱 Virtual Garden")
        # Use AlignmentFlag for PyQt6
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title.setStyleSheet("font-size: 24px; font-weight: bold; color: white;")
        self.currency_label = QLabel(f"💰 Currency: ${self.currency}")
        self.currency_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.currency_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")
        self.add_plant_button = QPushButton("Open Shop")
        self.add_plant_button.setStyleSheet(
            "font-size: 16px; padding: 10px; border-radius: 10px; background-color: #FFD700; color: black;"
        )
        self.add_plant_button.clicked.connect(self.open_seed_shop)
        self.top_bar = QHBoxLayout()
        self.top_bar.addWidget(self.title)
        self.top_bar.addWidget(self.currency_label)
        self.top_bar.addWidget(self.add_plant_button)

    def _init_inventory_ui(self):
        self.seed_inventory_label = QLabel("Seed Inventory:")
        self.seed_inventory_label.setStyleSheet(
            "font-size: 18px; font-weight: bold; color: white;"
        )
        self.seed_list = QListWidget()
        self.seed_list.setMaximumHeight(150)
        self.seed_list.itemClicked.connect(self.select_seed)

        self.harvest_button = QPushButton("Harvest Plants")
        self.harvest_button.setStyleSheet(
            "font-size: 16px; padding: 10px; border-radius: 10px; background-color: #32CD32; color: white;"
        )
        self.harvest_button.clicked.connect(self.harvest_plants)

    def _init_garden_area(self):
        self.growing_area = QWidget()
        ga_layout = QVBoxLayout()
        ga_layout.addLayout(self.dirt_grid)
        ga_layout.addWidget(self.harvest_button)
        self.growing_area.setLayout(ga_layout)

        self.stacked_layout = QStackedLayout()
        self.stacked_layout.addWidget(self.growing_area)
        self.stacked_layout.addWidget(self.player_garden)

        self.switch_button = QPushButton("Switch to Player Garden")
        self.switch_button.setStyleSheet(
            "font-size: 16px; padding: 10px; background-color: #4682B4; color: white;"
        )
        self.switch_button.clicked.connect(self.switch_garden)

    def _build_main_layout(self):
        right_layout = QVBoxLayout()
        right_layout.addWidget(self.seed_inventory_label)
        right_layout.addWidget(self.seed_list)
        harvested_label = QLabel("Harvested plants:")
        harvested_label.setStyleSheet(
            "font-size: 18px; font-weight: bold; color: white;"
        )
        right_layout.addWidget(harvested_label)
        right_layout.addWidget(self.harvested_garden)
        right_layout.addWidget(self.scoreboard)

        center_layout = QHBoxLayout()
        center_layout.addLayout(self.stacked_layout)
        center_layout.addLayout(right_layout)

        main_layout = QVBoxLayout()
        main_layout.addLayout(self.top_bar)
        main_layout.addLayout(center_layout)
        main_layout.addWidget(self.switch_button)
        self.setLayout(main_layout)

    def update_currency_display(self):
        self.currency_label.setText(f"💰 Currency: ${self.currency}")

    def update_seed_inventory(self, seed_name):
        self.seed_inventory[seed_name] = self.seed_inventory.get(seed_name, 0) + 1
        self.refresh_seed_list()

    def refresh_seed_list(self):
        self.seed_list.clear()
        for seed, qty in self.seed_inventory.items():
            self.seed_list.addItem(f"{seed} x{qty}")

    def select_seed(self, item):
        seed_name, _ = item.text().rsplit(" x", 1)
        self.selected_seed = seed_name
        item.setSelected(True)
        print(f"Selected seed: {seed_name}")

    def dirt_patch_clicked(self, index):
        patch = self.dirt_patches[index]
        if patch.state == "weed":
            patch.state = "empty"
            patch.clear_overlay()
            self.scoreboard.update_stat("Weeds Removed", 1)
            return

        if patch.state == "empty" and self.selected_seed:
            if self.seed_inventory.get(self.selected_seed, 0) <= 0:
                print(f"Not enough {self.selected_seed} seeds!")
                return

            plant = Plant(self.selected_seed)
            patch.state = "plant"
            patch.plant = plant
            patch.set_overlay(plant.image_path)

            self.seed_inventory[self.selected_seed] -= 1
            if self.seed_inventory[self.selected_seed] == 0:
                del self.seed_inventory[self.selected_seed]
            self.refresh_seed_list()

            self.scoreboard.update_stat("Plants Planted", 1)
            plant.grown.connect(lambda: patch.set_overlay(plant.image_path))
        else:
            print(f"Patch {index} not available.")

    def randomly_place_weeds(self):
        for i, patch in enumerate(self.dirt_patches):
            if patch.state == "empty" and random.random() < 0.2:
                patch.state = "weed"
                weed_img = random.choice(["assets/images/weed1.png", "assets/images/weed2.png"])
                patch.set_overlay(weed_img)

    def harvest_plants(self):
        for i, patch in enumerate(self.dirt_patches):
            if patch.state == "plant" and patch.plant.stage >= 2:
                harvested = patch.plant.seed_name.replace(" Seed", "")
                patch.state = "empty"
                patch.plant = None
                patch.clear_overlay()
                self.plant_inventory[harvested] = self.plant_inventory.get(harvested, 0) + 1
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

    def sell_plant(self, plant_name, quantity, price):
        if self.plant_inventory.get(plant_name, 0) >= quantity:
            self.plant_inventory[plant_name] -= quantity
            if self.plant_inventory[plant_name] == 0:
                del self.plant_inventory[plant_name]
            self.currency += price * quantity
            self.update_currency_display()
            self.scoreboard.update_stat("Money Earned", price * quantity)
            self.scoreboard.update_stat("Plants Sold", {plant_name: quantity})

    def switch_garden(self):
        idx = self.stacked_layout.currentIndex()
        self.stacked_layout.setCurrentIndex(1 - idx)
        self.switch_button.setText(
            "Switch to Growing Area" if idx == 1 else "Switch to Player Garden"
        )

    def place_plant_in_player_garden(self, plant_name):
        print(f"place_plant_in_player_garden called with {plant_name}")
        if self.plant_inventory.get(plant_name, 0) > 0:
            # Simplify: always use the stage-3 (fully grown) image directly
            stage3_images = {
                "Sunflower": "assets/images/spire3.png",
                "Rose":      "assets/images/spire3.png",
                "Tulip":     "assets/images/spire3.png"
            }
            # strip ' Seed' suffix if present
            key = plant_name.replace(" Seed", "")
            image_path = stage3_images.get(key, "assets/images/spire3.png")

            self.player_garden.select_plant(plant_name, image_path)
            self.plant_inventory[plant_name] -= 1
            if self.plant_inventory[plant_name] == 0:
                del self.plant_inventory[plant_name]
            self.harvested_garden.update_plants(self.plant_inventory)


    def decrement_inventory(self, plant_name):
        if self.plant_inventory.get(plant_name, 0) > 0:
            self.plant_inventory[plant_name] -= 1
            if self.plant_inventory[plant_name] == 0:
                del self.plant_inventory[plant_name]
            print(f"Decremented inventory for {plant_name}. Remaining: {self.plant_inventory.get(plant_name, 0)}")
            self.harvested_garden.update_plants(self.plant_inventory)

    def return_to_inventory(self, plant_name):
        """Handle a plant returned from PlayerGarden"""
        self.plant_inventory[plant_name] = self.plant_inventory.get(plant_name, 0) + 1
        self.harvested_garden.update_plants(self.plant_inventory)
        print(f"Returned {plant_name} to inventory. Now {self.plant_inventory[plant_name]}")
