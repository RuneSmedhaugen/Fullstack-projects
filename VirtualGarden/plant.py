from PyQt6.QtCore import QTimer, pyqtSignal, QObject

class Plant(QObject):
    grown = pyqtSignal()  # Signal to notify UI when plant grows

    def __init__(self):
        super().__init__()
        self.stage = 0  # Start as a child plant
        
        # Dictionary to store images for different growth stages
        self.images = {
            0: "assets/images/plant1.jpg",
            1: "assets/images/plant2.png",
            2: "assets/images/plant3.jpg"
        }

        self.image = self.images[self.stage]  # Set initial image

        # Timer for automatic growth
        self.timer = QTimer()
        self.timer.timeout.connect(self.grow)  # Call grow() when timer finishes

        # Start timer (e.g., grows every 5 seconds)
        self.timer.start(5000)

    def grow(self):
        """Advance the plant to the next stage if possible"""
        if self.stage < 2:  # Ensure we don't grow past the final stage
            self.stage += 1
            self.image = self.images[self.stage]
            print(f"Plant grew to stage {self.stage}!")
            self.grown.emit()  # Emit signal to update UI
        else:
            self.timer.stop()  # Stop the timer if fully grown

    def merge(self, other_plant):
        """Merge 2 of the same plants of the same stage to grow to the next stage"""
        if self.stage == other_plant.stage and self.stage < 2:
            self.stage += 1
            self.image = self.images[self.stage]
            print(f"Plants merged and grew to stage {self.stage}!")
            self.grown.emit()  # Notify UI that the plant changed

            if self.stage == 2:
                self.timer.stop()  # Stop the timer if fully grown
            return True
        else:
            return False  # Merge failed
