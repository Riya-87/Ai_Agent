import React from 'react';
import { 
  Sparkles, 
  Search, 
  Calculator, 
  Clock, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Globe
} from 'lucide-react';

/**
 * Clean text by stripping raw markdown symbols (**bold**, *italic*, ### headers, etc.)
 */
function cleanRawText(str) {
  if (!str) return '';
  return str
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_{1,2}(.*?)_{1,2}/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/`{1,3}(.*?)`{1,3}/g, '$1')
    .trim();
}

/**
 * FramedMessage: Renders structured, elegant framed cards for AI responses without raw markdown clutter.
 */
export function FramedMessage({ text }) {
  if (!text) return null;

  const rawLines = text.split('\n').map(l => l.trim()).filter(Boolean);

  let queryHeader = null;
  let queryType = 'search'; // 'search' | 'math' | 'date'
  let mainSummary = [];
  let sections = [];
  let sources = [];
  let mathSteps = [];
  let finalResult = null;

  let currentSection = null;

  for (let i = 0; i < rawLines.length; i++) {
    const line = rawLines[i];

    // 1. Detect Header Queries
    if (line.includes('Query Executed:') || line.startsWith('🔍') || line.startsWith('🧮') || line.startsWith('📅')) {
      const match = line.match(/(?:Query Executed:|Executed:)\s*['"]?([^'"]+)['"]?/i);
      const queryStr = match ? match[1] : line.replace(/^[🔍🧮📅]\s*/, '');
      
      if (line.includes('Math') || line.startsWith('🧮')) {
        queryType = 'math';
      } else if (line.includes('date') || line.includes('time') || line.startsWith('📅')) {
        queryType = 'date';
      } else {
        queryType = 'search';
      }
      queryHeader = queryStr;
      continue;
    }

    // 2. Detect Math Calculation Results
    if (line.startsWith('Final Result:')) {
      finalResult = line.replace('Final Result:', '').trim();
      continue;
    }
    if (/^\d+\.\s+/.test(line) && (line.includes('=') || line.includes('Multiplication:') || line.includes('Addition:'))) {
      mathSteps.push(cleanRawText(line));
      continue;
    }
    if (line.startsWith('Calculation Result:')) {
      finalResult = line.replace('Calculation Result:', '').trim();
      continue;
    }

    // 3. Detect Source links
    if (line.startsWith('Source:') || line.startsWith('source:')) {
      const url = line.replace(/^[Ss]ource:\s*/, '').trim();
      if (url) {
        sources.push(url);
      }
      continue;
    }

    // 4. Detect Section Headers (e.g. "Key Career Background & Achievements:", "Key Contributions:", etc.)
    if (/^[A-Za-z\s&–—]+:\s*$/.test(line) && !line.startsWith('•') && !line.startsWith('-')) {
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        title: cleanRawText(line.replace(':', '')),
        items: []
      };
      continue;
    }

    // 5. Detect Bullet Points (• or -)
    if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      const itemContent = line.replace(/^[•\-\*]\s*/, '').trim();
      
      // Check if it's a Source line inside bullet
      if (itemContent.startsWith('Source:')) {
        sources.push(itemContent.replace('Source:', '').trim());
        continue;
      }

      // Check if it has a label like "Background: ..."
      const labelMatch = itemContent.match(/^([A-Za-z\s&–—]+):\s*(.*)$/);
      const pointObj = labelMatch ? {
        label: cleanRawText(labelMatch[1]),
        content: cleanRawText(labelMatch[2])
      } : {
        label: null,
        content: cleanRawText(itemContent)
      };

      if (currentSection) {
        currentSection.items.push(pointObj);
      } else {
        if (!sections.length || sections[sections.length - 1].title !== 'Key Highlights') {
          sections.push({
            title: 'Key Highlights',
            items: [pointObj]
          });
        } else {
          sections[sections.length - 1].items.push(pointObj);
        }
      }
      continue;
    }

    // 6. Regular Paragraph Text
    if (!currentSection) {
      mainSummary.push(cleanRawText(line));
    } else {
      currentSection.items.push({
        label: null,
        content: cleanRawText(line)
      });
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  const hasStructuredContent = queryHeader || sections.length > 0 || mathSteps.length > 0 || finalResult;

  return (
    <div className="flex flex-col gap-2.5 w-full text-slate-200">
      {/* 1. Framed Query Header */}
      {queryHeader && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-[11px] font-mono shadow-sm">
          {queryType === 'math' ? (
            <Calculator className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          ) : queryType === 'date' ? (
            <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          ) : (
            <Search className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
          )}
          <span className="text-slate-400">Query:</span>
          <span className="text-white font-medium truncate">{queryHeader}</span>
        </div>
      )}

      {/* 2. Framed Lead Summary */}
      {mainSummary.length > 0 && (
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 leading-relaxed text-xs text-slate-100 shadow-sm space-y-2">
          {mainSummary.map((para, pIdx) => (
            <p key={pIdx}>{para}</p>
          ))}
        </div>
      )}

      {/* 3. Framed Math Calculation Steps */}
      {mathSteps.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5 shadow-sm">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px] mb-2">
            <Calculator className="w-3.5 h-3.5" />
            <span>Calculation Steps</span>
          </div>
          {mathSteps.map((step, sIdx) => (
            <div key={sIdx} className="font-mono text-slate-200 bg-black/40 px-2.5 py-1 rounded-lg border border-amber-500/20 text-[11px]">
              {step}
            </div>
          ))}
        </div>
      )}

      {/* Final Result Frame */}
      {finalResult && (
        <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
          <span className="text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Final Result
          </span>
          <span className="font-mono font-bold text-white text-sm bg-black/60 px-3 py-1 rounded-lg border border-emerald-500/40">
            {finalResult}
          </span>
        </div>
      )}

      {/* 4. Framed Structured Sections */}
      {sections.map((sec, sIdx) => (
        <div key={sIdx} className="rounded-xl border border-white/10 bg-white/[0.02] p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-neon-magenta font-bold text-xs">
            <Layers className="w-3.5 h-3.5" />
            <span>{sec.title}</span>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {sec.items.map((it, itIdx) => (
              <div 
                key={itIdx}
                className="p-2.5 rounded-lg bg-black/30 border border-white/5 text-xs leading-relaxed"
              >
                {it.label && (
                  <span className="font-bold text-cyan-300 block mb-0.5">
                    {it.label}
                  </span>
                )}
                <span className="text-slate-300">{it.content}</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* 5. Framed Sources & Citations */}
      {sources.length > 0 && (
        <div className="rounded-xl border border-sky-500/20 bg-sky-500/5 p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-sky-400 font-bold text-[11px]">
            <Globe className="w-3.5 h-3.5" />
            <span>Verified Sources & References</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {sources.map((src, srcIdx) => (
              <a
                key={srcIdx}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/50 hover:bg-sky-500/20 border border-sky-500/30 hover:border-sky-400 text-sky-300 text-[11px] font-mono transition-all truncate max-w-full"
              >
                <span className="truncate max-w-xs">{src.replace(/^https?:\/\/(www\.)?/, '')}</span>
                <ExternalLink className="w-3 h-3 flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Fallback for simple single-line messages */}
      {!hasStructuredContent && mainSummary.length === 0 && (
        <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 leading-relaxed text-xs text-slate-100">
          {cleanRawText(text)}
        </div>
      )}
    </div>
  );
}
