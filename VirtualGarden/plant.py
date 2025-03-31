from PyQt6.QtCore import QTimer, pyqtSignal, QObject

class Plant(QObject):
    grown = pyqtSignal()  # Signal to notify UI when plant grows

    def __init__(self, seed_name):
        super().__init__()
        self.stage = 0  # Initial growth stage
        
        # Image paths for each growth stage
        self.images = {
            "Sunflower Seed": {
                0: "assets/images/spire1.png",
                1: "assets/images/spire2.png",
                2: "assets/images/spire3.png"
            },
            "Rose Seed": {
                0: "assets/images/spire1.png",
                1: "assets/images/spire2.png",
                2: "assets/images/spire3.png"
            },
            "Tulip Seed": {
                0: "assets/images/spire1.png",
                1: "assets/images/spire2.png",
                2: "assets/images/spire3.png"
            }
        }
        self.seed_name = seed_name
        self.image_path = self.images.get(seed_name, {}).get(self.stage, "assets/images/default_plant.png")
        
        # Timer for growth (advance stage every 5 seconds)
        self.timer = QTimer()
        self.timer.timeout.connect(self.grow)
        self.timer.start(5000)

    def grow(self):
        if self.stage < 2:
            self.stage += 1
            self.image_path = self.images[self.seed_name].get(self.stage, self.image_path)
            print(f"{self.seed_name} grew to stage {self.stage}!")
            self.grown.emit()
        else:
            self.timer.stop()
