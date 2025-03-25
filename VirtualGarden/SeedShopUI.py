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
        self.seeds = {"Sunflower Seed": 5, "Rose Seed": 7, "Tulip Seed": 6}

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
            self.garden_ui.update_seed_inventory(seed_name)  # Add to inventory
            print(f"Bought {seed_name}!")


