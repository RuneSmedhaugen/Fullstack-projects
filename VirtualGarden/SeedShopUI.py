from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget, QDialog
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from plant import Plant

class SeedShop(QDialog):
    def __init__(self, garden_ui):
        super().__init__()
        self.setWindowTitle("Seed Shop")
        self.setGeometry(200, 200, 300, 400)
        self.garden_ui = garden_ui

        # Seed options
        self.seeds = {"Sunflower Seed": 5, "Rose Seed": 7, "Tulip Seed": 6, "Maruhana Seed": 10}

        # UI Elements
        self.title = QLabel("🌱 Seed Shop", self)
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.seed_list = QListWidget()
        for seed, price in self.seeds.items():
            self.seed_list.addItem(f"{seed} - ${price}")

        self.buy_button = QPushButton("Buy Seed")
        self.buy_button.clicked.connect(self.buy_seed)

        # Layout
        layout = QVBoxLayout()
        layout.addWidget(self.title)
        layout.addWidget(self.seed_list)
        layout.addWidget(self.buy_button)
        self.setLayout(layout)

    def buy_seed(self):
        selected_item = self.seed_list.currentItem()
        if selected_item:
            seed_name = selected_item.text().split(" - ")[0]  # Extract seed name
            self.garden_ui.update_seed_inventory([seed_name])  # Add to inventory
            print(f"Bought {seed_name}!")

class GardenUI(QWidget):
    def __init__(self):
        super().__init__()

        # Set background
        self.setStyleSheet("background-color: green;")

        # Title
        self.title = QLabel("🌱 Virtual Garden", self)
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title.setStyleSheet("font-size: 20px; font-weight: bold;")

        # Buttons
        self.add_plant_button = QPushButton("Open Seed Shop")
        self.add_plant_button.clicked.connect(self.open_seed_shop)

        # Seed Inventory
        self.seed_inventory_label = QLabel("Seed Inventory:")
        self.seed_list = QListWidget()
        self.seed_list.itemClicked.connect(self.plant_seed)

        # Layout for plants
        self.plants = []  # Store plants
        self.plant_container = QHBoxLayout()  # Horizontal layout for plants

        # Main layout
        layout = QVBoxLayout()
        layout.addWidget(self.title)
        layout.addWidget(self.add_plant_button)
        layout.addWidget(self.seed_inventory_label)
        layout.addWidget(self.seed_list)
        layout.addLayout(self.plant_container)
        self.setLayout(layout)

    def update_seed_inventory(self, seeds):
        """Update the seed inventory list."""
        for seed in seeds:
            self.seed_list.addItem(seed)

    def plant_seed(self, item):
        """Plant a seed from the inventory."""
        seed_name = item.text()
        plant = Plant()  # Create plant instance
        self.plants.append(plant)

        plant_label = QLabel(self)
        pixmap = QPixmap(plant.image)
        plant_label.setPixmap(pixmap.scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio))

        # Connect signal
        plant.grown.connect(lambda: self.update_plant_image(plant, plant_label))
        self.plant_container.addWidget(plant_label)

        # Remove the seed from inventory
        self.seed_list.takeItem(self.seed_list.row(item))

    def update_plant_image(self, plant, label):
        """Update plant image when it grows."""
        pixmap = QPixmap(plant.image)
        label.setPixmap(pixmap.scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio))

    def open_seed_shop(self):
        """Open the seed shop window."""
        self.shop = SeedShop(self)
        self.shop.exec()
