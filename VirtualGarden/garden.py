from PyQt6.QtWidgets import QWidget, QLabel, QVBoxLayout
from PyQt6.QtGui import QPixmap
from PyQt6.QtCore import Qt
from PyQt6.QtCore import pyqtSignal

class GardenWidget(QWidget):
    plant_selected = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.setStyleSheet("background-color: lightblue;")
        self.layout = QVBoxLayout()
        self.setLayout(self.layout)
        self.selected_label = None

    def update_plants(self, plant_inventory):
        """Update the harvested plants list."""
        print("Updating harvested plants list...")
        self.selected_label = None

        # 2) Remove all widgets as before
        while self.layout.count():
            item = self.layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()

        # 3) Rebuild
        for plant, quantity in plant_inventory.items():
            label = QLabel(f"{plant} x{quantity}")
            label.setStyleSheet("font-size: 14px; padding: 5px; border: 1px solid transparent;")

            def make_handler(name, lbl):
                return lambda event: self.select_plant(name, lbl)

            label.mousePressEvent = make_handler(plant, label)
            self.layout.addWidget(label)
            print(f"Added label for {plant} with quantity {quantity}")

    def select_plant(self, plant_name, label_widget):
        """Handle selecting a plant."""
        print(f"Clicked on {plant_name}")
        if self.selected_label:
            # Reset the style of the previously selected label
            self.selected_label.setStyleSheet("font-size: 14px; padding: 5px; border: 1px solid transparent;")
        # Highlight the newly selected label
        label_widget.setStyleSheet("font-size: 14px; padding: 5px; border: 2px solid #FFD700;")
        self.selected_label = label_widget
        self.plant_selected.emit(plant_name)