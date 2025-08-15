import { type NextRequest, NextResponse } from "next/server"
import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

interface GitHubRepo {
  name: string
  description: string
  language: string
  topics: string[]
  default_branch: string
}

interface GitHubFile {
  name: string
  path: string
  type: string
  download_url?: string
}

export async function POST(request: NextRequest) {
  try {
    const { githubUrl } = await request.json()

    if (!githubUrl) {
      return NextResponse.json({ error: "URL do GitHub é obrigatória" }, { status: 400 })
    }

    // Extrair owner e repo da URL
    const urlMatch = githubUrl.match(/github\.com\/([^/]+)\/([^/]+)/)
    if (!urlMatch) {
      return NextResponse.json({ error: "URL do GitHub inválida" }, { status: 400 })
    }

    const [, owner, repo] = urlMatch
    const cleanRepo = repo.replace(/\.git$/, "") // Remove .git se presente

    console.log("[v0] Analisando repositório:", owner, cleanRepo)

    // Buscar informações do repositório
    const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}`)
    if (!repoResponse.ok) {
      if (repoResponse.status === 404) {
        return NextResponse.json({ error: "Repositório não encontrado ou é privado" }, { status: 404 })
      }
      throw new Error(`Erro ao buscar repositório: ${repoResponse.status}`)
    }

    const repoData: GitHubRepo = await repoResponse.json()
    console.log("[v0] Dados do repositório obtidos:", repoData.name, repoData.language)

    // Buscar arquivos do repositório
    const filesResponse = await fetch(`https://api.github.com/repos/${owner}/${cleanRepo}/contents`)
    if (!filesResponse.ok) {
      throw new Error(`Erro ao buscar arquivos: ${filesResponse.status}`)
    }

    const filesData: GitHubFile[] = await filesResponse.json()
    console.log("[v0] Arquivos encontrados:", filesData.length)

    // Buscar conteúdo de arquivos importantes
    const importantFiles = ["package.json", "requirements.txt", "Cargo.toml", "go.mod", "pom.xml", "composer.json"]
    const codeFiles = filesData
      .filter(
        (file) =>
          file.type === "file" &&
          (importantFiles.includes(file.name) ||
            file.name.match(/\.(js|ts|py|java|go|rs|php|rb|cpp|c|cs)$/) ||
            file.name.toLowerCase().includes("main") ||
            file.name.toLowerCase().includes("index") ||
            file.name.toLowerCase().includes("app")),
      )
      .slice(0, 5) // Limitar a 5 arquivos para não sobrecarregar

    let fileContents = ""
    for (const file of codeFiles) {
      if (file.download_url) {
        try {
          const contentResponse = await fetch(file.download_url)
          if (contentResponse.ok) {
            const content = await contentResponse.text()
            // Limitar o tamanho do conteúdo para evitar tokens excessivos
            const truncatedContent = content.length > 2000 ? content.substring(0, 2000) + "..." : content
            fileContents += `\n\n**${file.path}:**\n\`\`\`\n${truncatedContent}\n\`\`\`\n`
          }
        } catch (error) {
          console.log("[v0] Erro ao buscar conteúdo do arquivo:", file.path, error)
        }
      }
    }

    console.log("[v0] Conteúdo dos arquivos coletado, gerando README...")

    // Gerar README usando IA
    const prompt = `
Você é um especialista em documentação de software. Analise as informações do repositório GitHub fornecido e crie um README.md profissional e completo.

**Informações do Repositório:**
- Nome: ${repoData.name}
- Descrição: ${repoData.description || "Sem descrição"}
- Linguagem Principal: ${repoData.language || "Não especificada"}
- Tópicos: ${repoData.topics?.join(", ") || "Nenhum"}
- Branch Principal: ${repoData.default_branch}

**Estrutura de Arquivos Analisados:**
${filesData.map((file) => `- ${file.name} (${file.type})`).join("\n")}

**Conteúdo dos Arquivos Principais:**
${fileContents}

**Instruções:**
1. Analise todas as informações fornecidas para entender o propósito e funcionalidade do projeto
2. Crie um README.md completo e profissional em português brasileiro
3. Inclua as seguintes seções quando relevantes:
   - Título do projeto (use o nome do repositório)
   - Descrição clara e detalhada baseada na análise
   - Funcionalidades principais (baseadas no código analisado)
   - Tecnologias utilizadas (identifique pelas dependências e arquivos)
   - Pré-requisitos (baseado na linguagem e dependências)
   - Como instalar/configurar (específico para a tecnologia)
   - Como usar (com exemplos baseados no código)
   - Estrutura do projeto (baseada nos arquivos encontrados)
   - Contribuição
   - Licença

4. Use markdown apropriado com formatação clara
5. Seja específico sobre as funcionalidades baseadas na análise real do código
6. Inclua comandos de instalação e uso apropriados para a linguagem/framework
7. Mantenha um tom profissional mas acessível
8. Se identificar frameworks específicos (React, Express, Django, etc.), inclua instruções específicas

Gere apenas o conteúdo do README.md, sem explicações adicionais.
`

    const { text } = await generateText({
      model: groq("llama-3.3-70b-versatile"),
      prompt,
      maxTokens: 3000,
    })

    console.log("[v0] README gerado com sucesso")

    return NextResponse.json({ readme: text })
  } catch (error) {
    console.error("[v0] Erro ao gerar README do GitHub:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    )
  }
}
