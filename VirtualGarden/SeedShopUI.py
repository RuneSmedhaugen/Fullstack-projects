from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget, QDialog, QTabWidget, QSpinBox
from PyQt6.QtCore import Qt, QTimer
from PyQt6.QtGui import QPixmap
from plant import Plant
import random

class SeedShop(QDialog):
    def __init__(self, garden_ui):
        super().__init__()
        self.setWindowTitle("Seed Shop")
        self.setGeometry(200, 200, 400, 400)
        self.garden_ui = garden_ui

        # Tabs
        self.tabs = QTabWidget()
        self.buy_tab = QWidget()
        self.sell_tab = QWidget()

        self.tabs.addTab(self.buy_tab, "Buy Seeds")
        self.tabs.addTab(self.sell_tab, "Sell Plants")

        # Seed options
        self.seeds = {"Sunflower Seed": 5, "Rose Seed": 7, "Tulip Seed": 6}

        # Buy Tab UI
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
        self.quantity_input.setMaximum(1)
        self.quantity_input.setSuffix(" pcs")

        sell_layout = QVBoxLayout()
        sell_layout.addWidget(self.sell_list)
        sell_layout.addWidget(self.sell_price_label)
        sell_layout.addWidget(self.quantity_input)
        sell_layout.addWidget(self.sell_button)
        self.sell_tab.setLayout(sell_layout)

        # Main Layout
        layout = QVBoxLayout()
        layout.addWidget(self.tabs)
        self.setLayout(layout)

        self.update_sell_list()
        self.update_sell_prices()
        self.price_timer = QTimer(self)
        self.price_timer.timeout.connect(self.update_sell_prices)
        self.price_timer.start(300000)  # Update every 5 minutes

    def buy_seed(self):
        selected_item = self.seed_list.currentItem()
        if selected_item:
            seed_name, price_text = selected_item.text().split(" - $")
            price = int(price_text)
            if self.garden_ui.currency >= price:
                self.garden_ui.currency -= price
                self.garden_ui.update_currency_display()
                self.garden_ui.update_seed_inventory(seed_name)
                print(f"Bought {seed_name} for ${price}!")
            else:
                print("Not enough currency!")

    def update_sell_prices(self):
        """Randomize selling prices."""
        self.sell_prices = {"Sunflower": random.randint(8, 12), "Rose": random.randint(10, 15), "Tulip": random.randint(9, 13)}
        self.sell_price_label.setText(f"💰 Sell Prices Updated!")
        self.update_sell_list()

    def update_sell_list(self):
        """Update the sell list with available plants."""
        self.sell_list.clear()
        for plant, quantity in self.garden_ui.plant_inventory.items():
            self.sell_list.addItem(f"{plant} x{quantity}")

    def sell_plant(self):
        """Sell selected plants."""
        selected_item = self.sell_list.currentItem()
        if selected_item:
            plant_text = selected_item.text()
            plant_name, quantity_text = plant_text.split(" x")
            quantity = int(quantity_text)
            sell_price = self.sell_prices.get(plant_name, 0)
            sell_quantity = self.quantity_input.value()

            if sell_quantity <= quantity:
                self.garden_ui.currency += sell_price * sell_quantity
                self.garden_ui.update_currency_display()
                self.garden_ui.plant_inventory[plant_name] -= sell_quantity
                if self.garden_ui.plant_inventory[plant_name] <= 0:
                    del self.garden_ui.plant_inventory[plant_name]
                self.update_sell_list()
                print(f"Sold {sell_quantity} {plant_name}(s) for ${sell_price * sell_quantity}!")
            else:
                print("Not enough plants to sell!")