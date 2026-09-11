import math
import struct
import wave
import os
import random

def synthesize_bongo_hit(freq_start, freq_end, duration_s, decay_rate, strike_bright=0.3, sample_rate=44100):
    num_samples = int(sample_rate * duration_s)
    samples = []
    
    phase_01 = 0.0
    phase_11 = 0.0
    phase_21 = 0.0
    
    # Modes for circular membrane
    m01 = 1.000
    m11 = 1.593
    m21 = 2.135
    
    # Noise state for finger-strike transient
    noise_lp = 0.0
    
    for i in range(num_samples):
        t = i / sample_rate
        progress = t / duration_s
        
        # Pitch drop on impact (initial tension release)
        pitch_env = math.exp(-35.0 * t)
        f_current = freq_end + (freq_start - freq_end) * pitch_env
        
        # Phase increment
        phase_01 += 2.0 * math.pi * (f_current * m01) / sample_rate
        phase_11 += 2.0 * math.pi * (f_current * m11) / sample_rate
        phase_21 += 2.0 * math.pi * (f_current * m21) / sample_rate
        
        # Mode decays: higher modes decay much faster
        amp_01 = math.exp(-decay_rate * t)
        amp_11 = math.exp(-decay_rate * 2.8 * t) * 0.45
        amp_21 = math.exp(-decay_rate * 4.5 * t) * 0.20
        
        tone = (
            math.sin(phase_01) * amp_01 +
            math.sin(phase_11) * amp_11 +
            math.sin(phase_21) * amp_21
        )
        
        # Warm finger strike "thwack" transient (first 8ms)
        strike_env = math.exp(-350.0 * t) if t < 0.025 else 0.0
        white = random.uniform(-1.0, 1.0)
        noise_lp += 0.25 * (white - noise_lp)
        strike = noise_lp * strike_env * strike_bright
        
        val = (tone * 0.85 + strike * 0.35)
        samples.append(val)
        
    return samples

def create_bongo_tune():
    sr = 44100
    total_duration = 1.8 # 1.8 seconds total
    total_samples = int(sr * total_duration)
    track = [0.0] * total_samples
    
    # Bongo tuning:
    # Macho (high bongo): ~380Hz down to ~330Hz, quick crisp ring
    # Hembra (low bongo): ~220Hz down to ~180Hz, warm deep body
    
    # Rhythm pattern: Playful Caribbean / Latin cat bongo groove!
    # "Ba-dum, ba-da-dum, tap tap, cha!"
    # Timing (seconds), drum_type, velocity
    hits = [
        (0.00, 'low',  0.75),   # Ba
        (0.18, 'high', 0.85),   # dum
        (0.40, 'low',  0.70),   # ba
        (0.54, 'high', 0.80),   # da
        (0.68, 'low',  0.75),   # dum
        (0.92, 'high', 0.90),   # tap
        (1.08, 'high', 0.70),   # tap
        (1.24, 'high', 0.95),   # cha! (accented high pop)
    ]
    
    random.seed(1337)
    
    for start_t, drum, vel in hits:
        if drum == 'high':
            # High bongo
            hit_samples = synthesize_bongo_hit(
                freq_start=410,
                freq_end=330,
                duration_s=0.28,
                decay_rate=22.0,
                strike_bright=0.45,
                sample_rate=sr
            )
        else:
            # Low bongo
            hit_samples = synthesize_bongo_hit(
                freq_start=240,
                freq_end=175,
                duration_s=0.38,
                decay_rate=14.0,
                strike_bright=0.25,
                sample_rate=sr
            )
            
        start_idx = int(start_t * sr)
        for j, s in enumerate(hit_samples):
            if start_idx + j < total_samples:
                track[start_idx + j] += s * vel
                
    # Normalize
    max_val = max(abs(s) for s in track) or 1.0
    int_samples = [int(max(-1.0, min(1.0, s / max_val * 0.85)) * 32767) for s in track]
    
    wav_path = os.path.abspath("scratch/bongo_rhythm.wav")
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(struct.pack(f'<{len(int_samples)}h', *int_samples))
        
    print("Bongo rhythm generated:", wav_path, f"{len(int_samples)} samples")
    import ctypes
    import time
    mci = ctypes.windll.winmm.mciSendStringW
    mci("close all", None, 0, None)
    mci(f'open "{wav_path}" type waveaudio alias b', None, 0, None)
    mci("play b", None, 0, None)
    time.sleep(2.0)
    mci("close b", None, 0, None)
    print("Playback finished!")

if __name__ == '__main__':
    create_bongo_tune()
