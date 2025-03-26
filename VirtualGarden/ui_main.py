from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from plant import Plant
from SeedShopUI import SeedShop

class GardenUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background-color: green;")
        self.setWindowTitle("Virtual Garden")
        self.plants = []
        self.title = QLabel("\U0001F331 Virtual Garden", self)
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title.setStyleSheet("font-size: 20px; font-weight: bold;")
        
        self.currency = 20
        self.currency_label = QLabel(f"\U0001F4B0 Currency: ${self.currency}")
        self.currency_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.currency_label.setStyleSheet("font-size: 14px; font-weight: bold;")
        
        self.add_plant_button = QPushButton("Open Seed Shop")
        self.add_plant_button.clicked.connect(self.open_seed_shop)
        
        self.seed_inventory_label = QLabel("Seed Inventory:")
        self.seed_list = QListWidget()
        self.seed_list.itemClicked.connect(self.plant_seed)
        
        self.seed_inventory = {}
        self.plant_inventory = {}
        self.plant_container = QHBoxLayout()
        
        self.harvest_button = QPushButton("Harvest Plants")
        self.harvest_button.clicked.connect(self.harvest_plants)
        
        layout = QVBoxLayout()
        layout.addWidget(self.title)
        layout.addWidget(self.currency_label)
        layout.addWidget(self.add_plant_button)
        layout.addWidget(self.seed_inventory_label)
        layout.addWidget(self.seed_list)
        layout.addWidget(self.harvest_button)
        layout.addLayout(self.plant_container)
        self.setLayout(layout)
    
    def update_currency_display(self):
        self.currency_label.setText(f"\U0001F4B0 Currency: ${self.currency}")
    
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
        
        # Create plant instance
        plant = Plant(seed_name)
        self.plants.append(plant)
        
        # Create QLabel for plant
        plant_label = QLabel()
        plant_label.setPixmap(QPixmap(plant.image_path).scaled(50, 50))
        self.plant_container.addWidget(plant_label)
        
        # Connect plant growth to image update
        plant.grown.connect(lambda: plant_label.setPixmap(QPixmap(plant.image_path).scaled(50, 50)))


    
    def harvest_plants(self):
        """Harvest fully grown plants and add them to inventory."""
        print("Harvesting plants...")  # Debugging
        self.update_sell_list()
    
    def update_sell_list(self):
        """Update the sell list in the shop after harvesting."""
        if hasattr(self, "shop"):
            self.shop.update_sell_list()
    
    def open_seed_shop(self):
        self.shop = SeedShop(self)
        self.shop.exec()
