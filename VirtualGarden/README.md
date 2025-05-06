 Virtual Garden App
Welcome to the Virtual Garden — a chill, idle-style desktop app where players plant, grow, harvest, and trade magical flowers. This simulation is built with PyQt6 and features plant growth mechanics, an in-game economy, and inventory management.

🛠 Features
🌼 Planting System: Click to plant flowers anywhere in your player garden.

💧 Growth Logic: Seeds grow through 3 stages — from sprout to bloom.

🧼 Drag & Drop Cleanliness: Fully transparent PNG flowers, no ugly borders!

🧺 Inventory Management: Harvested plants are stored and can be re-planted or sold.

💸 Seed Shop: Buy new seeds and sell your harvested flowers for fluctuating profits.

🔁 Return Mechanic: Misclick? You can return planted flowers back to inventory.

📁 File Overview
main.py: Launches the app.

ui_main.py: Main interface and logic controller.

PlayerGarden.py: Handles click-planting and plant return.

SeedShop.py: Buy/sell dialog for the in-game economy.

plant.py: Defines the Plant class (e.g., stage, type, and behaviors).

assets/images/: Folder for all plant images and icons (make sure they're transparent PNGs!).

🚀 How to Run
Make sure you have Python 3.10+ and PyQt6 installed:

pip install PyQt6
Run the app:

python main.py
Enjoy planting and selling your leafy empire!

Known bugs and stuff
Selling prices updates every time you open seed shop instead of a fixed time
only 1 image for all plants (you can add  your own images if you want)


💡 Future Ideas
🌤️ Weather-based growth rates

🐛 Weeds and pests

🎖️ Special collectible plants

🧠 Local AI assistant gardener