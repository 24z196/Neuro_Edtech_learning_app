from flask import Flask, request, jsonify
from pathlib import Path
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DATA_PATH = Path(__file__).parent / "avatar_users.json"

ITEM_MANIFEST = [
    {"id": "hoodie_blue", "name": "Blue Hoodie", "slot": "top", "xpCost": 500, "modelPath": "hoodie_blue.glb"},
    {"id": "crew_cut", "name": "Crew Cut", "slot": "hair", "xpCost": 200, "modelPath": "crew_cut.glb"},
    {"id": "shoes_white", "name": "White Sneakers", "slot": "footwear", "xpCost": 350, "modelPath": "shoes_white.glb"},
]


def load_users():
    if DATA_PATH.exists():
        try:
            return json.loads(DATA_PATH.read_text())
        except Exception:
            return {}
    return {}


def save_users(users):
    DATA_PATH.write_text(json.dumps(users, indent=2))


def get_or_create_user(users, user_id: str):
    user = users.get(user_id)
    if not user:
        user = {
            "name": user_id,
            "level": 1,
            "xp": 0,
            "xpToNextLevel": 1000,
            "totalXP": 0,
            "badges": 0,
            "coins": 0,
            "avatar": {
                "top": "hoodie_blue",
                "hair": "crew_cut",
                "footwear": "shoes_white",
            },
            "inventory": ["hoodie_blue", "crew_cut", "shoes_white"],
        }
        users[user_id] = user
    return user


@app.get("/api/items")
def get_items():
    return jsonify(ITEM_MANIFEST)


@app.post("/api/user/addXP")
def add_xp():
    data = request.get_json(force=True) or {}
    user_id = data.get("userId")
    amount = int(data.get("amount", 0))
    if not user_id or amount <= 0:
        return jsonify({"error": "Invalid input"}), 400

    users = load_users()
    user = get_or_create_user(users, user_id)
    user["xp"] = int(user.get("xp", 0)) + amount
    user["totalXP"] = int(user.get("totalXP", 0)) + amount
    save_users(users)
    return jsonify(user)


@app.post("/api/avatar/buy")
def buy_item():
    data = request.get_json(force=True) or {}
    user_id = data.get("userId")
    item_id = data.get("itemId")
    if not user_id or not item_id:
        return jsonify({"error": "Invalid input"}), 400

    item = next((i for i in ITEM_MANIFEST if i["id"] == item_id), None)
    if not item:
        return jsonify({"error": "Item not found"}), 404

    users = load_users()
    user = get_or_create_user(users, user_id)
    xp = int(user.get("xp", 0))
    cost = int(item.get("xpCost", 0))
    if xp < cost:
        return jsonify({"error": "Not enough XP"}), 400

    user["xp"] = xp - cost
    inv = set(user.get("inventory", []))
    inv.add(item_id)
    user["inventory"] = sorted(inv)
    save_users(users)
    return jsonify(user)


@app.post("/api/avatar/equip")
def equip_item():
    data = request.get_json(force=True) or {}
    user_id = data.get("userId")
    item_id = data.get("itemId")
    slot = data.get("slot")
    if not user_id or not item_id or not slot:
        return jsonify({"error": "Invalid input"}), 400

    item = next((i for i in ITEM_MANIFEST if i["id"] == item_id), None)
    if not item or item.get("slot") != slot:
        return jsonify({"error": "Item/slot mismatch"}), 400

    users = load_users()
    user = get_or_create_user(users, user_id)

    if item_id not in user.get("inventory", []):
        return jsonify({"error": "Item not in inventory"}), 400

    avatar = user.get("avatar") or {}
    avatar[slot] = item_id
    user["avatar"] = avatar
    save_users(users)
    return jsonify(user)


if __name__ == "__main__":
    # Run on port 5000 to match frontend base
    app.run(host="0.0.0.0", port=5000)
