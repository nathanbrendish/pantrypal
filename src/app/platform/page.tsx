import { getCommunityIntelligenceDashboardData } from "@/app/actions/community-intelligence";
import { CommunityIntelligenceDashboard } from "@/components/platform/community-intelligence-dashboard";
import { PageShell } from "@/components/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { requireSuperAdmin } from "@/lib/platform-auth";

export default async function PlatformPage() {
  await requireSuperAdmin();
  const data = await getCommunityIntelligenceDashboardData();

  return (
    <PageShell maxWidth="wide" className="pb-24">
      <PageHeader
        icon="🛡️"
        title="Platform"
        description="Community Food Intelligence moderation and platform statistics."
      />
      <CommunityIntelligenceDashboard data={data} />
    </PageShell>
  );
}
