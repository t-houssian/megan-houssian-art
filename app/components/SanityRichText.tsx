import Link from 'next/link';
import { Fragment, ReactNode } from 'react';
import type { SanityRichTextBlock, SanityRichTextLinkMarkDef } from '../../lib/sanity-rich-text';

type SanityRichTextProps = {
  value: SanityRichTextBlock[];
  className?: string;
  paragraphClassName?: string;
};

const LINK_CLASS_NAME = 'underline text-olive hover:text-brown transition-colors';

const isLinkMarkDef = (value: unknown): value is SanityRichTextLinkMarkDef => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const markDef = value as Partial<SanityRichTextLinkMarkDef>;
  return markDef._type === 'link' && typeof markDef._key === 'string' && markDef._key.length > 0;
};

const getSafeHref = (href: unknown) => {
  if (typeof href !== 'string') {
    return '#';
  }

  const normalized = href.trim();
  if (!normalized) {
    return '#';
  }

  const lower = normalized.toLowerCase();
  if (lower.startsWith('javascript:')) {
    return '#';
  }

  return normalized;
};

const renderTextWithLineBreaks = (text: string) => {
  const lines = text.split('\n');

  return lines.map((line, index) => (
    <Fragment key={`line-${index}`}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
};

const wrapWithMarks = (
  content: ReactNode,
  marks: string[] | undefined,
  markDefsByKey: Map<string, SanityRichTextLinkMarkDef>
) => {
  if (!Array.isArray(marks) || marks.length === 0) {
    return content;
  }

  return marks.reduce<ReactNode>((node, markKey) => {
    const markDef = markDefsByKey.get(markKey);
    if (!markDef || markDef._type !== 'link') {
      return node;
    }

    const href = getSafeHref(markDef.href);
    if (href.startsWith('/') || href.startsWith('#')) {
      return (
        <Link href={href} className={LINK_CLASS_NAME}>
          {node}
        </Link>
      );
    }

    return (
      <a href={href} className={LINK_CLASS_NAME} target="_blank" rel="noreferrer">
        {node}
      </a>
    );
  }, content);
};

export default function SanityRichText({
  value,
  className = '',
  paragraphClassName = '',
}: SanityRichTextProps) {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {value
        .filter((block) => block?._type === 'block')
        .map((block, blockIndex, blocks) => {
          const markDefsByKey = new Map<string, SanityRichTextLinkMarkDef>();
          for (const markDef of block.markDefs ?? []) {
            if (isLinkMarkDef(markDef)) {
              const markKey = markDef._key;
              if (typeof markKey === 'string' && markKey.length > 0) {
                markDefsByKey.set(markKey, markDef);
              }
            }
          }

          const blockClasses = `${paragraphClassName} ${
            blockIndex < blocks.length - 1 ? 'mb-6' : ''
          }`.trim();

          return (
            <p key={block._key ?? `block-${blockIndex}`} className={blockClasses}>
              {(block.children ?? []).map((span, spanIndex) => {
                if (span._type !== 'span') {
                  return null;
                }

                const spanText = typeof span.text === 'string' ? span.text : '';
                const spanContent = renderTextWithLineBreaks(spanText);
                const wrappedContent = wrapWithMarks(spanContent, span.marks, markDefsByKey);

                return <Fragment key={span._key ?? `span-${spanIndex}`}>{wrappedContent}</Fragment>;
              })}
            </p>
          );
        })}
    </div>
  );
}
