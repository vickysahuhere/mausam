import math
import struct
import wave
import os
import random

def synthesize_soft_drum(f0, duration_s=0.28, decay=18.0, warmth=0.8, sample_rate=22050):
    num_samples = int(sample_rate * duration_s)
    samples = []
    
    phase_01 = 0.0
    phase_11 = 0.0
    phase_21 = 0.0
    
    # Circular membrane modal ratios
    m01 = 1.000
    m11 = 1.593
    m21 = 2.135
    
    # Low-pass filter state for soft mallet / fingertip strike
    lp_noise = 0.0
    
    for i in range(num_samples):
        t = i / sample_rate
        
        # Gentle pitch settling (tension drop from fingertip touch)
        pitch_drop = math.exp(-45.0 * t)
        f_cur = f0 * (1.0 + 0.18 * pitch_drop)
        
        phase_01 += 2.0 * math.pi * (f_cur * m01) / sample_rate
        phase_11 += 2.0 * math.pi * (f_cur * m11) / sample_rate
        phase_21 += 2.0 * math.pi * (f_cur * m21) / sample_rate
        
        # Envelopes
        env_01 = math.exp(-decay * t)
        env_11 = math.exp(-decay * 2.5 * t) * 0.35
        env_21 = math.exp(-decay * 4.0 * t) * 0.15
        
        # Resonant modal sound
        drum_body = (
            math.sin(phase_01) * env_01 +
            math.sin(phase_11) * env_11 +
            math.sin(phase_21) * env_21
        )
        
        # Soft cushioned fingertip tap (mellow lowpass noise)
        tap_env = math.exp(-180.0 * t) if t < 0.035 else 0.0
        white = random.uniform(-1.0, 1.0)
        lp_noise += 0.12 * (white - lp_noise) # ~400Hz soft fingertip thud
        tap_sound = lp_noise * tap_env * 0.35
        
        # Soft sub-harmonic roundness
        sub_body = math.sin(phase_01 * 0.5) * env_01 * 0.15 * warmth
        
        sample = drum_body * 0.75 + tap_sound + sub_body
        samples.append(sample)
        
    return samples

def generate_bongo_tune():
    sr = 22050
    total_sec = 1.55
    total_samples = int(sr * total_sec)
    mix = [0.0] * total_samples
    
    random.seed(42)
    
    # Musical notes for bongos:
    # Hembra (low drum) = 220 Hz (A3)
    # Macho (high drum) = 293 Hz (D4) and 330 Hz (E4)
    # Rhythmic pattern: cute bouncy bongo groove
    pattern = [
        (0.00, 220, 0.28, 16.0, 0.75),  # Ba (low)
        (0.18, 293, 0.24, 20.0, 0.85),  # da (mid)
        (0.38, 220, 0.26, 17.0, 0.70),  # ba (low)
        (0.52, 293, 0.22, 22.0, 0.80),  # da (mid)
        (0.68, 330, 0.32, 18.0, 0.95),  # dum! (high sweet ring)
        (0.92, 220, 0.24, 19.0, 0.70),  # tap (low)
        (1.06, 293, 0.22, 22.0, 0.75),  # tap (mid)
        (1.20, 330, 0.35, 14.0, 0.90),  # pop! (final high chime)
    ]
    
    for start_t, freq, dur, dec, vel in pattern:
        drum_hit = synthesize_soft_drum(freq, duration_s=dur, decay=dec, sample_rate=sr)
        start_idx = int(start_t * sr)
        for j, s in enumerate(drum_hit):
            if start_idx + j < total_samples:
                mix[start_idx + j] += s * vel
                
    # Normalize with gentle headroom
    peak = max(abs(s) for s in mix) or 1.0
    int_samples = [int(max(-1.0, min(1.0, s / peak * 0.82)) * 32767) for s in mix]
    
    wav_path = os.path.abspath("scratch/soft_bongo_tune.wav")
    with wave.open(wav_path, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(2)
        wf.setframerate(sr)
        wf.writeframes(struct.pack(f'<{len(int_samples)}h', *int_samples))
        
    print("Generated soft bongo tune:", wav_path, f"{len(int_samples)} samples, size: {os.path.getsize(wav_path)} bytes")
    
    # Play test via MCI
    import ctypes
    import time
    mci = ctypes.windll.winmm.mciSendStringW
    mci("close all", None, 0, None)
    mci(f'open "{wav_path}" type waveaudio alias b', None, 0, None)
    mci("play b", None, 0, None)
    time.sleep(1.8)
    mci("close b", None, 0, None)
    print("Played successfully!")

if __name__ == '__main__':
    generate_bongo_tune()
