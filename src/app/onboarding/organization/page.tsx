import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { OrganizationOnboardingForm } from "@/features/organizations/components/organization-onboarding-form";

export default async function OrganizationOnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect: redirectTo } = await searchParams;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");

  const organizations = await auth.api.listOrganizations({
    headers: await headers(),
  });
  if (organizations && organizations.length > 0) {
    redirect(redirectTo || "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <OrganizationOnboardingForm
        userName={session.user.name}
        redirectTo={redirectTo || "/dashboard"}
      />
    </div>
  );
}
