import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';
import pool from './db.js';
import initializeDatabase from './initDatabase.js';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'my-secret-key-32-bytes-long!!';
const ALGORITHM = 'aes-256-cbc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

initializeDatabase();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../client/dist')));

function encrypt(text) {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const key = crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

app.post('/api/comments', async (req, res) => {
  const { username, comment, xssProtectionEnabled } = req.body;

  try {
    let sanitizedComment = comment;
    if (xssProtectionEnabled) {
      sanitizedComment = sanitizeHtml(comment, {
        allowedTags: [],
        allowedAttributes: {}
      });
    }

    const query = 'INSERT INTO comments (username, comment, created_at) VALUES ($1, $2, NOW()) RETURNING *';
    const result = await pool.query(query, [username, sanitizedComment]);

    res.json({
      success: true,
      message: xssProtectionEnabled ? 'Komentar dodan (sanitiziran)' : 'Komentar dodan (NESIGURNO - XSS moguć!)',
      comment: result.rows[0],
      protected: xssProtectionEnabled
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Greška pri dodavanju komentara'
    });
  }
});

app.get('/api/comments', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM comments ORDER BY created_at DESC');
    res.json({
      success: true,
      comments: result.rows
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Greška pri dohvaćanju komentara'
    });
  }
});

app.delete('/api/comments', async (req, res) => {
  try {
    await pool.query('DELETE FROM comments');
    res.json({
      success: true,
      message: 'Svi komentari obrisani'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Greška pri brisanju komentara'
    });
  }
});

app.post('/api/sensitive-data', async (req, res) => {
  const { firstName, lastName, username, password, creditCard, encryptionEnabled } = req.body;

  try {
    let storedPassword = password;
    let storedCreditCard = creditCard;

    if (encryptionEnabled) {
      storedPassword = encrypt(password);
      storedCreditCard = encrypt(creditCard);
    }

    const query = `
      INSERT INTO sensitive_data (first_name, last_name, username, password, credit_card, is_encrypted)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    await pool.query(query, [
      firstName,
      lastName,
      username,
      storedPassword,
      storedCreditCard,
      encryptionEnabled
    ]);

    res.json({
      success: true,
      message: encryptionEnabled
        ? 'Podaci spremljeni - lozinka i kreditna kartica šifrirani (SIGURNO)'
        : 'Podaci spremljeni u PLAIN TEXTU (NESIGURNO!)',
      encrypted: encryptionEnabled
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Greška pri spremanju podataka'
    });
  }
});

app.get('/api/sensitive-data', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM sensitive_data ORDER BY created_at DESC');

    const rawData = result.rows.map(row => ({
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      username: row.username,
      password: row.password,
      credit_card: row.credit_card,
      is_encrypted: row.is_encrypted
    }));

    res.json({
      success: true,
      message: 'Prikazujem RAW podatke iz baze',
      data: rawData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Greška pri dohvaćanju podataka'
    });
  }
});

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Server i baza su aktivni' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server pokrenut na portu ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
