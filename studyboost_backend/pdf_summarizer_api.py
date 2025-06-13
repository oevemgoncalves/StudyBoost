from weakref import ref
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware #para ajudar com o CORS
from pydantic import BaseModel
from dotenv import load_dotenv
import requests
import fitz  # PyMuPDF
import os
import uuid
import google.generativeai as genai
import traceback

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

        resumo = response.candidates[0].content.parts[0].text


        if not resumo:
            raise HTTPException(status_code=500, detail="Resumo retornado pela IA está vazio.")
        # print("🧠 RESUMO FINAL A SER ENVIADO PARA O FRONT:")
        # print(resumo)
        print("Tipo do retorno da IA:", type(response))

        return {"resumo": resumo}

    except Exception as e:
        print("❌ ERRO COMPLETO:")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erro ao processar PDF: {str(e)}")


# url = "https://res.cloudinary.com/dyqp5onvs/raw/upload/v1749671411/jsrwmwnf78iymaa30o8b.pdf"
# res = requests.get(url)
# print(res.status_code)
# print(res.headers.get("Content-Type"))



