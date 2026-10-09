import { authenticateConfig } from './authenticate-inputs.mjs';
const {request} = authenticateConfig();
const {measureAll,encodeReport} = await import('./first-draw-core.mjs');
process.stdout.write(encodeReport(measureAll(request)));
