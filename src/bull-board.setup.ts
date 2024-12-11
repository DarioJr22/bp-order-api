import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { createBullBoard } from '@bull-board/api';
import { Queue } from 'bullmq';
const express = require('express'); // Corrigindo a importação do Express

export function setupBullBoard(queues: Queue[]) {
    const serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/admin/queues');

    createBullBoard({
        queues: queues.map(queue => new BullMQAdapter(queue)),
        serverAdapter,
    });

    const app = express();
    app.use('/admin/queues', serverAdapter.getRouter());

    const port = 3001;
    app.listen(port, () => {
        console.log(`Bull Board is running on http://localhost:${port}/admin/queues`);
    });
}
