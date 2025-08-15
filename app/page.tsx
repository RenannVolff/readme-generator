"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Copy, Code2, Sparkles, FileText, Zap, Github, Link } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const languages = [
  { value: "javascript", label: "JavaScript", color: "bg-yellow-500" },
  { value: "typescript", label: "TypeScript", color: "bg-blue-500" },
  { value: "python", label: "Python", color: "bg-green-500" },
  { value: "java", label: "Java", color: "bg-orange-500" },
  { value: "csharp", label: "C#", color: "bg-purple-500" },
  { value: "cpp", label: "C++", color: "bg-blue-600" },
  { value: "go", label: "Go", color: "bg-cyan-500" },
  { value: "rust", label: "Rust", color: "bg-orange-600" },
  { value: "php", label: "PHP", color: "bg-indigo-500" },
  { value: "ruby", label: "Ruby", color: "bg-red-500" },
]

export default function ReadmeGenerator() {
  const [code, setCode] = useState("")
  const [language, setLanguage] = useState("")
  const [projectName, setProjectName] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [readme, setReadme] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const generateReadme = async () => {
    if (!code.trim() || !language) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, insira o código e selecione a linguagem.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-readme", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          language,
          projectName: projectName || "Meu Projeto",
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao gerar README")
      }

      const data = await response.json()
      setReadme(data.readme)
      toast({
        title: "README gerado com sucesso!",
        description: "Seu README foi criado automaticamente.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível gerar o README. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateReadmeFromGithub = async () => {
    if (!githubUrl.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Por favor, insira a URL do repositório GitHub.",
        variant: "destructive",
      })
      return
    }

    const githubRegex = /^https:\/\/github\.com\/[\w\-.]+\/[\w\-.]+\/?$/
    if (!githubRegex.test(githubUrl.trim())) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida do GitHub (ex: https://github.com/usuario/repositorio).",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-readme-github", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          githubUrl: githubUrl.trim(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao gerar README")
      }

      const data = await response.json()
      setReadme(data.readme)
      toast({
        title: "README gerado com sucesso!",
        description: "Seu README foi criado baseado no repositório GitHub.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Não foi possível gerar o README. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(readme)
      toast({
        title: "Copiado!",
        description: "README copiado para a área de transferência.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o README.",
        variant: "destructive",
      })
    }
  }

  const downloadReadme = () => {
    const blob = new Blob([readme], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "README.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                README Generator
              </h1>
              <p className="text-sm text-muted-foreground">Crie READMEs profissionais automaticamente com IA</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-blue-500" />
                  Configuração do Projeto
                </CardTitle>
                <CardDescription>
                  Escolha como gerar seu README: analisando código ou repositório GitHub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="code" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="code" className="flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      Código Manual
                    </TabsTrigger>
                    <TabsTrigger value="github" className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      Repositório GitHub
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="code" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Nome do Projeto (opcional)</label>
                      <input
                        type="text"
                        placeholder="Ex: Minha API REST"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Linguagem de Programação *</label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a linguagem" />
                        </SelectTrigger>
                        <SelectContent>
                          {languages.map((lang) => (
                            <SelectItem key={lang.value} value={lang.value}>
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${lang.color}`} />
                                {lang.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Código do Projeto *</label>
                      <Textarea
                        placeholder="Cole aqui o código principal do seu projeto..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                    </div>

                    <Button
                      onClick={generateReadme}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Gerando README...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Gerar README
                        </>
                      )}
                    </Button>
                  </TabsContent>

                  <TabsContent value="github" className="space-y-4 mt-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">URL do Repositório GitHub *</label>
                      <div className="relative">
                        <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="url"
                          placeholder="https://github.com/usuario/repositorio"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Cole a URL completa do repositório público no GitHub
                      </p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Github className="w-5 h-5 text-blue-500 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Análise Automática do Repositório
                          </h4>
                          <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            A IA analisará a estrutura do projeto, arquivos principais, linguagens utilizadas e
                            dependências para criar um README completo e contextualizado.
                          </p>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={generateReadmeFromGithub}
                      disabled={isGenerating}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analisando Repositório...
                        </>
                      ) : (
                        <>
                          <Github className="w-4 h-4 mr-2" />
                          Gerar README do GitHub
                        </>
                      )}
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Recursos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Badge variant="secondary" className="justify-center py-2">
                    IA Avançada
                  </Badge>
                  <Badge variant="secondary" className="justify-center py-2">
                    Multi-linguagem
                  </Badge>
                  <Badge variant="secondary" className="justify-center py-2">
                    Análise GitHub
                  </Badge>
                  <Badge variant="secondary" className="justify-center py-2">
                    Download Direto
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Output Section */}
          <div>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-green-500" />
                      README Gerado
                    </CardTitle>
                    <CardDescription>Seu README personalizado aparecerá aqui</CardDescription>
                  </div>
                  {readme && (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={copyToClipboard}>
                        <Copy className="w-4 h-4 mr-1" />
                        Copiar
                      </Button>
                      <Button variant="outline" size="sm" onClick={downloadReadme}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {readme ? (
                  <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 max-h-[600px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">{readme}</pre>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <FileText className="w-16 h-16 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">
                      Insira seu código ou URL do GitHub e clique em "Gerar README" para começar
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
