from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout, QHBoxLayout, QListWidget
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap
from plant import Plant
from SeedShopUI import SeedShop
from garden import GardenWidget

class GardenUI(QWidget):
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background-color: green;")
        self.setWindowTitle("Virtual Garden")
        self.plants = []  # List of tuples: (Plant, plant_label)
        self.title = QLabel("🌱 Virtual Garden", self)
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title.setStyleSheet("font-size: 20px; font-weight: bold;")
        
        self.currency = 20
        self.currency_label = QLabel(f"💰 Currency: ${self.currency}")
        self.currency_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.currency_label.setStyleSheet("font-size: 14px; font-weight: bold;")
        
        self.add_plant_button = QPushButton("Open Seed Shop")
        self.add_plant_button.clicked.connect(self.open_seed_shop)
        
        self.seed_inventory_label = QLabel("Seed Inventory:")
        self.seed_list = QListWidget()
        self.seed_list.itemClicked.connect(self.plant_seed)
        
        self.seed_inventory = {}  # {seed_name: quantity}
        self.plant_inventory = {}   # Harvested inventory: {plant type: quantity}
        
        # Container for growing plants
        self.plant_container = QHBoxLayout()
        # Create a harvested garden widget (from garden.py) to display harvested plants
        self.harvested_garden = GardenWidget()
        
        self.harvest_button = QPushButton("Harvest Plants")
        self.harvest_button.clicked.connect(self.harvest_plants)
        
        # Main layout: growing plants and harvested garden displayed side by side
        main_layout = QVBoxLayout()
        main_layout.addWidget(self.title)
        main_layout.addWidget(self.currency_label)
        main_layout.addWidget(self.add_plant_button)
        main_layout.addWidget(self.seed_inventory_label)
        main_layout.addWidget(self.seed_list)
        main_layout.addWidget(self.harvest_button)
        
        container_layout = QHBoxLayout()
        # Growing plants area
        growing_layout = QVBoxLayout()
        growing_label = QLabel("Growing Plants:")
        growing_layout.addWidget(growing_label)
        growing_layout.addLayout(self.plant_container)
        # Harvested garden area
        harvested_layout = QVBoxLayout()
        harvested_label = QLabel("Harvested Garden:")
        harvested_layout.addWidget(harvested_label)
        harvested_layout.addWidget(self.harvested_garden)
        
        container_layout.addLayout(growing_layout)
        container_layout.addLayout(harvested_layout)
        main_layout.addLayout(container_layout)
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
            # Create a label to display the plant image
            plant_label = QLabel()
            plant_label.setPixmap(QPixmap(plant.image_path).scaled(50, 50))
            self.plant_container.addWidget(plant_label)
            # Store the growing plant and its label
            self.plants.append((plant, plant_label))
            # Connect the plant's growth signal to update its image
            plant.grown.connect(lambda: plant_label.setPixmap(QPixmap(plant.image_path).scaled(50, 50)))
    
    def harvest_plants(self):
        """Harvest fully grown plants and move them to the harvested garden and update sell inventory."""
        print("Harvesting plants...")
        harvested_indices = []
        for i, (plant, label) in enumerate(self.plants):
            if plant.stage >= 2:  # Fully grown
                # Remove the growing plant's label from the container
                self.plant_container.removeWidget(label)
                label.deleteLater()
                # Add the harvested plant to the harvested garden display
                self.harvested_garden.add_harvested_plant(plant)
                # Update harvested inventory for selling
                if plant.seed_name in self.plant_inventory:
                    self.plant_inventory[plant.seed_name] += 1
                else:
                    self.plant_inventory[plant.seed_name] = 1
                harvested_indices.append(i)
        # Remove harvested plants from the growing list
        for index in sorted(harvested_indices, reverse=True):
            del self.plants[index]
        self.update_sell_list()
        # Refresh the harvested garden display
        self.harvested_garden.update_plants(self.plant_inventory)
    
    def update_sell_list(self):
        if hasattr(self, "shop"):
            self.shop.update_sell_list()
    
    def open_seed_shop(self):
        self.shop = SeedShop(self)
        self.shop.exec()