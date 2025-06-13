
from weakref import ref
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware #para ajudar com o CORS
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import fitz  # PyMuPDF
import os
import re
import uuid
import google.generativeai as genai
import traceback
import json

load_dotenv() #carrega as variáveis do .env

app = FastAPI()

# 🔼 Configure CORS aqui
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5502", "https://study-boost-smoky.vercel.app"],  # Ou ["*"] para permitir todos (apenas desenvolvimento)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    #expose_headers=["*"]  # Adicione esta linha
)

def gerar_tabela_html(linhas):
            tabela_html = '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse: collapse; width: 100%;">\n<thead><tr><th>Categoria</th><th>Descrição</th></tr></thead><tbody>\n'
            for linha in linhas:
                partes = linha.split(':', 1)
                if len(partes) == 2:
                    chave = partes[0].strip()
                    valor = partes[1].strip()
                    tabela_html += f"<tr><td><strong>{chave}</strong></td><td>{valor}</td></tr>\n"
            tabela_html += "</tbody></table>\n"
            return tabela_html

@app.get("/")
def read_root():
    return {"msg": "API online!"}

# 🔐 Substitua pela sua chave da API do Gemini (Google AI)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Modelo da requisição esperada
class PDFRequest(BaseModel):
    pdf_url: str

# Função para extrair texto de um PDF
def extract_text_from_pdf(pdf_path):
    text = ""
    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()
    return text

@app.post("/gerar-resumo")
async def gerar_resumo(req: PDFRequest):
    try:
        print("✅ Endpoint /gerar-resumo acionado")
        print("🔗 URL recebida:", req.pdf_url)
        # 🔽 Baixa o PDF do Cloudinary (ou qualquer URL pública)
        response = requests.get(req.pdf_url)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Erro ao baixar o PDF")

        # 📁 Salva temporariamente com um nome único
        temp_filename = f"{uuid.uuid4()}.pdf"
        with open(temp_filename, "wb") as f:
            f.write(response.content)

        # 📄 Extrai o texto
        texto = extract_text_from_pdf(temp_filename)

        # print("🧪 Texto extraído do PDF (primeiros 500 caracteres):")
        # print(texto[:500]) 

        # 🧼 Remove o arquivo temporário
        os.remove(temp_filename)

        if not texto.strip():
            raise HTTPException(status_code=400, detail="PDF está vazio")

        # 💡 Solicita resumo à IA Gemini
        model = genai.GenerativeModel("models/gemini-2.0-flash")
        response = model.generate_content(f"Resuma o conteúdo abaixo de forma clara e organizada para estudo:\n\n{texto}")

        texto_bruto = response.candidates[0].content.parts[0].text

        # Limpeza básica do Markdown: remove **, *, ##, #
        texto_limpo = re.sub(r'[*#]{1,3}', '', texto_bruto).strip()

        linhas = texto_limpo.split('\n')

        html_formatado = ""
        em_lista = False
        em_tabela = False
        tabela_temp = []

        for linha in linhas:
            linha = linha.strip()
            if not linha:
                continue

            # Detecta título (linha curta e sem pontuação final)
            if len(linha) <= 80 and not linha.endswith('.'):
                if em_lista:
                    html_formatado += "</ul>\n"
                    em_lista = False
                if em_tabela:
                    html_formatado += gerar_tabela_html(tabela_temp)
                    tabela_temp = []
                    em_tabela = False
                html_formatado += f"<h2>{linha}</h2>\n"

            # Detecta lista
            elif re.match(r'^[-•]', linha):
                if not em_lista:
                    html_formatado += "<ul>\n"
                    em_lista = True
                item = re.sub(r'^[-•]\s*', '', linha)
                html_formatado += f"<li>{item}</li>\n"

            # Detecta linha tabular com "dimensão: valor" ou estrutura de dados
            elif re.match(r'^[A-ZÁÉÍÓÚÃÕÇa-záéíóúâêîôûãõç0-9\s\-()]+:\s', linha):
                em_tabela = True
                tabela_temp.append(linha)

            else:
                if em_lista:
                    html_formatado += "</ul>\n"
                    em_lista = False
                if em_tabela:
                    html_formatado += gerar_tabela_html(tabela_temp)
                    tabela_temp = []
                    em_tabela = False
                html_formatado += f"<p>{linha}</p>\n"

        # Fecha blocos abertos
        if em_lista:
            html_formatado += "</ul>\n"
        if em_tabela:
            html_formatado += gerar_tabela_html(tabela_temp)

        resumo = html_formatado

        # Gerar Quiz
        quiz_prompt = f"Crie 21 perguntas de múltipla escolha com 4 alternativas cada, e a indicação da alternativa correta (0, 1, 2 ou 3), baseadas no seguinte texto. Formate como um array JSON de objetos: `[{{'pergunta': '', 'alternativas': ['', '', '', ''], 'correta': 0}}, ...]`\n\n{texto}"
        quiz_response = model.generate_content(quiz_prompt)
        quiz_data_raw = quiz_response.candidates[0].content.parts[0].text
        quiz_data = json.loads(quiz_data_raw) # Parseia para JSON

         # Gerar Flashcards
        flashcards_prompt = f"Crie 16 flashcards (pergunta e resposta) baseados no seguinte texto. Formate como um array JSON de objetos: `[{{'pergunta': '', 'resposta': ''}}, ...]`\n\n{texto}"
        flashcards_response = model.generate_content(flashcards_prompt)
        flashcards_data_raw = flashcards_response.candidates[0].content.parts[0].text
        flashcards_data = json.loads(flashcards_data_raw) # Parseia para JSON


        return {"resumo": resumo,
                "quiz": quiz_data,
                "flashcards": flashcards_data
                }

    except Exception as e:
        print("❌ ERRO COMPLETO:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")


# url = "https://res.cloudinary.com/dyqp5onvs/raw/upload/v1749671411/jsrwmwnf78iymaa30o8b.pdf"
# res = requests.get(url)
# print(res.status_code)
# print(res.headers.get("Content-Type"))



