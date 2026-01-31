
import { streamChatCompletion, DEEPSEEK_MODELS } from '@/lib/deepseek';

export async function POST(req: Request) {
  try {
    const { title, theme, genre, structure, chapter, wordsPerChapter, previousChapter, guidance, strictMode, isContinue } = await req.json();

    // Validate structure and characters
    if (!structure || !structure.mainCharacters || !Array.isArray(structure.mainCharacters)) {
      console.error('Invalid or missing characters in structure:', structure);
      throw new Error('故事架构中缺少角色信息，请先生成故事架构');
    }

    const systemPrompt = `你是一位专业的小说创作者。请根据小说大纲和上下文，${isContinue ? '补全/续写' : '创作'}第 ${chapter.number} 章的正文内容。
要求：
1. **严格遵循章节大纲**：必须且仅能围绕提供的【本章创作任务】中的大纲内容进行展开。
2. 描写生动细腻，注重环境渲染和心理刻画，对话自然流畅。
3. **情节衔接**：必须紧密衔接${isContinue ? '当前正文的末尾' : '上一章的末尾'}内容。
   ${isContinue ? '- **核心任务**：检测当前正文是否在句中或段落中途突然断开（断崖式中断），并从断开的那个字开始，丝滑地补全并继续写下去。\n   - 保持语气、风格、人称完全一致，确保读者读起来没有任何断裂感。' : '- 如果上一章在某个场景 or 对话中结束，本章应自然延续或从合理的时空跳转开始。'}
4. **字数控制**：
   ${isContinue ? '- **字数要求**：本次续写字数建议在 1000 到 2000 字之间，目的是补全内容并使情节完整，不需要达到长篇幅要求。\n   - 如果本章任务已接近完成，请寻找合适的切入点进行收尾，不要为了凑字数而强行拉长。' : `- 本章正文字数**必须${strictMode ? '不得低于' : '达到约为'} ${wordsPerChapter} 字**。\n   - ${strictMode ? '这是一项硬性指标。如果情节不足以支撑该字数，请通过增加环境细节描写、人物内心独白、细腻的动作刻画以及生动的对话来丰富内容。严禁敷衍了事。' : '请尽量保证内容丰富且完整。'}`}
5. **纯净正文输出**：仅输出小说正文段落，不要包含标题、Markdown 标签或任何解释性文字。
6. **完整性**：每一章必须有一个相对完整的段落结束，不要在句子中途断开。`;

    const userPrompt = `【小说信息】
标题：${title}
类型：${genre}
核心主题：${theme}

【故事架构】
世界观：${structure.worldSetting}
主要角色：
${structure.mainCharacters.map((c: { name: string; role: string; description: string; motivation: string }) => 
  `- ${c.name}（${c.role}）：${c.description}`
).join('\n')}

${isContinue ? `【当前已写正文（最后部分）】
${chapter.currentContent}` : `【上一章内容回顾】
${previousChapter ? `
章节：第 ${previousChapter.number} 章 ${previousChapter.title}
大纲：${previousChapter.outline}
${previousChapter.content ? `末尾内容（用于衔接）：\n...${previousChapter.content}` : ''}
` : '这是全书的第一章。'}`}

【本章创作任务】
章节：第 ${chapter.number} 章 ${chapter.title}
本章大纲：${chapter.outline}
${guidance ? `特别要求：${guidance}` : ''}

请开始${isContinue ? '续写' : '创作'}第 ${chapter.number} 章的正文${isContinue ? '' : '，确保开头与上一章末尾完美衔接'}：`;

    const stream = await streamChatCompletion([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ], {
      model: DEEPSEEK_MODELS.reasoner, // 切换到推理模型，支持更长输出和更强逻辑
      max_tokens: 8192 // 设置最大输出长度为 8K
    });

    // Create a TransformStream to convert DeepSeek/OpenAI format to the custom format expected by the frontend
    // Frontend expects: data: {"content": "..."}
    // DeepSeek returns: data: {"choices":[{"delta":{"content":"..."}}]}
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk);
        const lines = text.split('\n');
        
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;
          
          const data = trimmed.slice(6);
          if (data === '[DONE]') {
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              // Re-format to what the frontend expects
              const payload = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    });

    if (!stream) throw new Error('No stream returned');

    return new Response(stream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error generating chapter:', error);
    return Response.json(
      { error: '生成章节失败', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
