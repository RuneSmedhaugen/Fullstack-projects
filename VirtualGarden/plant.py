from PyQt6.QtCore import QTimer, pyqtSignal, QObject
from pathlib import Path

class Plant(QObject):
    grown = pyqtSignal()  # Signal to notify UI when plant grows

    def __init__(self, seed_name):
        super().__init__()
        self.stage = 0
        self.seed_name = seed_name
        # Mapping each seed to its stage images
        self.images = {
            "Sunflower Seed": [
                "assets/images/spire1.png",
                "assets/images/spire2.png",
                "assets/images/spire3.png"
            ],
            "Rose Seed": [
                "assets/images/spire1.png",
                "assets/images/spire2.png",
                "assets/images/spire3.png"
            ],
            "Tulip Seed": [
                "assets/images/spire1.png",
                "assets/images/spire2.png",
                "assets/images/spire3.png"
            ]
        }

        # Initialize image_path for stage 0
        self.image_path = self._get_image_for_stage(0)

        # Timer for growth (new stage every 5 seconds)
        self.timer = QTimer()
        self.timer.timeout.connect(self.grow)
        self.timer.start(5000)

    def _get_image_for_stage(self, stage):
        paths = self.images.get(self.seed_name, [])
        # choose stage or fallback to last
        idx = stage if 0 <= stage < len(paths) else len(paths) - 1 if paths else None
        if idx is None:
            print(f"Error: no images defined for '{self.seed_name}'")
            return ""
        rel_path = paths[idx]
        # check relative to current working dir
        if Path(rel_path).is_file():
            return rel_path
        else:
            # fallback to last stage image
            fallback = paths[-1]
            if Path(fallback).is_file():
                print(f"Warning: '{rel_path}' not found. Using fallback '{fallback}'")
                return fallback
            else:
                print(f"Error: both '{rel_path}' and fallback '{fallback}' missing.")
                return ""

    def grow(self):
        if self.stage < 2:
            self.stage += 1
            self.image_path = self._get_image_for_stage(self.stage)
            print(f"{self.seed_name} grew to stage {self.stage}! Image: {self.image_path}")
            self.grown.emit()
        else:
            self.timer.stop()

    def full_image(self):
        """Fully grown image (stage 2)"""
        return self._get_image_for_stage(2)
