import { Experiment } from '@/types/models';

const now = new Date();
const iso = (d: Date) => d.toISOString();

export const experiments: Experiment[] = [
  {
    id: 'ex-1',
    labId: 'lab-cs-101',
    createdByUserId: 'u-stu-1',
    title: 'FFT Analysis of Mixed Signals',
    description: 'Analyzing frequency components using oscilloscope data and FFT algorithms',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 72)),
    documents: [
      {
        id: 'doc-1',
        type: 'REPORT',
        title: 'FFT Analysis Report',
        url: '/docs/fft-analysis-report.pdf',
        version: 1,
        uploadedByUserId: 'u-stu-1',
        uploadedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 70)),
      },
      {
        id: 'doc-2',
        type: 'RESULT',
        title: 'Signal Spectrum PNG',
        url: '/docs/signal-spectrum.png',
        version: 1,
        uploadedByUserId: 'u-stu-1',
        uploadedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 69)),
      },
    ],
  },
  {
    id: 'ex-2',
    labId: 'lab-elec-201',
    createdByUserId: 'u-fac-1',
    title: 'Power Supply Load Regulation',
    description: 'Measuring voltage stability under varying loads',
    createdAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 10)),
    documents: [
      {
        id: 'doc-3',
        type: 'SOP',
        title: 'PSU Test Procedure',
        url: '/docs/psu-test-sop.pdf',
        version: 3,
        uploadedByUserId: 'u-fac-1',
        uploadedAt: iso(new Date(now.getTime() - 1000 * 60 * 60 * 9)),
      },
    ],
  },
];
