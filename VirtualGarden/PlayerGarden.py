from PyQt6.QtWidgets import QWidget, QLabel
from PyQt6.QtGui import QPixmap, QMouseEvent
from PyQt6.QtCore import Qt, pyqtSignal

class PlayerGarden(QWidget):
    # Signal to notify when a plant is placed
    plant_placed = pyqtSignal(str)
    # Signal to return a plant to inventory
    plant_returned = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.setStyleSheet("background-color: lightgreen; border: none;")
        self.setMouseTracking(True)
        self.setAttribute(Qt.WidgetAttribute.WA_StyledBackground, True)
        self.selected_plant = None

    def select_plant(self, plant_name, image_path):
        """Select a plant to be placed in the garden."""
        self.selected_plant = {"name": plant_name, "image_path": image_path}
        print(f"Selected {plant_name} for planting.")

    def mousePressEvent(self, event: QMouseEvent):
        """Handle mouse clicks to plant the selected flower."""
        if self.selected_plant:
            x, y = event.position().x(), event.position().y()
            label = QLabel(self)
            label.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground, True)
            # Remove any border
            label.setStyleSheet("background: transparent; border: none;")
            pixmap = QPixmap(self.selected_plant["image_path"]) \
                        .scaled(50, 50, Qt.AspectRatioMode.KeepAspectRatio)
            label.setPixmap(pixmap)
            label.move(int(x - 25), int(y - 25))
            label.show()
            # store name on label
            label.plant_name = self.selected_plant['name']
            # clicking a planted label returns it
            label.mousePressEvent = lambda e, lbl=label: self._return_plant(lbl)

            self.plant_placed.emit(self.selected_plant['name'])
            self.selected_plant = None
            return
        super().mousePressEvent(event)

    def _return_plant(self, label: QLabel):
        """Return a planted flower back to inventory on click"""
        plant_name = getattr(label, 'plant_name', None)
        if plant_name:
            label.deleteLater()
            self.plant_returned.emit(plant_name)
            print(f"Returned {plant_name} to inventory from PlayerGarden")

    def remove_plants(self, plant_name, quantity):
        """Remove up to 'quantity' plants of a given name from the garden."""
        removed = 0
        for child in self.findChildren(QLabel):
            if getattr(child, 'plant_name', None) == plant_name and removed < quantity:
                child.deleteLater()
                removed += 1
        print(f"Removed {removed} {plant_name}(s) from PlayerGarden")