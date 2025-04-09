from PyQt6.QtWidgets import QWidget, QLabel, QGridLayout
from PyQt6.QtCore import QTimer
from PyQt6.QtGui import QPixmap
from PyQt6.QtCore import Qt

class PlayerGarden(QWidget):
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background-color: lightgreen; border: 2px solid #8B4513;")
        self.layout = QGridLayout()
        self.setLayout(self.layout)

        self.plants = []  # List to store plants in the garden

        # Timer for passive income
        self.income_timer = QTimer(self)
        self.income_timer.timeout.connect(self.generate_income)
        self.income_timer.start(10000)  # Generate income every 10 seconds

        self.passive_income = 0  # Total passive income generated

    def add_plant(self, plant_name, image_path, income):
        """Add a plant to the player garden."""
        label = QLabel()
        pixmap = QPixmap(image_path).scaled(50, 50, Qt.AspectRatioMode.KeepAspectRatio)
        label.setPixmap(pixmap)
        self.layout.addWidget(label, len(self.plants) // 5, len(self.plants) % 5)  # Place in grid
        self.plants.append({"name": plant_name, "income": income})
        self.passive_income += income

    def generate_income(self):
        """Generate passive income based on the plants in the garden."""
        total_income = sum(plant["income"] for plant in self.plants)
        print(f"Generated ${total_income} in passive income!")
        self.parent().currency += total_income
        self.parent().update_currency_display()