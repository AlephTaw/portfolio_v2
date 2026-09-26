import Link from "next/link";
import { FiLogOut } from "react-icons/fi";
import portrait from "../../../../agent/public/assets/live-stats-profile.png";
import { adminLabelClass } from "./admin-styles";
import { IntegrationsSection } from "./integrations-section";
import { ProfileSection } from "./profile-section";

export function AdminContent({ showPortrait = true }: { showPortrait?: boolean }) {
  return (
    <div className="w-full">
      {showPortrait && <div className="mx-auto mb-10 size-24 overflow-hidden rounded-full border border-white/25 bg-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Steven Wilcox profile" className="size-full object-cover" src={portrait.src} />
      </div>}
      <ProfileSection />
      <IntegrationsSection />
      <section aria-labelledby="account-logout-heading" className="mx-auto mt-16 w-full max-w-2xl border-t border-white/20 pt-10 text-white">
        <p className={adminLabelClass}>Account</p>
        <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em]" id="account-logout-heading">Logout</h2>
        <Link
          className="mt-8 inline-flex items-center gap-3 rounded-lg border border-white/25 px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white transition-colors hover:border-white/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-white"
          href="/"
        >
          <FiLogOut aria-hidden="true" className="size-4" />
          Logout
        </Link>
      </section>
    </div>
  );
}
