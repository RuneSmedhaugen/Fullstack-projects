from PyQt6.QtWidgets import QWidget, QLabel, QVBoxLayout

class Scoreboard(QWidget):
    def __init__(self):
        super().__init__()
        self.setStyleSheet("background-color: #F5F5F5; border: 2px solid #8B4513;")
        self.layout = QVBoxLayout()
        self.setLayout(self.layout)

        # Initialize stats
        self.stats = {
            "Plants Planted": 0,
            "Weeds Removed": 0,
            "Plants Sold": {},
            "Money Spent": 0,
            "Money Earned": 0
        }

        # Labels for stats
        self.labels = {}
        for stat in self.stats:
            label = QLabel(f"{stat}: {self.stats[stat]}")
            label.setStyleSheet("font-size: 16px; font-weight: bold;")
            self.labels[stat] = label
            self.layout.addWidget(label)

    def update_stat(self, stat, value):
        """Update a specific stat and refresh the label."""
        if isinstance(self.stats[stat], dict):
            # For dictionary stats like "Plants Sold"
            for key, val in value.items():
                if key in self.stats[stat]:
                    self.stats[stat][key] += val
                else:
                    self.stats[stat][key] = val
            # Update label
            sold_text = ", ".join([f"{k}: {v}" for k, v in self.stats[stat].items()])
            self.labels[stat].setText(f"{stat}: {sold_text}")
        else:
            # For numeric stats
            self.stats[stat] += value
            self.labels[stat].setText(f"{stat}: {self.stats[stat]}")