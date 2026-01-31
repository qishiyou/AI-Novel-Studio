
import { streamChatCompletion, DEEPSEEK_MODELS } from '@/lib/deepseek';

export async function POST(req: Request) {
  try {
    const { title, theme, genre, structure, chapter, wordsPerChapter, maxWords, previousChapter, guidance, strictMode } = await req.json();

    // Validate structure and characters
    if (!structure || !structure.mainCharacters || !Array.isArray(structure.mainCharacters)) {
      console.error('Invalid or missing characters in structure:', structure);
      throw new Error('故事架构中缺少角色信息，请先生成故事架构');
    }

    const systemPrompt = `你是一位专业的小说创作者。请根据小说大纲和上下文，创作第 ${chapter.number} 章的正文内容。
要求：
1. 严格遵循章节大纲，但可以在细节上进行发挥。
2. 描写生动细腻，注重环境渲染和心理刻画，对话自然流畅。
3. **情节衔接**：必须紧密衔接上一章的末尾内容。如果上一章在某个场景或对话中结束，本章应自然延续或从合理的时空跳转开始。
4. **字数控制**：本章正文字数**必须在 ${wordsPerChapter} 到 ${maxWords || wordsPerChapter * 1.5} 字之间**。
   - ${strictMode ? `这是一项硬性指标。如果情节不足以支撑该字数，请通过增加环境细节描写、人物内心独白、细腻的动作刻画以及生动的对话来丰富内容。严禁敷衍了事。` : `请尽量保证内容丰富且完整。`}
   - 如果内容过长，请在接近 ${maxWords || wordsPerChapter * 1.5} 字时寻找合适的切入点进行收尾。
5. **内容深度**：不要为了凑字数而重复，而是要深入挖掘角色的情感冲突和场景的氛围感。
6. **完整性**：每一章必须有一个相对完整的段落结束，不要在句子中途断开。
7. 直接输出正文内容，不要包含标题或其他解释性文字。`;

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

【上一章内容回顾】
${previousChapter ? `
章节：第 ${previousChapter.number} 章 ${previousChapter.title}
大纲：${previousChapter.outline}
${previousChapter.content ? `末尾内容（用于衔接）：\n...${previousChapter.content}` : ''}
` : '这是全书的第一章。'}

【本章创作任务】
章节：第 ${chapter.number} 章 ${chapter.title}
本章大纲：${chapter.outline}

请开始创作第 ${chapter.number} 章的正文，确保开头与上一章末尾完美衔接：`;

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
