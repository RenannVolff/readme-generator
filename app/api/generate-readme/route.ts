import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(request: NextRequest) {
  try {
    const { code, language, projectName } = await request.json()

    if (!code || !language) {
      return NextResponse.json({ error: "Código e linguagem são obrigatórios" }, { status: 400 })
    }

    const prompt = `
Você é um especialista em documentação de software. Analise o código fornecido e crie um README.md profissional e completo.

**Informações do projeto:**
- Nome: ${projectName}
- Linguagem: ${language}

**Código para análise:**
\`\`\`${language}
${code}
\`\`\`

**Instruções:**
1. Analise o código para entender sua funcionalidade, propósito e estrutura
2. Crie um README.md completo e profissional em português brasileiro
3. Inclua as seguintes seções quando relevantes:
   - Título do projeto
   - Descrição clara e concisa
   - Funcionalidades principais
   - Tecnologias utilizadas
   - Pré-requisitos
   - Como instalar/configurar
   - Como usar (com exemplos)
   - Estrutura do projeto (se aplicável)
   - Contribuição
   - Licença

4. Use markdown apropriado com formatação clara
5. Seja específico sobre as funcionalidades baseadas no código analisado
6. Inclua exemplos de uso quando possível
7. Mantenha um tom profissional mas acessível

Gere apenas o conteúdo do README.md, sem explicações adicionais.
`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      maxTokens: 2000,
    })

    return NextResponse.json({ readme: text })
  } catch (error) {
    console.error("Erro ao gerar README:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
