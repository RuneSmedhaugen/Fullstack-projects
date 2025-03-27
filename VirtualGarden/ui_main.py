from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget, QGridLayout
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from plant import Plant
from garden import GardenWidget
from SeedShopUI import SeedShop

class GardenUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Virtual Garden")
        self.setFixedSize(800, 600)  # Fixed size for a game-like feel
        self.setStyleSheet("background-color: #87CEEB;")  # Light blue sky background

         # Initialize plant inventory
        self.plant_inventory = {}  # Dictionary to store harvested plants and their quantities
        self.seed_inventory = {}  # Dictionary to store seeds and their quantities
        self.plants = []  # List to store growing plants and their labels       


        # Title
        self.title = QLabel("🌱 Virtual Garden")
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title.setStyleSheet("font-size: 24px; font-weight: bold; color: white;")

        # Currency display
        self.currency = 20
        self.currency_label = QLabel(f"💰 Currency: ${self.currency}")
        self.currency_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.currency_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")

        # Buttons
        self.add_plant_button = QPushButton("Open Seed Shop")
        self.add_plant_button.setStyleSheet("font-size: 16px; padding: 10px; border-radius: 10px; background-color: #FFD700; color: black;")
        self.add_plant_button.clicked.connect(self.open_seed_shop)

        self.harvest_button = QPushButton("Harvest Plants")
        self.harvest_button.setStyleSheet("font-size: 16px; padding: 10px; border-radius: 10px; background-color: #32CD32; color: white;")
        self.harvest_button.clicked.connect(self.harvest_plants)

        # Seed Inventory
        self.seed_inventory_label = QLabel("Seed Inventory:")
        self.seed_inventory_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")
        self.seed_list = QListWidget()
        self.seed_list.setStyleSheet("background-color: white; border: 2px solid #8B4513;")
        self.seed_list.setMaximumHeight(150)
        self.seed_list.itemClicked.connect(self.plant_seed)

        # Growing Plants
        self.plant_container = QHBoxLayout()
        growing_label = QLabel("Growing Plants:")
        growing_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")

        # Harvested Garden
        self.harvested_garden = GardenWidget()
        harvested_label = QLabel("Harvested Garden:")
        harvested_label.setStyleSheet("font-size: 18px; font-weight: bold; color: white;")

        # Layouts
        main_layout = QVBoxLayout()

        # Top bar (title and currency)
        top_bar = QHBoxLayout()
        top_bar.addWidget(self.title)
        top_bar.addWidget(self.currency_label)

        # Center grid layout
        center_layout = QGridLayout()
        center_layout.addWidget(harvested_label, 0, 0)
        center_layout.addWidget(self.harvested_garden, 1, 0)
        center_layout.addWidget(growing_label, 0, 1)
        center_layout.addLayout(self.plant_container, 1, 1)
        center_layout.addWidget(self.seed_inventory_label, 0, 2)
        center_layout.addWidget(self.seed_list, 1, 2)

        # Bottom bar (buttons)
        bottom_bar = QHBoxLayout()
        bottom_bar.addWidget(self.add_plant_button)
        bottom_bar.addWidget(self.harvest_button)

        # Combine all layouts
        main_layout.addLayout(top_bar)
        main_layout.addLayout(center_layout)
        main_layout.addLayout(bottom_bar)

        self.setLayout(main_layout)

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

    def plant_seed(self, item):
        seed_text = item.text()
        seed_name, _ = seed_text.rsplit(" x", 1)
        if seed_name in self.seed_inventory and self.seed_inventory[seed_name] > 0:
            self.seed_inventory[seed_name] -= 1
            if self.seed_inventory[seed_name] == 0:
                del self.seed_inventory[seed_name]
            self.refresh_seed_list()

            # Create a growing plant instance
            plant = Plant(seed_name)
            plant_label = QLabel()
            plant_label.setPixmap(QPixmap(plant.image_path).scaled(50, 50))
            self.plant_container.addWidget(plant_label)
            self.plants.append((plant, plant_label))
            plant.grown.connect(lambda: plant_label.setPixmap(QPixmap(plant.image_path).scaled(50, 50)))

    def harvest_plants(self):
        harvested_indices = []
        for i, (plant, label) in enumerate(self.plants):
            if plant.stage >= 2:  # Fully grown
                self.plant_container.removeWidget(label)
                label.deleteLater()
                self.harvested_garden.add_harvested_plant(plant)
                if plant.seed_name in self.plant_inventory:
                    self.plant_inventory[plant.seed_name] += 1
                else:
                    self.plant_inventory[plant.seed_name] = 1
                harvested_indices.append(i)
        for index in sorted(harvested_indices, reverse=True):
            del self.plants[index]
        self.update_sell_list()
        self.harvested_garden.update_plants(self.plant_inventory)

    def update_sell_list(self):
        if hasattr(self, "shop"):
            self.shop.update_sell_list()

    def open_seed_shop(self):
        self.shop = SeedShop(self)
        self.shop.exec()