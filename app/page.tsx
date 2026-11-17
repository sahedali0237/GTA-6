import { AdSlot } from "@/components/AdSlot";
import { AffiliateGrid } from "@/components/AffiliateGrid";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Donation } from "@/components/Donation";
import { Faq } from "@/components/Faq";
import { Hero } from "@/components/Hero";
import { Newsletter } from "@/components/Newsletter";
import { Trailer } from "@/components/Trailer";

export default function Page() {
  return (
    <>
      <div id="top" className="flex flex-col">
        <Hero />

        <section
          id="chat"
          aria-label="GTA 6 AI chat"
          className="px-3 pb-12 sm:px-6"
        >
          <ChatWidget />
        </section>

        <AdSlot id="slot-leaderboard-a" size="leaderboard" />

        <AffiliateGrid />

        <Trailer />

        <Faq />

        <Newsletter />

        <AdSlot id="slot-rectangle-b" size="rectangle" />

        <Donation />
      </div>
    </>
  );
}
