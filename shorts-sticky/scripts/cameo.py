"""Busca al ganador del cameo: la última persona que comentó en el último video del canal.

Uso (desde shorts-sticky):  python -I scripts/cameo.py            -> último video largo (por defecto)
                            python -I scripts/cameo.py largo      -> último video de más de 3 min
                            python -I scripts/cameo.py <videoId>  -> un video concreto

Credenciales: ../secretos/token.json (OAuth del canal, NUNCA se sube a git).
Solo lee datos; no publica nada. YouTube no dice quién dio like ni quién vio el video;
"suscrito" solo se puede saber si la persona tiene sus suscripciones públicas.
"""
import json, re, sys
from pathlib import Path
import requests
sys.stdout.reconfigure(encoding="utf-8")

RAIZ = Path(__file__).resolve().parents[2]
TOKEN = RAIZ / "secretos" / "token.json"
API = "https://www.googleapis.com/youtube/v3/"


def access_token():
    t = json.loads(TOKEN.read_text(encoding="utf-8"))
    r = requests.post(t["token_uri"], data={
        "client_id": t["client_id"], "client_secret": t["client_secret"],
        "refresh_token": t["refresh_token"], "grant_type": "refresh_token"}, timeout=30)
    r.raise_for_status()
    return r.json()["access_token"]


def get(h, path, **p):
    r = requests.get(API + path, headers=h, params=p, timeout=30)
    r.raise_for_status()
    return r.json()


def segundos(iso):
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", iso or "")
    if not m:
        return 0
    d, h, mi, s = (int(x or 0) for x in m.groups())
    return d * 86400 + h * 3600 + mi * 60 + s


def main():
    arg = sys.argv[1] if len(sys.argv) > 1 else "largo"  # por defecto: último video largo
    h = {"Authorization": "Bearer " + access_token()}
    canal = get(h, "channels", part="snippet,contentDetails", mine="true")["items"][0]
    print("Canal:", canal["snippet"]["title"])

    if arg and arg != "largo":
        vid = arg
    else:
        up = canal["contentDetails"]["relatedPlaylists"]["uploads"]
        ids = [i["contentDetails"]["videoId"] for i in
               get(h, "playlistItems", part="contentDetails", playlistId=up, maxResults=25)["items"]]
        info = get(h, "videos", part="snippet,contentDetails", id=",".join(ids))["items"]
        info.sort(key=lambda v: v["snippet"]["publishedAt"], reverse=True)
        if arg == "largo":
            info = [v for v in info if segundos(v["contentDetails"]["duration"]) > 180] or info
        vid = info[0]["id"]
    v = get(h, "videos", part="snippet,statistics", id=vid)["items"][0]
    print("Video:", v["snippet"]["title"], f"({vid}, {v['statistics'].get('viewCount', '?')} vistas,"
          f" {v['statistics'].get('commentCount', '?')} comentarios)")

    hilos = get(h, "commentThreads", part="snippet,replies", videoId=vid, order="time", maxResults=50)["items"]
    coms = []
    for t in hilos:
        coms.append(t["snippet"]["topLevelComment"]["snippet"])
        coms += [r["snippet"] for r in t.get("replies", {}).get("comments", [])]
    propio = canal["id"]
    coms = [c for c in coms if c.get("authorChannelId", {}).get("value") != propio]
    if not coms:
        print("Todavía no hay comentarios de otras personas.")
        return
    coms.sort(key=lambda c: c["publishedAt"], reverse=True)

    subs, tok = set(), None
    try:
        for _ in range(20):
            r = get(h, "subscriptions", part="subscriberSnippet", myRecentSubscribers="true",
                    maxResults=50, **({"pageToken": tok} if tok else {}))
            subs |= {i["subscriberSnippet"]["channelId"] for i in r["items"]}
            tok = r.get("nextPageToken")
            if not tok:
                break
    except requests.HTTPError:
        subs = None

    print("\nÚltimos comentarios (el primero gana el cameo):")
    for c in coms[:5]:
        cid = c.get("authorChannelId", {}).get("value", "")
        sus = "?" if subs is None else ("sí" if cid in subs else "no (o suscripción privada)")
        texto = c["textOriginal"].replace("\n", " ")[:80]
        print(f"- {c['authorDisplayName']}  | {c['publishedAt'][:16]} | likes del comentario: {c['likeCount']}"
              f" | suscrito: {sus}\n    «{texto}»")

    # foto de perfil del ganador -> public/cameo/ganador.jpg (para la tarjeta de cameo del motor)
    gan = coms[0]
    url = gan.get("authorProfileImageUrl", "")
    if url:
        url = re.sub(r"=s\d+", "=s512", url)  # pedir la foto más grande
        destino = RAIZ / "shorts-sticky" / "public" / "cameo" / "ganador.jpg"
        destino.parent.mkdir(parents=True, exist_ok=True)
        r = requests.get(url, timeout=30)
        r.raise_for_status()
        destino.write_bytes(r.content)
        print(f"\nGanador: {gan['authorDisplayName']}  ->  foto guardada en {destino}")
        print(f"  En la historia: cameo: {{ foto: \"cameo/ganador.jpg\", nombre: \"{gan['authorDisplayName']}\" }}")
    else:
        print(f"\nGanador: {gan['authorDisplayName']} (sin foto de perfil: la tarjeta mostrará un \"?\")")


if __name__ == "__main__":
    main()
