import * as chalk from 'chalk';
import * as express from 'express';
import * as path from 'path';
import * as fs from 'fs-extra';
import * as cors from 'cors';
import { getEnv } from '../env/env';
import * as opn from 'opn'

getEnv();

const app = express();
app.use(cors({
    origin: 'https://trace.playwright.dev',
}));

const traceDirPath = path.join(__dirname, '../../../test-results/trace');
const reportDirPath = path.join(__dirname, '../../../test-results/reports');

app.use('/report', express.static(reportDirPath));

app.get('/', (req, res) => {
    res.redirect('/report');
});

// Custom middleware for downloading specific trace files
app.get('/trace/:filename', (req, res, next) => {
    const filePath = path.join(traceDirPath, req.params.filename);
    if (fs.existsSync(filePath) && filePath.endsWith('.zip')) {
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename=${req.params.filename}`);
        res.sendFile(filePath);
    } else {
        next();
    }
});

const port = process.env.REPORT_PORT
app.listen(port, () => {
    console.log(chalk.green('====================================================================================='));
    console.log('\t\t🚀 View test report at: ' + chalk.blue(`http://localhost:${port}/report/ 🚀`));
    console.log(chalk.green('====================================================================================='));

    console.log('\n' + 'Press CTRL+C to stop the server') + '\n';

    opn(`http://localhost:${port}/report/`);
});