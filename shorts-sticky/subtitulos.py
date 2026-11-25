# Subtítulos palabra por palabra (ASS) desde palabras.json y los quema en el video.
# Grupos de 2-3 palabras; la palabra que se está diciendo va en amarillo y un poco más grande.
# Uso: python -I subtitulos.py voz/palabras.json video_entrada.mp4 video_salida.mp4
import json, re, subprocess, sys, os

words = json.load(open(sys.argv[1], encoding="utf-8"))
script = open(os.path.join(os.path.dirname(sys.argv[1]), "guion.txt"), encoding="utf-8").read()

# put back the punctuation the word timings drop (to break groups at commas/periods)
toks = re.findall(r"[\wáéíóúüñÁÉÍÓÚÜÑ]+[^\s\w]*", script)
for w, tk in zip(words, toks):
    w["punct"] = bool(re.search(r"[.,:;!?…]$", tk))

ASS = "out/subs_" + os.path.basename(os.path.dirname(os.path.abspath(sys.argv[1]))) + ".ass"
groups, cur = [], []
for i, w in enumerate(words):
    cur.append(w)
    nxt = words[i + 1] if i + 1 < len(words) else None
    gap = (nxt["t"] - (w["t"] + w["d"])) if nxt else 9
    chars = sum(len(x["w"]) for x in cur)
    if w["punct"] or gap > 0.25 or len(cur) >= 3 or chars >= 14 or (nxt and chars + len(nxt["w"]) > 18):
        groups.append(cur); cur = []
if cur: groups.append(cur)

def ts(t):
    t = max(0, t); h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60
    return f"{h}:{m:02d}:{s:05.2f}"

head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Arial Black,84,&H00FFFFFF,&H00FFFFFF,&H00101018,&H80000000,1,0,0,0,100,100,0,0,1,8,3,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
lines = []
for g in groups:
    for j, w in enumerate(g):
        a = w["t"]
        b = g[j + 1]["t"] if j + 1 < len(g) else w["t"] + w["d"] + 0.18
        gi = groups.index(g)
        if gi + 1 < len(groups): b = min(b, groups[gi + 1][0]["t"] - 0.01)
        parts = []
        for k, x in enumerate(g):
            txt = x["w"].upper()
            parts.append(r"{\c&H3FD2FF&\fscx112\fscy112}" + txt + r"{\c&HFFFFFF&\fscx100\fscy100}" if k == j else txt)
        pop = r"{\an5\pos(540,1390)" + (r"\fscx88\fscy88\t(0,90,\fscx100\fscy100)" if j == 0 else "") + "}"
        lines.append(f"Dialogue: 0,{ts(a)},{ts(b)},Sub,,0,0,0,,{pop}{' '.join(parts)}")
open(ASS, "w", encoding="utf-8").write(head + "\n".join(lines) + "\n")
print(len(groups), "grupos")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", sys.argv[2], "-vf", "ass=" + ASS.replace(chr(92), "/"), "-c:v", "libx264", "-crf", "18", "-preset", "medium",
                "-c:a", "copy", sys.argv[3]], check=True)
print("ok", sys.argv[3])
