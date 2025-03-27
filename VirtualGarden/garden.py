from PyQt6.QtWidgets import QWidget, QLabel, QVBoxLayout
from PyQt6.QtGui import QPixmap
from PyQt6.QtCore import Qt

class GardenWidget(QWidget):
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background-color: lightblue;")
        self.layout = QVBoxLayout()
        self.setLayout(self.layout)
    
    def add_harvested_plant(self, plant):
        """Add a harvested plant's image to the garden display."""
        label = QLabel()
        pixmap = QPixmap(plant.image_path)
        label.setPixmap(pixmap.scaled(50, 50, Qt.AspectRatioMode.KeepAspectRatio))
        self.layout.addWidget(label)
    
    def update_plants(self, plant_inventory):
        """Refresh the harvested garden display based on the current inventory."""
        # Clear current display
        while self.layout.count():
            item = self.layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()
        # Add labels for each plant type and quantity
        for plant, quantity in plant_inventory.items():
            label = QLabel(f"{plant} x{quantity}")
            label.setStyleSheet("font-size: 14px;")
            self.layout.addWidget(label)
