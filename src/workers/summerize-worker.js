import { calculatePeaks } from '../strategies/calculate/peak';
import { calculateRms } from '../strategies/calculate/rms';

self.onmessage = (message) => {
    const height = message.data.height;
    const width = message.data.width;
    const canvas = message.data.canvas;
    const waveform = [message.data.low, message.data.high]
    const ctx = canvas.getContext('2d');

    const scale = height / 2;
    ctx.clearRect(0, 0, width, height);
    ctx.beginPath();

    for (let i = 0; i < waveform.length; i++) {
        const minHeight = (waveform[i][0] * scale) + scale;
        const maxHeight = (waveform[i][1] * scale) + scale;
        const height = maxHeight - minHeight;
        ctx.rect(i, minHeight, 1, height);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.commit();
}