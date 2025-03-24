from PyQt6.QtWidgets import QWidget, QPushButton, QLabel, QVBoxLayout
from PyQt6.QtCore import Qt
from PyQt6.QtGui import QPixmap

class GardenUI(QWidget):
    def __init__(self):
        super().__init__()

        # Set background
        self.setStyleSheet("background-color: green;")

        # Title
        self.title = QLabel("🌱 Virtual Garden", self)
        self.title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.title.setStyleSheet("font-size: 20px; font-weight: bold;")

        # Add plant button
        self.add_plant_button = QPushButton("Add Plant")
        self.add_plant_button.setStyleSheet("font-size: 16px; padding: 10px;")
        self.add_plant_button.clicked.connect(self.add_plant)

        # Add flower button
        self.add_flower_button = QPushButton("Add Flower")
        self.add_flower_button.setStyleSheet("font-size: 16px; padding: 10px;")
        self.add_flower_button.clicked.connect(self.add_flower)

        # Plant container
        self.plant_label = QLabel(self)
        self.plant_label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        # Layout
        layout = QVBoxLayout()
        layout.addWidget(self.title)
        layout.addWidget(self.add_plant_button)
        layout.addWidget(self.add_flower_button)
        layout.addWidget(self.plant_label)
        self.setLayout(layout)

    def add_plant(self):
        pixmap = QPixmap("assets/images/plant1.jpg")
        if not pixmap.isNull():
            self.plant_label.setPixmap(pixmap.scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio))
        else:
            print("Error: Image not found!")

    def add_flower(self):
        pixmap = QPixmap("assets/images/rose1.png")
        if not pixmap.isNull():
            self.plant_label.setPixmap(pixmap.scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio))
        else:
            print("Error: Image not found!")