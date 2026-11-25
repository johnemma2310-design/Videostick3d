# Mezcla de «¿Y si el Sol se apaga?»: voz del narrador al frente + música y efectos sintetizados, todo a su cuadro.
# Uso: python -I mezcla.py public/voz.wav salida.wav
import subprocess, sys
import numpy as np

SR = 48000
TOTAL_F = 1707
L = TOTAL_F / 30
N = int(SR * L)
rng = np.random.default_rng(1707)
F = lambda f: f / 30
db = lambda x: 10 ** (x / 20)
music = np.zeros((N, 2), np.float32)
sfx = np.zeros((N, 2), np.float32)


def lp(x, k):
    k = max(1, int(k)); return np.convolve(x, np.ones(k) / k, "same")


def put(buf, sig, t0, gain_db, pan=0.0):
    i = int(t0 * SR)
    if i >= N or i < 0: return
    s = sig[: N - i] * db(gain_db)
    l, r = np.sqrt(0.5 * (1 - pan)) * 1.41, np.sqrt(0.5 * (1 + pan)) * 1.41
    buf[i:i + len(s), 0] += s * l; buf[i:i + len(s), 1] += s * r


def env(n, a, d):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / d)


def tone(f, dur, a=0.005, d=0.4, harm=(1, 0.5, 0.25)):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum(h * np.sin(2 * np.pi * f * (k + 1) * t) for k, h in enumerate(harm))
    return s * env(n, a, d)


def pluck(f, dur=0.6):  # Karplus-Strong: a soft guitar/ukulele note
    n = int(dur * SR); p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p); out = np.empty(n)
    for i in range(n):
        out[i] = buf[i % p]; buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * 0.996
    return out * env(n, 0.002, dur * 0.6)


def boom(dur=1.4, f0=70, f1=34, noise=0.4):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f1 + (f0 - f1) * np.exp(-t * 6)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * env(n, 0.003, dur * 0.35) + lp(rng.normal(0, 1, n), 6) * env(n, 0.001, 0.07) * noise


def whoosh(dur=0.9, peak=0.5, bright=8):
    n = int(dur * SR); t = np.arange(n) / SR
    e = np.exp(-((t - peak) / (dur * 0.28)) ** 2); w = rng.normal(0, 1, n)
    return (lp(w, 40) * 2.2 + (w - lp(w, bright)) * 0.25 * e) * e


def tick(hi=True):
    n = int(0.03 * SR)
    return np.sin(2 * np.pi * (3200 if hi else 2400) * np.arange(n) / SR) * env(n, 0.0005, 0.006) + (rng.normal(0, 1, n) - lp(rng.normal(0, 1, n), 3)) * env(n, 0.0002, 0.003) * 0.4


def sweep(f0, f1, dur, d=None):
    n = int(dur * SR); t = np.arange(n) / SR
    fr = f0 * (f1 / f0) ** (t / dur)
    return np.sin(2 * np.pi * np.cumsum(fr) / SR) * np.minimum(1, t / 0.05) * np.minimum(1, (dur - t) / 0.2) * (env(n, 0.01, d) if d else 1)


def chime(f, dur=1.6):
    return tone(f, dur, 0.002, 0.5, (1, 0.0, 0.3, 0, 0.12))


# ================= music =================
C, D, E, G, A = 261.6, 293.7, 329.6, 392.0, 440.0
day_prog = [(C, E, G), (A / 2, C, E), (D, A, D * 2 / 2 * 1.0), (G / 2, D, G)]
beat = 60 / 104
def day_music(t0, t1, gain):  # cheerful plucked arpeggios + soft bass, 104 bpm
    t, k = t0, 0
    while t < t1:
        ch = day_prog[(k // 8) % 4]
        note = ch[[0, 1, 2, 1][k % 4]] * (2 if k % 8 >= 4 else 1)
        put(music, pluck(note, 0.5), t, gain - 4, 0.25 * ((k % 2) * 2 - 1))
        if k % 4 == 0: put(music, tone(ch[0] / 2, beat * 2, 0.01, 0.6, (1, 0.3)), t, gain - 3)
        if k % 2 == 1: put(music, lp(rng.normal(0, 1, int(0.04 * SR)), 2) * env(int(0.04 * SR), 0.001, 0.01), t, gain - 14, 0.3)  # shaker
        t += beat / 2; k += 1
day_music(0.0, F(518), -20)
# night / space: a low dark pad
def pad(freqs, t0, t1, gain, a=1.0):
    n = int((t1 - t0) * SR); t = np.arange(n) / SR
    s = sum(np.sin(2 * np.pi * f * t + np.sin(2 * np.pi * 0.2 * t) * 0.6) for f in freqs) / len(freqs)
    s *= np.minimum(1, t / a) * np.minimum(1, (t1 - t0 - t) / 0.8)
    put(music, s, t0, gain)
pad([110, 164.8, 220], F(126), F(296), -26, 0.5)          # space, the pulse of light
pad([73.4, 110, 138.6], F(524), F(1030), -24, 1.5)        # night falls
pad([61.7, 92.5, 123.5, 185], F(1146), F(1520), -25, 1.0)  # frozen
day_music(F(1030), F(1146), -24)                           # the analogy (day)
day_music(F(1528), L, -19)                                 # the good news

# ================= effects =================
put(sfx, chime(1046.5), F(2), -18)                                     # the Sun
put(sfx, whoosh(1.0, 0.55), F(52) - 0.55, -20, -0.3)                   # down to Sticky
put(sfx, boom(1.0, 90, 50, 0.2), F(92), -17)                           # 8 minutos
put(sfx, whoosh(0.8, 0.4), F(127) - 0.4, -16)                          # to space
put(sfx, sweep(600, 2400, F(262 - 138)) * 0.5, F(138), -24)            # the light travelling
put(sfx, chime(1568, 1.2), F(262), -18)                                # it reaches the Earth
put(sfx, boom(1.2, 80, 45, 0.25), F(217), -16)                         # 150 millones
put(sfx, whoosh(0.8, 0.4), F(292) - 0.4, -17)                          # back to the park
for k, f in enumerate(range(300, 520, 15)):                            # the countdown ticks
    put(sfx, tick(k % 2 == 0), F(f), -16)
put(sfx, boom(2.2, 60, 26, 0.6), F(520), -6)                           # de golpe
put(sfx, sweep(900, 120, 1.0) * 0.4, F(520), -20)                      # the light goes off
put(sfx, sweep(700, 180, 0.7), F(602), -22)                            # the Moon dims
for k in range(6): put(sfx, chime(1318.5 * (1.0 + 0.25 * (k % 3)), 1.0), F(743) + k * 0.13, -26, (k % 3 - 1) * 0.6)  # stars twinkle
put(sfx, tone(98, 1.6, 0.05, 0.9, (1, 0.4)), F(797), -20)              # por desgracia
put(sfx, whoosh(1.0, 0.5), F(855) - 0.5, -16)                          # to space
put(sfx, boom(1.6, 70, 30, 0.3), F(923), -12)                          # sale disparada
put(sfx, whoosh(2.0, 0.6, 5), F(923), -12)
put(sfx, whoosh(0.8, 0.4), F(1031) - 0.4, -17)                         # the analogy
for f in range(1034, 1121, 16): put(sfx, whoosh(0.35, 0.17, 4), F(f), -20, 0.3)  # the rope whirls
put(sfx, whoosh(0.9, 0.3, 4), F(1121), -12, 0.5)                       # let go!
put(sfx, whoosh(1.0, 0.5), F(1147) - 0.5, -16)                         # to the frozen park
wind = lp(rng.normal(0, 1, int(F(1520 - 1146) * SR)), 90) * 6
wind *= (0.6 + 0.4 * np.sin(np.linspace(0, 14, len(wind)))) * np.minimum(1, np.minimum(np.arange(len(wind)) / SR / 0.6, (len(wind) / SR - np.arange(len(wind)) / SR) / 0.6))
put(sfx, wind, F(1146), -16)
for f in (1150, 1170, 1192, 1215, 1240, 1262): put(sfx, lp(rng.normal(0, 1, int(0.12 * SR)), 3) * env(int(0.12 * SR), 0.005, 0.03) * 0.5, F(f), -20)  # teeth chatter
put(sfx, boom(0.9, 120, 70, 0.1), F(1208), -16)                        # -18
for k in range(7):                                                      # the ice grows and cracks
    n = int(0.08 * SR); put(sfx, (rng.normal(0, 1, n) - lp(rng.normal(0, 1, n), 4)) * env(n, 0.0005, 0.015), F(1270) + k * 0.1, -12, (k % 3 - 1) * 0.4)
put(sfx, boom(1.4, 70, 34, 0.5), F(1292), -12)                          # frozen solid; -73
put(sfx, sweep(400, 90, 1.2), F(1345), -24)                             # plants die
put(sfx, whoosh(1.2, 0.6, 30), F(1410), -12)                            # dive under the ice
for k in range(22):                                                     # bubbles
    put(sfx, sweep(300 + 500 * rng.random(), 900 + 900 * rng.random(), 0.08, 0.03), F(1425) + k * 0.13 + 0.05 * rng.random(), -24, rng.uniform(-0.6, 0.6))
put(sfx, whoosh(0.8, 0.4), F(1520) - 0.4, -16)                          # back to daylight
put(sfx, chime(784, 2.0), F(1530), -16); put(sfx, chime(1046.5, 2.0), F(1536), -18)
put(sfx, boom(1.6, 80, 40, 0.3), F(1646), -14)                          # 5,000 millones
put(sfx, chime(1568, 2.2), F(1646), -18)

# ================= mix =================
voz = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True).stdout
v = np.frombuffer(voz, np.float32)[:N]
vv = np.zeros(N, np.float32); vv[:len(v)] = v
# duck the music under the voice (envelope of the voice, smoothed)
ve = lp(np.abs(vv), int(0.25 * SR)); ve /= ve.max() + 1e-9
duck = 1 - 0.45 * np.clip(ve * 4, 0, 1)
out = vv[:, None] * db(0) + music * duck[:, None] + sfx * db(-2)
k = int(0.25 * SR); out[-k:] *= np.linspace(1, 0, k)[:, None]
out *= db(-1) / max(1e-6, np.abs(out).max())
subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-",
                "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", sys.argv[2]], input=out.astype(np.float32).tobytes(), check=True)
print("ok", sys.argv[2])
