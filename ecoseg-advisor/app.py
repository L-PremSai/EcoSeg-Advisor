from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import math
import re

# ==========================
# Flask Setup
# ==========================
app = Flask(__name__)
CORS(app)

# ==========================
# RAG KNOWLEDGE BASE
# ==========================
DOCUMENTS = [
    {
        "text": "Solid Waste Management Rules 2016 mandate segregation of waste at source.",
        "tags": ["policy", "segregation"]
    },
    {
        "text": "Wet waste should be composted or biologically processed.",
        "tags": ["wet", "compost"]
    },
    {
        "text": "Dry waste supports recycling and circular economy initiatives.",
        "tags": ["dry", "recycle"]
    },
    {
        "text": "Hazardous household waste must be handled separately.",
        "tags": ["hazardous", "safety"]
    },
    {
        "text": "E-waste should be disposed through authorized collection centers only.",
        "tags": ["ewaste", "electronics"]
    },
    {
        "text": "UN SDG 12 promotes responsible consumption and production.",
        "tags": ["sdg", "sustainability"]
    }
]

# ==========================
# SIMPLE VECTOR RETRIEVER
# ==========================
def embed(text):
    """Very lightweight embedding simulation"""
    words = re.findall(r"\w+", text.lower())
    return {w: words.count(w) for w in set(words)}

def cosine_sim(a, b):
    common = set(a) & set(b)
    num = sum(a[w] * b[w] for w in common)
    denom = math.sqrt(sum(v*v for v in a.values())) * math.sqrt(sum(v*v for v in b.values()))
    return num / denom if denom else 0

def retrieve_context(query, k=3):
    q_vec = embed(query)
    scored = [
        (cosine_sim(q_vec, embed(doc["text"])), doc["text"])
        for doc in DOCUMENTS
    ]
    scored.sort(reverse=True)
    return "\n".join([text for _, text in scored[:k]])

# ==========================
# GRANITE-STYLE REASONING AGENT (SIMULATED)
# ==========================
class GraniteSimulator:

    RULES = {
        "Wet / Biodegradable": {
            "keywords": ["food", "vegetable", "fruit", "leftover", "peel", "organic", "cooked", "raw"],
            "bin": "Green"
        },
        "Dry / Recyclable": {
            "keywords": ["plastic", "paper", "cardboard", "bottle", "glass", "metal"],
            "bin": "Blue / White"
        },
        "Domestic Hazardous": {
            "keywords": ["battery", "chemical", "medicine", "paint", "detergent"],
            "bin": "Red"
        },
        "E-waste": {
            "keywords": ["mobile", "phone", "laptop", "charger", "cable", "electronic"],
            "bin": "Special Collection"
        }
    }

    def classify(self, item, city="general"):
        text = item.lower()
        context = retrieve_context(item)

        scores = {}
        for cat, rule in self.RULES.items():
            scores[cat] = sum(1 for k in rule["keywords"] if k in text)

        best = max(scores, key=scores.get)

        if scores[best] == 0:
            return self.unknown(item)

        return {
            "waste_category": best,
            "bin_color": self.RULES[best]["bin"],
            "preparation": self.prep(best),
            "disposal": self.disposal(best),
            "reasoning": self.reason(item, best, context),
            "rag_context": context,
            "sdg_alignment": "SDG 12 – Responsible Consumption and Production"
        }

    def prep(self, cat):
        return {
            "Wet / Biodegradable": "Remove packaging and drain excess liquid.",
            "Dry / Recyclable": "Clean and dry before disposal.",
            "Domestic Hazardous": "Store safely in original container.",
            "E-waste": "Remove batteries and wipe personal data."
        }[cat]

    def disposal(self, cat):
        return {
            "Wet / Biodegradable": "Place in green bin or compost at home.",
            "Dry / Recyclable": "Place in blue/white bin for recycling.",
            "Domestic Hazardous": "Hand over to authorized hazardous waste collection.",
            "E-waste": "Take to authorized e-waste collection center."
        }[cat]

    def reason(self, item, cat, context):
        return (
            f"The item '{item}' matches characteristics of {cat}. "
            f"Retrieved policy context supports this classification: {context}. "
            f"This recommendation aligns with sustainable waste management practices."
        )

    def unknown(self, item):
        return {
            "waste_category": "Uncertain",
            "bin_color": "Consult local authority",
            "preparation": "Identify material and contamination level.",
            "disposal": "Seek guidance from municipal waste services.",
            "reasoning": f"Insufficient information to classify '{item}' confidently.",
            "sdg_alignment": "SDG 12 – Responsible Consumption and Production"
        }

agent = GraniteSimulator()

# ==========================
# ROUTES
# ==========================
@app.route("/")
def home():
    return render_template("index.html")

@app.route("/classify", methods=["POST"])
def classify():
    data = request.json
    item = data.get("item", "").strip()
    city = data.get("city", "general")

    if not item:
        return jsonify({"error": "Item is required"}), 400

    result = agent.classify(item, city)
    return jsonify(result)

@app.route("/health")
def health():
    return jsonify({
        "status": "healthy",
        "engine": "Granite-style simulated reasoning",
        "rag": "Lightweight cosine retrieval",
        "mode": "offline"
    })

# ==========================
# RUN
# ==========================
if __name__ == "__main__":
    print("🌱 EcoSeg Advisor running (SIMULATION MODE)")
    print("🧠 Granite-style reasoning + RAG")
    app.run(debug=True)
