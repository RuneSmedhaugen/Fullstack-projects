import sys
from PyQt6.QtWidgets import QApplication, QMainWindow
from ui_main import GardenUI

class VirtualGarden(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Virtual Garden")
        self.setGeometry(100, 100, 800, 600)

        # Set UI
        self.ui = GardenUI()
        self.setCentralWidget(self.ui)

if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = VirtualGarden()
    window.show()
    sys.exit(app.exec())
