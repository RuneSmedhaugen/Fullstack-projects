from PyQt6.QtCore import QTimer

class Plant:
    def __init__(self):
        self.stage = 0  # Start as a child plant
        
        # Dictionary to store images for different growth stages
        self.images = {
            0: "path_to_child_image.png",
            1: "path_to_half_grown_image.png",
            2: "path_to_fully_grown_image.png"
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
        else:
            self.timer.stop()  # Stop the timer if fully grown

    def merge(self, other_plant):
        """Merge 2 of the same plants of the same stage to grow to the next stage"""
        if self.stage == other_plant.stage and self.stage < 2:
            self.stage += 1
            self.image = self.images[self.stage]
            print(f"Plants merged and grew to stage {self.stage}!")

            if self.stage == 2:
                self.timer.stop()  # Stop the timer if fully grown
        else:
            print("Plants cannot be merged!")