import { google } from 'googleapis';
import { readFile } from 'fs/promises';

// Carrega as credenciais do arquivo local
const key = JSON.parse(await readFile(new URL('./secret.json', import.meta.url)));
console.log('Credenciais carregadas com sucesso!');

export const SHEET_ID = "xxxxxxxxxxxxxxxxxxxxxxxxxxxx";

// Configura a autenticação JWT
const auth = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key.replace(/\\n/g, '\n'), // Importante para formatar a chave privada
  ['https://www.googleapis.com/auth/spreadsheets']
);

// Cria o cliente do Google Sheets
const sheets = google.sheets({ version: 'v4', auth });

export default sheets;