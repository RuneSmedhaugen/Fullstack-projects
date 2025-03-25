from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from plant import Plant
from SeedShopUI import SeedShop


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
        self.seed_inventory = {}  # Dictionary to track seed quantities

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

    def update_seed_inventory(self, seed_name):
        """Update the seed inventory list with quantities."""
        if seed_name in self.seed_inventory:
            self.seed_inventory[seed_name] += 1
        else:
            self.seed_inventory[seed_name] = 1
        
        self.refresh_seed_list()

    def refresh_seed_list(self):
        """Refresh the displayed seed list with quantities."""
        self.seed_list.clear()
        for seed, quantity in self.seed_inventory.items():
            self.seed_list.addItem(f"{seed} x{quantity}")

    def plant_seed(self, item):
        """Plant a seed from the inventory."""
        seed_text = item.text()
        if " x" in seed_text:
            seed_name, _ = seed_text.rsplit(" x", 1)  # Extract seed name
        else:
            seed_name = seed_text
        
        if seed_name in self.seed_inventory and self.seed_inventory[seed_name] > 0:
            self.seed_inventory[seed_name] -= 1
            if self.seed_inventory[seed_name] == 0:
                del self.seed_inventory[seed_name]
            self.refresh_seed_list()

            plant = Plant()  # Create plant instance
            self.plants.append(plant)

            plant_label = QLabel(self)
            pixmap = QPixmap(plant.image)
            plant_label.setPixmap(pixmap.scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio))

            # Connect signal
            plant.grown.connect(lambda: self.update_plant_image(plant, plant_label))
            self.plant_container.addWidget(plant_label)

    def update_plant_image(self, plant, label):
        """Update plant image when it grows."""
        pixmap = QPixmap(plant.image)
        label.setPixmap(pixmap.scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio))

    def open_seed_shop(self):
        """Open the seed shop window."""
        self.shop = SeedShop(self)
        self.shop.exec()