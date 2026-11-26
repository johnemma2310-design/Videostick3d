# Mezcla voz + música + efectos sintetizados para los shorts de Sticky. Uso:
#   python -I audio/mezcla.py apagon|luna|rotacion public/voz_<x>.wav out/<x>_mezcla.wav [out/<x>_mudo.mp4]
# Un video sin entrada propia aquí (p. ej. musculo) usa una mezcla genérica (música alegre + pads suaves) y toma la
# duración del 4.º argumento (el video mudo) con ffprobe.
import subprocess, sys
from functools import lru_cache
import numpy as np

SR = 48000
name, voz_path, out_path = sys.argv[1], sys.argv[2], sys.argv[3]
KNOWN = {"apagon": 1753, "luna": 1647, "rotacion": 1581, "gravedad": 1483, "outro": 326}
def frames_of(path):
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", path], capture_output=True, text=True, check=True).stdout
    return int(round(float(out.strip()) * 30))
TOTAL = KNOWN[name] if name in KNOWN else frames_of(sys.argv[4])
L = TOTAL / 30; N = int(SR * L)
rng = np.random.default_rng(7)
F = lambda f: f / 30
db = lambda x: 10 ** (x / 20)
music = np.zeros((N, 2), np.float32); sfx = np.zeros((N, 2), np.float32)


def lp(x, k): k = max(1, int(k)); return np.convolve(x, np.ones(k) / k, "same")
def put(buf, sig, t0, gain, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    s = sig[: N - i] * db(gain); l, r = np.sqrt(0.5 * (1 - pan)) * 1.41, np.sqrt(0.5 * (1 + pan)) * 1.41
    buf[i:i + len(s), 0] += s * l; buf[i:i + len(s), 1] += s * r
def env(n, a, d): t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)
def tone(f, dur, a=0.005, d=0.4, harm=(1, 0.5, 0.25)):
    n = int(dur * SR); t = np.arange(n) / SR
    return sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm)) * env(n, a, d)
@lru_cache(maxsize=None)
def pluck(f, dur=0.5):
    n = int(dur * SR); p = max(2, int(SR / f)); reps = n // p + 2
    buf = np.random.default_rng(int(f)).uniform(-1, 1, p); out = np.empty(reps * p)
    for r in range(reps): out[r * p:(r + 1) * p] = buf; buf = 0.5 * (buf + np.roll(buf, -1)) * 0.996
    return out[:n] * env(n, 0.002, dur * 0.6)
def boom(dur=1.4, f0=70, f1=34, noise=0.4):
    n = int(dur * SR); t = np.arange(n) / SR; fr = f1 + (f0 - f1) * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.003, dur * 0.35) + lp(rng.normal(0, 1, n), 6) * env(n, 0.001, 0.07) * noise
def whoosh(dur=0.9, peak=0.5, bright=8):
    n = int(dur * SR); t = np.arange(n) / SR; e = np.exp(-((t - peak) / (dur * 0.28)) ** 2); w = rng.normal(0, 1, n)
    return (lp(w, 40) * 2.2 + (w - lp(w, bright)) * 0.25 * e) * e
def sweep(f0, f1, dur):
    n = int(dur * SR); t = np.arange(n) / SR; fr = f0 * (f1 / f0) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.2)
def chime(f, dur=1.6): return tone(f, dur, 0.002, 0.5, (1, 0.0, 0.3, 0, 0.12))
def noise_bed(dur, k=90, mod=14):
    n = int(dur * SR); w = lp(rng.normal(0, 1, n), k) * 6; w *= 0.6 + 0.4 * np.sin(np.linspace(0, mod, n))
    tt = np.arange(n) / SR; return w * np.minimum(1, np.minimum(tt / 0.5, (dur - tt) / 0.5))
def bark():
    n = int(0.18 * SR); t = np.arange(n) / SR
    return np.sin(2 * np.pi * (500 - 1200 * t) * t) * env(n, 0.005, 0.05) + lp(rng.normal(0, 1, n), 4) * env(n, 0.002, 0.04) * 0.4
def meow():
    n = int(0.5 * SR); t = np.arange(n) / SR; fr = 600 + 300 * np.sin(np.pi * t / 0.5)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.sin(np.pi * t / 0.5) * 0.6
def crowd_gasp(dur=1.2):
    out = np.zeros(int(dur * SR))
    for _ in range(30):
        n = int(SR * rng.uniform(0.2, 0.6)); i = int(rng.uniform(0, 0.3) * SR); v = rng.normal(0, 1, n); v = lp(v, rng.integers(4, 9)) - lp(v, 60)
        m = min(n, len(out) - i); out[i:i + m] += v[:m] * np.hanning(n)[:m]
    return out / (np.abs(out).max() + 1e-9)
def horn():
    n = int(0.5 * SR); t = np.arange(n) / SR; s = sum(np.sign(np.sin(2 * np.pi * f * t)) for f in (330, 415)) / 2
    return lp(s, 6) * np.minimum(1, t / 0.02) * np.minimum(1, (0.5 - t) / 0.05)

C, D, E, G, A = 261.6, 293.7, 329.6, 392.0, 440.0
PROG = [(C, E, G), (A / 2, C, E), (D, A / 2 * 2, D * 1.5), (G / 2, D, G)]
def happy(t0, t1, gain, bpm=104):
    beat = 60 / bpm; t, k = t0, 0
    while t < t1:
        ch = PROG[(k // 8) % 4]; note = ch[[0, 1, 2, 1][k % 4]] * (2 if k % 8 >= 4 else 1)
        put(music, pluck(round(note, 1)), t, gain - 4, 0.25 * ((k % 2) * 2 - 1))
        if k % 4 == 0: put(music, tone(ch[0] / 2, beat * 2, 0.01, 0.6, (1, 0.3)), t, gain - 3)
        t += beat / 2; k += 1
def pad(freqs, t0, t1, gain, a=1.0):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.2 * t) * 0.6) for f in freqs) / len(freqs)
    put(music, s * np.minimum(1, t / a) * np.minimum(1, (t1 - t0 - t) / 0.8), t0, gain)
DARK, COLD, SPACE = [73.4, 110, 138.6], [61.7, 92.5, 123.5, 185], [110, 164.8, 220]

if name == "apagon":
    happy(0, F(168), -21)
    put(sfx, noise_bed(F(168), 60, 4), 0, -26)                                       # city hum
    for f in (20, 70, 120): put(sfx, horn(), F(f), -28, 0.5)                        # traffic
    put(sfx, boom(2.4, 60, 24, 0.6), F(168), -6); put(sfx, sweep(900, 100, 1.0) * 0.4, F(168), -18)
    put(sfx, crowd_gasp(), F(170), -16)
    pad(DARK, F(175), F(1020), -25, 1.5)
    for f in (201, 221, 261): put(sfx, whoosh(0.7, 0.35), F(f) - 0.35, -20)
    for k in range(5): put(sfx, chime(1568 + 200 * k, 0.4), F(349) + k * 0.12, -26, 0.4)  # phones
    put(sfx, sweep(800, 200, 0.8), F(575), -18)                                       # no signal
    for f in (622, 805, 1291): put(sfx, boom(1.2, 90, 50, 0.2), F(f), -15)            # HORA x
    for k in range(10): put(sfx, tone(900 + 200 * rng.random(), 0.06, 0.001, 0.02), F(686) + k * 0.35, -26)  # drip
    put(sfx, bark(), F(925), -18, 0.5); put(sfx, meow(), F(960), -20, -0.4)
    for k in range(6): put(sfx, chime(1318.5 * (1 + 0.25 * (k % 3)), 1.0), F(1124) + k * 0.13, -24, (k % 3 - 1) * 0.6)
    put(sfx, tone(98, 1.6, 0.05, 0.9, (1, 0.4)), F(1163), -20)
    happy(F(1291), F(1425), -23)
    pad(DARK, F(1430), L, -25, 1.0)
    put(sfx, crowd_gasp(1.6), F(1584), -14)
    for k in range(8): put(sfx, chime(1046.5 * (1 + 0.25 * (k % 4)), 1.4), F(1704) + k * 0.1, -20, (k % 3 - 1) * 0.5)
elif name == "luna":
    pad(SPACE, 0, F(30), -24, 0.5)
    put(sfx, sweep(1400, 200, 0.5), F(30), -14); put(sfx, boom(1.6, 70, 30, 0.3), F(31), -10); put(sfx, crowd_gasp(), F(34), -16)
    put(sfx, bark(), F(10), -20, 0.4); put(sfx, bark(), F(16), -22, 0.4)
    pad(DARK, F(40), F(130), -25)
    pad(SPACE, F(124), F(380), -24, 0.6); put(sfx, whoosh(1.0, 0.5), F(124) - 0.5, -16)
    put(sfx, sweep(1200, 200, 0.4), F(265), -16)
    pad(DARK, F(374), F(770), -25, 1.0)
    surf = noise_bed(F(1000 - 374), 140, 30); put(sfx, surf, F(374), -20)
    for f in (465, 555, 680): put(sfx, chime(1046.5, 1.0), F(f), -20)
    happy(F(764), F(1000), -22)
    put(sfx, tone(98, 1.6, 0.05, 0.9, (1, 0.4)), F(909), -20)
    pad(SPACE, F(994), F(1300), -24, 0.6); put(sfx, whoosh(1.0, 0.5), F(994) - 0.5, -16)
    put(sfx, sweep(200, 90, 1.4), F(1254), -18)
    for f in range(1294, 1404, 9): put(sfx, whoosh(0.3, 0.15, 4), F(f), -20, rng.uniform(-0.6, 0.6))
    put(sfx, crowd_gasp(1.2), F(1300), -18)
    happy(F(1410), L, -21)
    put(sfx, boom(1.2, 90, 50, 0.2), F(1529), -15); put(sfx, chime(1568, 1.6), F(1614), -18)
elif name == "gravedad":
    # short para niños: música animada todo el rato + un efecto en cada corte (whoosh / pop / boing / golpe)
    CUTS = [40, 80, 118, 165, 215, 250, 284, 320, 358, 398, 440, 488, 533, 575, 628, 668, 712, 778, 822, 860, 898, 945, 1000, 1048, 1085, 1120, 1160, 1198, 1252, 1290, 1325, 1360, 1410]  # v2: 34 tomas
    def pop(): return tone(700, 0.09, 0.001, 0.03)
    def boing(): return sweep(220, 700, 0.28) * 0.7
    happy(0, F(1240), -21, 124)
    for k, f in enumerate(CUTS):
        if f in (1252, 1290): continue
        kind = k % 4
        if kind == 0: put(sfx, whoosh(0.5, 0.25, 6), F(f) - 0.2, -17, 0.4 * (-1) ** k)
        elif kind == 1: put(sfx, pop(), F(f), -16, 0.3 * (-1) ** k)
        elif kind == 2: put(sfx, boing(), F(f), -19, 0.3 * (-1) ** k)
        else: put(sfx, boom(0.5, 110, 55, 0.3), F(f), -17)
    put(sfx, sweep(900, 200, 0.5), F(30), -16); put(sfx, pop(), F(8), -14)            # salto
    put(sfx, crowd_gasp(1.2), F(166), -16)                                             # todo flota
    put(sfx, meow(), F(300), -16, -0.4); put(sfx, bark(), F(225), -17, 0.4)
    for f in (392, 416): put(sfx, boing(), F(f), -18, 0.3)                              # gallinas / vaca
    put(sfx, horn(), F(480), -24, 0.5); put(sfx, noise_bed(F(60), 40, 8), F(584), -24)  # claxon, burbujas
    for k in range(5): put(sfx, pop(), F(590) + k * 0.2, -22, (k % 3 - 1) * 0.6)
    put(sfx, boom(0.6, 120, 60, 0.3), F(695), -15); put(sfx, chime(1568, 0.8), F(750), -18)  # pesas, ¡fuerza!
    for f in (1200, 1218, 1232): put(sfx, tone(880, 0.12, 0.001, 0.06), F(f), -13)     # 3, 2, 1
    put(sfx, tone(1320, 0.3, 0.001, 0.12), F(1252), -13)
    put(sfx, boom(2.4, 60, 24, 0.7), F(FALL := 1261), -5); put(sfx, whoosh(0.8, 0.3, 4), F(1261), -12); put(sfx, crowd_gasp(1.2), F(1262), -14)
    for k, f in enumerate((1281, 1284, 1288, 1292, 1296, 1300)): put(sfx, boom(0.5, 100 - 8 * k, 40, 0.5), F(f), -11 - k, (k % 3 - 1) * 0.5)  # todo aterriza
    put(sfx, boing(), F(1300), -17); put(sfx, whoosh(0.5, 0.25, 6), F(1350) - 0.2, -17)
    put(sfx, sweep(900, 200, 0.7), F(1360), -17); put(sfx, boom(1.0, 90, 40, 0.5), F(1384), -7); put(sfx, bark(), F(1392), -16, 0.4)
    happy(F(1290), L, -22, 124)
    put(sfx, chime(1568, 1.4), F(1448), -16)
    for f in (1138, 1152, 1166): put(sfx, tone(330, 0.12, 0.001, 0.05), F(f), -13)                # ¡toc! (elevador)
    for f in (1311, 1346): put(sfx, boom(0.5, 95, 40, 0.5), F(f), -12)                       # pupitres / cama caen
    put(sfx, chime(1175, 0.9), F(1412), -17)                                                 # cameo: invitado especial
elif name == "outro":
    happy(0, L, -19)
    put(sfx, tone(880, 0.12, 0.001, 0.05), F(28), -14)            # button pops in
    put(sfx, tone(2400, 0.04, 0.0005, 0.01), F(47), -10)           # click
    for k in range(3): put(sfx, chime(1568 + 300 * k, 0.8), F(48) + k * 0.08, -16)  # bell
    put(sfx, tone(660, 0.12, 0.001, 0.05), F(90), -14)             # comment bubble
    put(sfx, tone(520, 0.25, 0.002, 0.12), F(158), -12); put(sfx, tone(1040, 0.2, 0.002, 0.1), F(162), -14)  # cartel cameo
elif name != "rotacion":
    # genérica para videos nuevos (largos): música alegre suave con descansos de pad cada ~40 s y un golpe en cada corte
    t0 = 0.0
    while t0 < L:
        t1 = min(L, t0 + 40); happy(t0, t1, -24)
        if t1 < L: pad(SPACE, t1 - 1, min(L, t1 + 8), -26, 1.0); put(sfx, whoosh(1.0, 0.5), t1 - 0.5, -20)
        t0 = t1 + 8
else:
    happy(0, F(66), -21)
    put(sfx, boom(1.6, 70, 30, 0.5), F(40), -10); put(sfx, crowd_gasp(1.4), F(66), -14); put(sfx, whoosh(1.4, 0.3, 4), F(66), -10)
    pad(SPACE, F(104), F(372), -24, 0.6); put(sfx, whoosh(1.0, 0.5), F(104) - 0.5, -16)
    for k in range(4): put(sfx, whoosh(0.6, 0.3, 6), F(150 + k * 50), -20, 0.5)
    put(sfx, boom(1.2, 90, 50, 0.2), F(242), -15); put(sfx, boom(1.2, 90, 50, 0.2), F(321), -15)
    happy(F(366), F(410), -22)
    put(sfx, boom(2.2, 55, 24, 0.7), F(410), -6)
    for f, g in ((461, -10), (497, -12), (522, -12), (546, -11)): put(sfx, whoosh(1.2, 0.25, 4), F(f), g, 0.5)
    put(sfx, crowd_gasp(1.6), F(497), -14); put(sfx, bark(), F(524), -16, 0.4); put(sfx, meow(), F(530), -18, -0.3)
    pad(DARK, F(410), F(1045), -26, 0.5)
    put(sfx, noise_bed(F(70), 30, 3), F(630), -18)
    put(sfx, sweep(900, 300, 0.4) * 0.6, F(700), -14); put(sfx, boom(1.0, 80, 40, 0.4), F(706), -10); put(sfx, whoosh(1.0, 0.2, 4), F(706), -12)
    put(sfx, noise_bed(F(1051 - 847), 20, 20), F(847), -12)                          # hurricane wind
    put(sfx, boom(2.6, 45, 20, 0.6), F(984), -6)                                     # the wave
    happy(F(1045), F(1272), -24, 90)
    put(sfx, tone(98, 1.6, 0.05, 0.9, (1, 0.4)), F(1187), -20)
    pad(SPACE, F(1266), F(1446), -24, 0.6)
    happy(F(1440), L, -21)
    put(sfx, boom(1.2, 90, 50, 0.2), F(1506), -15); put(sfx, chime(1568, 1.6), F(1548), -18)

voz = subprocess.run(["ffmpeg", "-v", "error", "-i", voz_path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
v = np.frombuffer(voz, np.float32)[:N]; vv = np.zeros(N, np.float32); vv[:len(v)] = v
ve = lp(np.abs(vv), int(0.25 * SR)); ve /= ve.max() + 1e-9
duck = 1 - 0.45 * np.clip(ve * 4, 0, 1)
out = vv[:, None] + music * duck[:, None] + sfx * db(-2)
k = int(0.25 * SR); out[-k:] *= np.linspace(1, 0, k)[:, None]
out *= db(-1) / max(1e-6, np.abs(out).max())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", out_path],
               input=out.astype(np.float32).tobytes(), check=True)
print("ok", out_path)
