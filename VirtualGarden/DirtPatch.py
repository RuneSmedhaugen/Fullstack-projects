from PyQt6.QtWidgets import QWidget, QLabel
from PyQt6.QtGui import QPixmap
from PyQt6.QtCore import Qt

class DirtPatch(QWidget):
    def __init__(self):
        super().__init__()
        self.setFixedSize(150, 220)
        self.background_label = QLabel(self)
        self.background_label.setPixmap(QPixmap("assets/images/dirt.png").scaled(200, 180, Qt.AspectRatioMode.KeepAspectRatio))
        self.background_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.background_label.setFixedSize(100, 180)
        self.overlay_label = QLabel(self)
        self.overlay_label.setFixedSize(120, 120)
        self.overlay_label.setStyleSheet("background: transparent;")
        self.overlay_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.background_label.move(0, 0)
        self.overlay_label.move(0, -15)
    
    def set_overlay(self, image_path):
        pixmap = QPixmap(image_path).scaled(100, 100, Qt.AspectRatioMode.KeepAspectRatio, Qt.TransformationMode.SmoothTransformation)
        self.overlay_label.setPixmap(pixmap)
        self.overlay_label.raise_()
    
    def clear_overlay(self):
        self.overlay_label.clear()
