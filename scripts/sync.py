import os
import sys
import json
import requests
from datetime import datetime, timezone, timedelta

# Configurazioni e Variabili d'ambiente
API_KEY = os.getenv('INTERVALS_API_KEY')
ATHLETE_ID = os.getenv('INTERVALS_ATHLETE_ID')
API_URL_BASE = "https://intervals.icu/api/v1/athlete"
DATA_FILE = "data/latest.json"

if not API_KEY or not ATHLETE_ID:
    print("ERRORE: INTERVALS_API_KEY e INTERVALS_ATHLETE_ID devono essere impostati.")
    sys.exit(1)

def get_auth():
    return ('API_KEY', API_KEY)

def load_previous_data():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Errore lettura file precedente: {e}")
    return {}

def fetch_json(url):
    response = requests.get(url, auth=get_auth())
    response.raise_for_status()
    return response.json()

def main():
    print(f"Avvio sincronizzazione per l'atleta {ATHLETE_ID}...")
    prev_data = load_previous_data()
    
    today = datetime.now(timezone.utc).date()
    yesterday = today - timedelta(days=1)
    
    # Range limitato per le API
    oldDays = 90
    oldest_date = (today - timedelta(days=oldDays)).strftime('%Y-%m-%d')
    newest_date = today.strftime('%Y-%m-%d')
    
    data = {
        "updated_at": datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%SZ')
    }
    
    # 1. Atleta Info
    try:
        print("Fetch Atleta...")
        res = fetch_json(f"{API_URL_BASE}/{ATHLETE_ID}")
        data["athlete"] = {
            "id": res.get("id", ATHLETE_ID),
            "name": res.get("name", "Atleta")
        }
    except Exception as e:
        print(f"  Fallito: {e}")
        data["athlete"] = prev_data.get("athlete", {"id": ATHLETE_ID, "name": "Sconosciuto"})

    # 2. Fitness (CTL, ATL, TSB)
    try:
        print("Fetch Fitness...")
        res = fetch_json(f"{API_URL_BASE}/{ATHLETE_ID}/fitness?oldest={oldest_date}&newest={newest_date}")
        if res and isinstance(res, list) and len(res) > 0:
            res.sort(key=lambda x: x["date"])
            current = res[-1]
            data["fitness"] = {
                "ctl": round(current.get("ctl", 0)),
                "atl": round(current.get("atl", 0)),
                "tsb": round(current.get("tsb", 0)),
                "ctl_history": [{"date": p["date"], "value": round(p.get("ctl", 0))} for p in res],
                "atl_history": [{"date": p["date"], "value": round(p.get("atl", 0))} for p in res],
                "tsb_history": [{"date": p["date"], "value": round(p.get("tsb", 0))} for p in res]
            }
        else:
             data["fitness"] = prev_data.get("fitness", {})
    except Exception as e:
        print(f"  Fallito: {e}")
        data["fitness"] = prev_data.get("fitness", {})

    # 3. Wellness (HRV, HR, Sonno)
    try:
        print("Fetch Wellness...")
        res = fetch_json(f"{API_URL_BASE}/{ATHLETE_ID}/wellness?oldest={oldest_date}&newest={newest_date}")
        if res and isinstance(res, list) and len(res) > 0:
            res.sort(key=lambda x: x.get("id", ""))
            current = res[-1]
            
            # Filtra per la history per rimuovere dati incompleti
            history = []
            for p in res[-30:]: # Ultime 30 entrate per l'history (se esistono)
                history.append({
                    "date": p.get("id"),
                    "hrv": p.get("hrv"),
                    "resting_hr": p.get("restingHR"),
                    "sleep_hours": p.get("sleepSecs", 0) / 3600.0 if p.get("sleepSecs") else None,
                    "energy": p.get("readiness") or p.get("fatigue") or None # Adegua con l'effettivo campo Intervals
                })
                
            data["wellness"] = {
                "hrv": current.get("hrv", 0),
                "resting_hr": current.get("restingHR", 0),
                "sleep_hours": round((current.get("sleepSecs", 0) / 3600.0), 1) if current.get("sleepSecs") else 0,
                "energy": 3, # Placeholder se non mappato correttamente
                "history": history
            }
        else:
            data["wellness"] = prev_data.get("wellness", {})
    except Exception as e:
        print(f"  Fallito: {e}")
        data["wellness"] = prev_data.get("wellness", {})

    # 4. Activities
    try:
        print("Fetch Activities...")
        # Per le attività limitiamo a circa 30 giorni
        act_oldest = (today - timedelta(days=30)).strftime('%Y-%m-%dT00:00:00')
        res = fetch_json(f"{API_URL_BASE}/{ATHLETE_ID}/activities?oldest={act_oldest}")
        if res and isinstance(res, list):
            res.sort(key=lambda x: x.get("start_date_local", ""), reverse=True)
            activities = []
            for act in res[:20]: # Ultime 20
                activities.append({
                    "id": act.get("id", ""),
                    "date": act.get("start_date_local", "")[:10],
                    "name": act.get("name", "Allenamento"),
                    "duration_seconds": act.get("moving_time", 0),
                    "distance_meters": act.get("distance", 0),
                    "normalized_power": act.get("normalized_power", 0) or act.get("average_power", 0),
                    "intensity_factor": act.get("intensity", 0),
                    "tss": act.get("tss", 0),
                    "type": act.get("type", "Ride")
                })
            data["activities"] = activities
        else:
             data["activities"] = prev_data.get("activities", [])
    except Exception as e:
        print(f"  Fallito: {e}")
        data["activities"] = prev_data.get("activities", [])

    # Salva il file
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f"Sincronizzazione completata con successo! Salvato in {DATA_FILE}")

if __name__ == "__main__":
    main()
