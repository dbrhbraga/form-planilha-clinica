import express from 'express';
import { z, ZodError } from 'zod'; 
import sheets, { SHEET_ID } from './client.js';

const app = express();

// Schema de validação atualizado com horários
const formularioSchema = z.object({
    nome: z.string().min(3, { message: "Insira o nome válido" }),
    email: z.string().email({ message: "E-mail inválido" }),
    telefone: z.string()
        .min(10, { message: "Telefone deve ter pelo menos 10 dígitos" })
        .max(11, { message: "Telefone deve ter no máximo 11 dígitos" })
        .regex(/^\d+$/, { message: "Telefone deve conter apenas números" }),
    idade: z.number()
        .int({ message: "Idade deve ser um número inteiro" })
        .min(1, { message: "Idade mínima é 1 ano" })
        .max(105),
    cidadeuf: z.string()
        .min(2, { message: "Cidade/UF inválida" }),
    genero: z.string()
        .min(1, { message: "Selecione um gênero" }),
    profissao: z.string()
        .min(2)
        .max(50),
    acompanhamento: z.enum(["Sim", "Não"], {
        errorMap: () => ({ message: "Selecione uma opção válida" })
    }),
    valor: z.string().optional(),
    horarios: z.array(z.string())
        .min(1, { message: "Selecione pelo menos um horário" })
});

// Middlewares
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Rota para envio de formulário
app.post('/send-message', async (req, res) => {
    try {
        // Validação dos dados
        const body = formularioSchema.parse(req.body);
        
        // Preparação dos dados para a planilha
        const rowData = [
            body.nome,
            body.email,
            body.telefone,
            body.idade,
            body.cidadeuf,
            body.genero,
            body.profissao,
            body.acompanhamento,
            body.valor || "",
            body.horarios.join(", ") // Junta os horários em uma string separada por vírgulas
        ];

        console.log('Dados validados:', rowData);

        // Envio para o Google Sheets
        const response = await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'data!A:J', // Atualizado para incluir a coluna de horários
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: {
                values: [rowData],
            },
        });

        console.log('Dados salvos no Sheets:', response.data);
        res.status(200).json({ 
            success: true, 
            message: "Dados enviados com sucesso!" 
        });

    } catch (error) {
        console.error('Erro no processamento:', error);
        
        if (error instanceof ZodError) {
            // Formata erros de validação para resposta
            const errors = error.errors.map(err => ({
                field: err.path[0],
                message: err.message
            }));
            
            // Mapeia o erro de horários para o campo correto
            const formattedErrors = errors.map(error => {
                if (error.field === 'horarios') {
                    return {
                        field: 'horarios',
                        message: 'Selecione pelo menos um horário'
                    };
                }
                return error;
            });
            
            res.status(400).json({ 
                success: false, 
                errors: formattedErrors 
            });
        } else {
            res.status(500).json({ 
                success: false, 
                message: "Erro interno no servidor" 
            });
        }
    }
});

// Rota de health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Inicia o servidor
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
    console.log('Endpoints:');
    console.log('POST /send-message - Envia dados do formulário');
    console.log('GET /health - Verifica status do servidor');
});