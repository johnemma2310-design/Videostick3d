# Banda sonora 100 % sintetizada (sin voz) para «Cómo ganó Alejandro en Gaugamela», 9.83 s.
# Cada efecto cae en su cuadro (30 fps). Uso: python sonido.py salida.wav
import subprocess, sys
import numpy as np

SR = 48000
L = 295 / 30
N = int(SR * L)
rng = np.random.default_rng(331)
out = np.zeros((N, 2), np.float32)
F = lambda f: f / 30
db = lambda x: 10 ** (x / 20)
t_all = np.arange(N) / SR


def lp(x, a):  # one-pole low-pass, a in (0,1): smaller = darker
    y = np.empty_like(x); acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc); y[i] = acc
    return y


def lp_fast(x, k):  # moving-average low-pass (vectorised)
    k = max(1, int(k)); return np.convolve(x, np.ones(k) / k, "same")


def put(sig, t0, gain_db, pan=0.0):
    i = int(t0 * SR)
    if i >= N: return
    s = sig[: N - i] * db(gain_db)
    l, r = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    out[i:i + len(s), 0] += s * l * 1.41; out[i:i + len(s), 1] += s * r * 1.41


def env(n, a, d):  # attack / exponential decay (seconds)
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def boom(dur=1.2, f0=70, f1=38, noise=0.35):  # cinematic impact: pitch-dropping sine + noisy crack
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f1 + (f0 - f1) * np.exp(-t * 6); ph = 2 * np.pi * np.cumsum(fr) / SR
    s = np.sin(ph) * env(n, 0.003, dur * 0.35)
    s += lp_fast(rng.normal(0, 1, n), 6) * env(n, 0.001, 0.06) * noise
    return s


def drum(f0=95):  # taiko-ish war drum
    n = int(0.7 * SR); t = np.arange(n) / SR
    fr = f0 * (1 + 0.6 * np.exp(-t * 30)); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) * env(n, 0.002, 0.18) + lp_fast(rng.normal(0, 1, n), 10) * env(n, 0.001, 0.03) * 0.5


def whoosh(dur=0.9, peak=0.6, bright=8):  # filtered noise swell, peaks at `peak` seconds
    n = int(dur * SR); t = np.arange(n) / SR
    e = np.exp(-((t - peak) / (dur * 0.28)) ** 2)
    w = rng.normal(0, 1, n)
    lo = lp_fast(w, 40); hi = w - lp_fast(w, bright)
    return (lo * 2.2 + hi * 0.25 * e) * e


def hoof():
    n = int(0.09 * SR)
    return lp_fast(rng.normal(0, 1, n), 14) * env(n, 0.001, 0.018) * 1.6 + np.sin(2 * np.pi * 120 * np.arange(n) / SR) * env(n, 0.001, 0.03)


def horn(freqs, dur, a=0.25, vib=4.5):  # brass-ish: stacked saws through a low-pass, slow attack
    n = int(dur * SR); t = np.arange(n) / SR
    s = np.zeros(n)
    for k, f in enumerate(freqs):
        fv = f * (1 + 0.004 * np.sin(2 * np.pi * vib * t + k))
        ph = np.cumsum(fv) / SR
        s += 2 * (ph % 1) - 1
    s = lp_fast(s / len(freqs), 9)
    e = np.minimum(1, t / a) * np.minimum(1, (dur - t) / 0.35)
    return s * e


# ---- fire crackle + low roar under everything ----
fire = np.zeros(N)
for t0 in np.sort(rng.uniform(0, L, 300)):
    i = int(t0 * SR); m = min(int(SR * rng.uniform(0.004, 0.03)), N - i)
    fire[i:i + m] += rng.normal(0, 1, m) * np.exp(-np.arange(m) / (m / 4)) * rng.uniform(0.2, 1.0)
roar = lp_fast(rng.normal(0, 1, N), 300) * 8
bed = fire * 0.45 + roar * 0.55; bed /= np.abs(bed).max()
fade = np.minimum(1, np.minimum(t_all / 0.4, (L - t_all) / 0.4))
put(bed * fade, 0, -24)
# dark drone (two detuned low saws)
dr = horn([55, 55.4, 82.5], L, a=0.6, vib=0.3) * fade
put(dr, 0, -25)

# ---- 1 · Alejandro ----
put(horn([146.8, 220, 293.7], 1.6, a=0.08), F(1), -15, -0.2)      # cuerno de guerra
put(boom(1.0, 80, 40), F(1), -11)
put(whoosh(1.0, 0.55), F(28) - 0.55, -15, -0.4)                   # pasamos frente a él
put(whoosh(1.6, 1.0, 4), F(62) - 1.0, -15, 0.3)                    # subimos: su ejército
put(boom(1.4, 60, 34), F(50), -9)                                  # 47,000
# ---- 2 · Darío ----
put(whoosh(0.8, 0.4), F(72) - 0.4, -14)                            # cambio de lugar
put(horn([138.6, 207.7], 1.2, a=0.1), F(74), -18, 0.3)            # cuerno persa, más grave
put(whoosh(1.0, 0.6), F(92) - 0.6, -16, 0.4)
put(whoosh(1.6, 1.0, 4), F(120) - 1.0, -14, -0.3)                  # subimos: nunca termina
put(boom(1.8, 55, 30, 0.5), F(110), -7)                            # 100,000
# ---- 3 · la carga ----
for k, f in enumerate(range(132, 174, 7)):                         # tambores que aceleran
    put(drum(90 if k % 2 else 75), F(f), -10 + k * 0.4, (-1) ** k * 0.2)
for f in range(166, 174, 3): put(drum(110), F(f), -9)
t = F(132)
while t < F(174):                                                   # galope
    for j, off in enumerate((0, 0.06, 0.13, 0.19)):
        put(hoof(), t + off, -13 + rng.uniform(-2, 1), rng.uniform(-0.5, 0.5))
    t += 0.36
put(horn([146.8, 185, 220, 293.7], 1.4, a=0.05), F(146), -13)      # ¡A la carga!
# cámara lenta: todo se hunde, un whoosh largo y grave, golpes de casco lentos
put(boom(2.6, 45, 22, 0.2), F(174), -8)
put(lp_fast(whoosh(2.0, 1.1, 30), 20), F(176), -6)
for f in (180, 188, 196): put(lp_fast(hoof(), 30) * 2, F(f), -8)
put(whoosh(0.9, 0.85, 3), F(198), -14)                             # sale de la cámara lenta
# ---- 4 · Darío huye ----
put(boom(1.6, 70, 32, 0.6), F(206), -6)                            # choque
t = F(208)
while t < F(250):
    for off in (0, 0.05, 0.11, 0.16):
        put(hoof(), t + off, -14 + rng.uniform(-2, 1), rng.uniform(-0.6, 0.6))
    t += 0.3
put(whoosh(1.0, 0.5), F(214) - 0.5, -15)
put(horn([207.7, 196, 185], 1.0, a=0.05), F(214), -19)              # cuerno que cae: derrota
# ---- 5 · victoria ----
put(whoosh(0.8, 0.4), F(250) - 0.4, -14)
put(boom(1.8, 75, 36, 0.4), F(258), -7)
for k, ch in enumerate(([146.8, 185, 220], [196, 246.9, 293.7], [220, 277.2, 329.6, 440])):  # fanfarria
    put(horn(ch, 1.4 if k < 2 else 1.6, a=0.04), F(258) + k * 0.36, -12, (k - 1) * 0.2)
for f in (258, 270, 282): put(drum(80), F(f), -8)
cheer = np.zeros(int(1.6 * SR))
for _ in range(60):  # muchas voces: ráfagas de ruido formante
    n = int(SR * rng.uniform(0.3, 0.9)); i = int(rng.uniform(0, 0.6) * SR)
    v = rng.normal(0, 1, n); v = lp_fast(v, rng.integers(4, 9)) - lp_fast(v, 60)
    cheer[i:i + n] += v[: len(cheer) - i] * np.hanning(n)[: len(cheer) - i]
cheer /= np.abs(cheer).max()
put(cheer, F(258), -12)

# ---- final: tail fade on the last frame, limit, loudness -14 LUFS ----
k = int(0.25 * SR); out[-k:] *= np.linspace(1, 0, k)[:, None]
out *= db(-1) / max(1e-6, np.abs(out).max())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "loudnorm=I=-14:TP=-1.5:LRA=9", "-ar", "48000", sys.argv[1]], input=out.astype(np.float32).tobytes(), check=True)
print("ok", sys.argv[1])
