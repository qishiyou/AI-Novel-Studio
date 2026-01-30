import React from 'react'
import { BookOpen, PenTool, Sparkles, Layers, Wand2, Download } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/landing/navbar'
import { Footer } from '@/components/landing/footer'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 pt-32 pb-20">
        <div className="space-y-4 mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">使用指南</h1>
          <p className="text-xl text-muted-foreground font-light">
            欢迎来到 AI Novel Studio。本指南将帮助您快速上手，开启您的 AI 驱动创作之旅。
          </p>
        </div>


        <div className="space-y-20">
          {/* Step 1 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">1. 构思创意</h2>
            </div>
            <div className="pl-16 space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                一切从一个简单的想法开始。您可以输入一个简短的故事简介、特定的主题、或者您想要探索的冲突。AI 将根据您的输入，为您提供初步的故事大纲和角色设定建议。
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground/80">
                <li>输入故事的核心概念</li>
                <li>选择您喜欢的类型（玄幻、都市、科幻等）</li>
                <li>设定故事的整体基调</li>
              </ul>
            </div>
          </section>

          {/* Step 2 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
                <Layers className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">2. 构建大纲</h2>
            </div>
            <div className="pl-16 space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                使用我们强大的大纲管理工具。AI 会根据您的创意生成结构化的章节建议。您可以自由调整章节顺序，添加关键情节，或者让 AI 为特定章节生成更详细的子大纲。
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground/80">
                <li>自动生成多级大纲</li>
                <li>灵活拖拽调整结构</li>
                <li>设定每个章节的写作目标</li>
              </ul>
            </div>
          </section>

          {/* Step 3 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                <PenTool className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">3. 智能写作</h2>
            </div>
            <div className="pl-16 space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                进入核心写作界面。您可以手动写作，或者利用 AI 辅助功能：续写、扩写、改写，甚至让 AI 帮您描写复杂的动作场景或优美的环境描写。
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground/80">
                <li>AI 续写与智能建议</li>
                <li>沉浸式写作环境</li>
                <li>实时字数统计与进度追踪</li>
              </ul>
            </div>
          </section>

          {/* Step 4 */}
          <section className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                <Download className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">4. 导出与发布</h2>
            </div>
            <div className="pl-16 space-y-4">
              <p className="leading-relaxed text-muted-foreground">
                完成作品后，您可以一键导出为多种格式。我们支持主流的小说平台格式要求，让您的发布过程更加顺畅。
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground/80">
                <li>支持 Word、PDF、EPUB 等格式</li>
                <li>平台适配导出优化</li>
                <li>云端永久保存，随时取用</li>
              </ul>
            </div>
          </section>
        </div>

        <div className="mt-24 p-8 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 text-center space-y-6">
          <h3 className="text-2xl font-bold text-white">准备好开始了吗？</h3>
          <p className="text-zinc-400">
            现在就加入 AI Novel Studio，释放您的创作潜能。
          </p>
          <Button asChild size="lg" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold px-8 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Link href="/auth/login">立即登录</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  )
}
