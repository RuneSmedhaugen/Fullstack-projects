from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QListWidget, QDialog, QTabWidget, QSpinBox
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QPixmap
from plant import Plant
import random

class SeedShop(QDialog):
    def __init__(self, garden_ui):
        super().__init__()
        self.setWindowTitle("Shop")
        self.setGeometry(200, 200, 400, 400)
        self.garden_ui = garden_ui

        # Tabs for buying and selling
        self.tabs = QTabWidget()
        self.buy_tab = QWidget()
        self.sell_tab = QWidget()
        self.tabs.addTab(self.buy_tab, "Buy Seeds")
        self.tabs.addTab(self.sell_tab, "Sell Plants")

        # Seed options for buying
        self.seeds = {"Sunflower Seed": 5, "Rose Seed": 7, "Tulip Seed": 6}
        self.seed_list = QListWidget()
        for seed, price in self.seeds.items():
            self.seed_list.addItem(f"{seed} - ${price}")
        self.buy_button = QPushButton("Buy Seed")
        self.buy_button.clicked.connect(self.buy_seed)
        buy_layout = QVBoxLayout()
        buy_layout.addWidget(self.seed_list)
        buy_layout.addWidget(self.buy_button)
        self.buy_tab.setLayout(buy_layout)

        # Sell Tab UI
        self.sell_list = QListWidget()
        self.sell_price_label = QLabel("💰 Sell Price: Calculating...")
        self.sell_button = QPushButton("Sell Selected")
        self.sell_button.clicked.connect(self.sell_plant)
        self.quantity_input = QSpinBox()
        self.quantity_input.setMinimum(1)
        self.quantity_input.setMaximum(100)
        self.quantity_input.setSuffix(" pcs")
        sell_layout = QVBoxLayout()
        sell_layout.addWidget(self.sell_list)
        sell_layout.addWidget(self.sell_price_label)
        sell_layout.addWidget(self.quantity_input)
        sell_layout.addWidget(self.sell_button)
        self.sell_tab.setLayout(sell_layout)

        # Main layout for the shop window
        layout = QVBoxLayout()
        layout.addWidget(self.tabs)
        self.setLayout(layout)

        self.update_sell_list()
        self.update_sell_prices()
        self.price_timer = QTimer(self)
        self.price_timer.timeout.connect(self.update_sell_prices)
        self.price_timer.start(300000)  # Update prices every 5 minutes

    def buy_seed(self):
        selected_item = self.seed_list.currentItem()
        if selected_item:
            seed_name, price_text = selected_item.text().split(" - $")
            price = int(price_text)
            self.garden_ui.buy_seed(seed_name, price)

    def update_sell_prices(self):
        self.sell_prices = {
            "Sunflower": random.randint(8, 12),
            "Rose": random.randint(10, 15),
            "Tulip": random.randint(9, 13)
    }

        # Update the sell prices label
        price_text = "💰 Sell Prices:\n"
        for plant, price in self.sell_prices.items():
            price_text += f"{plant}: ${price}\n"

        # Update the label to show the prices
        self.sell_price_label.setText(price_text.strip())
        self.update_sell_list()

    def update_sell_list(self):
        """Update the sell list with available harvested plants."""
        self.sell_list.clear()
        for plant, quantity in self.garden_ui.plant_inventory.items():
            self.sell_list.addItem(f"{plant} x{quantity}")

    def sell_plant(self):
        selected_item = self.sell_list.currentItem()
        if selected_item:
            plant_text = selected_item.text()
            plant_name, quantity_text = plant_text.split(" x")
            quantity = int(quantity_text)
            sell_price = self.sell_prices.get(plant_name, 0)
            sell_quantity = self.quantity_input.value()

            if sell_quantity <= quantity:
                # Update the garden UI's inventory
                self.garden_ui.sell_plant(plant_name, sell_quantity, sell_price)

                # Remove plants from PlayerGarden
                self.garden_ui.player_garden.remove_plants(plant_name, sell_quantity)

                # Update the sell list and harvested plants list
                self.update_sell_list()
                self.garden_ui.harvested_garden.update_plants(self.garden_ui.plant_inventory)