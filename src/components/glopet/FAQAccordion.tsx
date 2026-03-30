import { ReactNode } from 'react';
import { PlusIcon } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

export type FAQAccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
  indexLabel?: string;
};

type FAQAccordionProps = {
  items: FAQAccordionItem[];
  defaultValue?: string;
  className?: string;
  itemClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
};

export function FAQAccordion({
  items,
  defaultValue,
  className,
  itemClassName,
  triggerClassName,
  contentClassName,
}: FAQAccordionProps) {
  const initialValue = defaultValue ?? items[0]?.id;

  return (
    <div className={cn('w-full max-w-3xl mx-auto', className)}>
      <Accordion type="single" defaultValue={initialValue} collapsible className="w-full">
        {items.map((item, index) => (
          <AccordionItem
            value={item.id}
            key={item.id}
            className={cn('last:border-b border-[#c7d5e1]', itemClassName)}
          >
            <AccordionTrigger
              className={cn(
                'group text-left overflow-hidden cursor-pointer hover:no-underline px-4 py-4 text-[#174470] [&>svg]:hidden',
                triggerClassName,
              )}
            >
              <div className="flex flex-1 items-start gap-3 md:gap-4">
                <p className="pt-1 font-mono text-[0.68rem] uppercase tracking-[0.16em] text-[#1a6ca2]/70">
                  {item.indexLabel ?? String(index + 1).padStart(2, '0')}
                </p>
                <div className="flex flex-1 items-start justify-between gap-4">
                  <h3 className="max-w-[18ch] uppercase text-[1.1rem] leading-[0.95] sm:text-2xl md:text-[2.25rem] lg:text-[2.8rem]">
                    {item.title}
                  </h3>
                  <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/20 text-[#1a6ca2] transition-transform duration-200 group-data-[state=open]:rotate-45">
                    <PlusIcon className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent
              className={cn('px-4 pb-5 pl-10 md:px-6 md:pb-6 md:pl-14', contentClassName)}
            >
              {item.content}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}