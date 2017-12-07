import { calculatePeaks } from '../strategies/calculate/peak';
import { calculateRms } from '../strategies/calculate/rms';

self.onmessage = (message) => {
    const data = message.data;
    switch(data.type) {
        case 'peak':
            return calculatePeaks(1024, data.samplesPerPixel)
    }
}