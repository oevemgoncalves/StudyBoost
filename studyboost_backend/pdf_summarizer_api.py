from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # para ajudar com o CORS
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from gtts import gTTS
import requests
import fitz  # PyMuPDF
import os
import re
import io
import json
import uuid
import google.generativeai as genai
import traceback

load_dotenv() # carrega as variáveis do .env

app = FastAPI()

# 🔼 Configure CORS aqui
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500",
        "http://127.0.0.1:5502",
        "http://localhost:5502",
        "https://study-boost-smoky.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# 🔐 chave da API do Gemini (Google AI)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# Lista de modelos em ordem de preferência (com fallback automático caso algum seja descontinuado)
GEMINI_MODELS = [
    os.getenv("GEMINI_MODEL", "models/gemini-3.8-flash"),
    "models/gemini-2.5-flash",
    "models/gemini-flash-latest",
]

def generate_with_gemini(prompt: str):
    last_error = None
    for model_name in GEMINI_MODELS:
        try:
            model = genai.GenerativeModel(model_name)
            return model.generate_content(prompt)
        except Exception as e:
            last_error = e
            if "404" in str(e) or "not found" in str(e).lower() or "no longer available" in str(e).lower():
                print(f"⚠️ Modelo {model_name} indisponível, tentando próximo fallback...")
                continue
            raise e
    raise last_error

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
    temp_filename = f"{uuid.uuid4()}.pdf"
    try:
        print("✅ Endpoint /gerar-resumo acionado")
        print("🔗 URL recebida:", req.pdf_url)
        # 🔽 Baixa o PDF do Cloudinary (ou qualquer URL pública)
        response = requests.get(req.pdf_url, timeout=30)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Erro ao baixar o PDF")

        # 📁 Salva temporariamente com um nome único
        with open(temp_filename, "wb") as f:
            f.write(response.content)

        # 📄 Extrai o texto
        texto = extract_text_from_pdf(temp_filename)

        if not texto.strip():
            raise HTTPException(status_code=400, detail="PDF está vazio ou não contém texto extraível")

        # 💡 Solicita resumo à IA Gemini
        response = generate_with_gemini(f"Resuma o conteúdo abaixo de forma clara e organizada para estudo:\n\n{texto}")

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

        return {"resumo": resumo}

    except HTTPException:
        raise
    except Exception as e:
        print("❌ ERRO COMPLETO:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")
    finally:
        # 🧼 Garante remoção do arquivo temporário mesmo em caso de erro
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except OSError:
                pass


class ResumoRequest(BaseModel):
    resumo: str

@app.post("/gerar-flashcards-e-quiz")
async def gerar_flashcards_e_quiz(req: ResumoRequest):
    try:
        print("✅ Endpoint /gerar-flashcards-e-quiz acionado")

        prompt = f"""
        A partir do resumo abaixo, gere:

        1️⃣ Uma lista com no máximo 16 flashcards no seguinte formato JSON:
        [
        {{ "pergunta": "Pergunta", "resposta": "Resposta" }},
        ...
        ]

        2️⃣ Em seguida, uma lista com no máximo 21 perguntas de quiz no seguinte formato JSON:
        [
        {{
            "pergunta": "Pergunta",
            "alternativas": ["Opção A", "Opção B", "Opção C", "Opção D"],
            "correta": 0
        }},
        ...
        ]

        ⚠️ IMPORTANTE:
        - Responda apenas com o JSON no seguinte formato final:
        {{ "flashcards": [...], "quiz": [...] }}
        - Não inclua explicações ou textos extras.

        RESUMO:
        {req.resumo}
        """

        response = generate_with_gemini(prompt)

        raw_text = response.candidates[0].content.parts[0].text

        # Tenta localizar o JSON puro
        json_start = raw_text.find('{')
        json_end = raw_text.rfind('}') + 1
        json_str = raw_text[json_start:json_end]

        resultado = json.loads(json_str)

        return resultado

    except Exception as e:
        print("❌ ERRO ao gerar flashcards e quiz:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao gerar flashcards e quiz: {str(e)}")


class AudioRequest(BaseModel):
    texto: str

@app.post("/gerar-audio")
async def gerar_audio(req: AudioRequest):
    try:
        # Remove tags HTML caso o texto venha formatado em HTML
        texto_limpo = re.sub(r'<[^>]+>', ' ', req.texto)
        texto_limpo = re.sub(r'\s+', ' ', texto_limpo).strip()

        if not texto_limpo:
            raise HTTPException(status_code=400, detail="Texto vazio para geração de áudio.")

        # Gera o áudio em memória a partir do texto recebido
        tts = gTTS(text=texto_limpo, lang='pt-br')
        mp3_fp = io.BytesIO()
        tts.write_to_fp(mp3_fp)
        mp3_fp.seek(0)

        return StreamingResponse(
            mp3_fp,
            media_type="audio/mpeg",
            headers={"Content-Disposition": 'inline; filename="resumo.mp3"'}
        )

    except HTTPException:
        raise
    except Exception as e:
        print("❌ Erro ao gerar áudio:", e)
        raise HTTPException(status_code=500, detail=f"Erro ao gerar áudio: {str(e)}")
