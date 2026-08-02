import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Default target Google Spreadsheet ID specified by user
  const DEFAULT_SPREADSHEET_ID = '1UbRAZHJXDXJrYpYk99mKZxny6D6zD48Eldo8Zevl0EA';

  // API Endpoint: Append game score record directly into Google Sheets using user OAuth
  app.post('/api/sheets/append', async (req, res) => {
    try {
      const accessToken = req.headers['x-goog-authenticated-user-token'] as string;
      const refreshToken = req.headers['x-goog-authenticated-user-refresh-token'] as string;

      const { spreadsheetId = DEFAULT_SPREADSHEET_ID, payload } = req.body;

      if (!payload) {
        return res.status(400).json({ success: false, error: 'Payload is required' });
      }

      if (!accessToken) {
        console.warn('OAuth Access Token missing in headers. Check browser iframe authorization.');
        return res.status(401).json({
          success: false,
          error: 'กรุณาอนุญาตสิทธิ์ Google Sheets ผ่านระบบ OAuth เพื่อส่งคะแนน'
        });
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });

      // Check if header row exists
      let existingRows: string[][] = [];
      try {
        const getRes = await sheets.spreadsheets.values.get({
          spreadsheetId,
          range: 'Sheet1!A1:N1',
        });
        existingRows = getRes.data.values || [];
      } catch (err) {
        console.log('Spreadsheet header check note:', err);
      }

      if (existingRows.length === 0) {
        // Create headers
        const headers = [
          'วันที่และเวลาที่เล่น',
          'รหัสนักศึกษา',
          'ชื่อ-นามสกุล',
          'กลุ่มเรียน',
          'ชื่อเล่น (Agent Codename)',
          'ระดับความยาก',
          'คะแนนที่ได้',
          'คะแนนเต็ม',
          'เปอร์เซ็นต์ (%)',
          'ตอบถูก (ข้อ)',
          'ตอบผิด (ข้อ)',
          'เวลาที่ใช้ (วินาที)',
          'ด่าน/โซนที่ผ่าน',
          'สถานะประเมิน'
        ];
        await sheets.spreadsheets.values.update({
          spreadsheetId,
          range: 'Sheet1!A1:N1',
          valueInputOption: 'USER_ENTERED',
          requestBody: {
            values: [headers]
          }
        });
      }

      const timestampStr = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

      const newRow = [
        timestampStr,
        payload.studentId || '-',
        payload.fullName || '-',
        payload.classGroup || '-',
        payload.nickname || '-',
        payload.difficulty || 'normal',
        payload.score ?? 0,
        payload.maxScore ?? 1650,
        `${payload.percentage ?? 0}%`,
        payload.correctCount ?? 0,
        payload.incorrectCount ?? 0,
        `${payload.timeSpentSeconds ?? 0} วินาที`,
        payload.levelReached || '-',
        payload.finalStatus || '-'
      ];

      const appendRes = await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Sheet1!A:N',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: {
          values: [newRow]
        }
      });

      console.log('Successfully appended row to Google Sheet:', appendRes.data);
      return res.json({
        success: true,
        message: 'ส่งข้อมูลลง Google Sheet เรียบร้อยแล้ว!',
        updatedRange: appendRes.data.updates?.updatedRange
      });
    } catch (error: any) {
      console.error('Error appending to Google Sheet:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'ไม่สามารถส่งข้อมูลลง Google Sheet ได้'
      });
    }
  });

  // API Endpoint: Read leaderboard from Google Sheet
  app.get('/api/sheets/read', async (req, res) => {
    try {
      const accessToken = req.headers['x-goog-authenticated-user-token'] as string;
      const refreshToken = req.headers['x-goog-authenticated-user-refresh-token'] as string;
      const spreadsheetId = (req.query.spreadsheetId as string) || DEFAULT_SPREADSHEET_ID;

      if (!accessToken) {
        return res.status(401).json({ success: false, error: 'OAuth Access Token missing' });
      }

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken,
      });

      const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
      const getRes = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'Sheet1!A2:N200',
      });

      const rows = getRes.data.values || [];
      const entries = rows.map((row, idx) => ({
        id: `sheet_row_${idx}`,
        syncTimestamp: row[0] || '',
        studentId: row[1] || '',
        fullName: row[2] || '',
        classGroup: row[3] || '',
        nickname: row[4] || '',
        difficulty: row[5] || 'normal',
        score: parseInt(row[6] || '0', 10),
        maxScore: parseInt(row[7] || '1650', 10),
        percentage: parseFloat((row[8] || '0').replace('%', '')),
        correctCount: parseInt(row[9] || '0', 10),
        incorrectCount: parseInt(row[10] || '0', 10),
        timeSpentSeconds: parseInt((row[11] || '0').replace(' วินาที', ''), 10),
        levelReached: row[12] || '',
        finalStatus: row[13] || '',
        avatarId: 'cyber-ninja',
        badgesEarned: ['Cyber Defender']
      }));

      return res.json({ success: true, entries });
    } catch (error: any) {
      console.error('Error reading Google Sheet:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
