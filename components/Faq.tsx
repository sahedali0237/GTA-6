import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQ_INTRO, FAQ_ITEMS } from "@/lib/faq-data";

// FAQPage JSON-LD generated from the exact same data that is rendered (spec §4.7).
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export function Faq() {
  const paragraphs = FAQ_INTRO.split("\n\n");

  return (
    <section
      aria-labelledby="faq-heading"
      className="mx-auto w-full max-w-[1100px] px-4 py-12 sm:px-6"
    >
      <div className="mx-auto max-w-[860px]">
        <h2 id="faq-heading" className="font-display text-3xl tracking-wide text-text sm:text-4xl">
          About GTA 6 &amp; <span className="text-gradient">FAQ</span>
        </h2>

        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
          {paragraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <h3 className="mt-10 text-lg font-semibold text-text">Frequently asked questions</h3>
        <Accordion type="single" collapsible className="mt-4">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem key={item.question} value={`faq-${index}`}>
              <AccordionTrigger>{item.question}</AccordionTrigger>
              <AccordionContent>{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </section>
  );
}
